/**
 * Property-based tests for geminiVisionService
 * Feature: template-auto-mapping
 * 
 * Uses fast-check for property-based testing
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  normalizeCoordinate,
  validateElementType,
  parseVisionResponse,
  VALID_ELEMENT_TYPES
} from './geminiVisionService.js'

describe('geminiVisionService', () => {
  /**
   * Property 1: Coordinate Normalization Bounds
   * For any JSON response from Gemini Vision containing element coordinates,
   * all coordinate values (top, left, width, height) SHALL be within the range [0, 1000] after parsing.
   * 
   * **Feature: template-auto-mapping, Property 1: Coordinate Normalization Bounds**
   * **Validates: Requirements 1.3**
   */
  describe('Property 1: Coordinate Normalization Bounds', () => {
    it('normalizeCoordinate always returns values in [0, 1000] for any number input', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -1e10, max: 1e10, noNaN: false }),
          (value) => {
            const result = normalizeCoordinate(value)
            return result >= 0 && result <= 1000
          }
        ),
        { numRuns: 100 }
      )
    })

    it('normalizeCoordinate returns 0 for NaN and non-number inputs', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(NaN),
            fc.constant(undefined),
            fc.constant(null),
            fc.string(),
            fc.array(fc.integer()),
            fc.object()
          ),
          (value) => {
            const result = normalizeCoordinate(value)
            return result === 0
          }
        ),
        { numRuns: 100 }
      )
    })

    it('parseVisionResponse normalizes all coordinates to [0, 1000] for any element', () => {
      // Generator for raw Gemini-like response with arbitrary coordinate values
      const coordinateGen = fc.double({ min: -1e6, max: 1e6, noNaN: true })
      const hexColorGen = fc.tuple(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 })
      ).map(([r, g, b]) => `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`)
      
      const elementGen = fc.record({
        id: fc.string(),
        type: fc.string(),
        coordinates: fc.record({
          top: coordinateGen,
          left: coordinateGen,
          width: coordinateGen,
          height: coordinateGen
        }),
        style: fc.record({
          color: hexColorGen,
          align: fc.constantFrom('left', 'center', 'right', 'invalid')
        }),
        confidence: fc.double({ min: -1, max: 2 })
      })

      const responseGen = fc.record({
        slide_metadata: fc.record({
          aspect_ratio: fc.constantFrom('16:9', '4:3', '1:1')
        }),
        elements: fc.array(elementGen, { minLength: 0, maxLength: 10 })
      })

      fc.assert(
        fc.property(responseGen, (rawResponse) => {
          const parsed = parseVisionResponse(rawResponse)
          
          // All elements should have coordinates in valid range
          return parsed.elements.every(element => {
            const { top, left, width, height } = element.coordinates
            return (
              top >= 0 && top <= 1000 &&
              left >= 0 && left <= 1000 &&
              width >= 0 && width <= 1000 &&
              height >= 0 && height <= 1000
            )
          })
        }),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Property 2: Valid Element Classification
   * For any element detected by the Vision_Service, its type classification 
   * SHALL be exactly one of: TITLE, SUBTITLE, BODY, FOOTER, IMAGE_HOLDER, CHART_AREA, or UNKNOWN.
   * 
   * **Feature: template-auto-mapping, Property 2: Valid Element Classification**
   * **Validates: Requirements 2.1**
   */
  describe('Property 2: Valid Element Classification', () => {
    it('validateElementType always returns a valid element type for any string input', () => {
      fc.assert(
        fc.property(fc.string(), (type) => {
          const result = validateElementType(type)
          return VALID_ELEMENT_TYPES.includes(result)
        }),
        { numRuns: 100 }
      )
    })

    it('validateElementType returns UNKNOWN for non-string inputs', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer(),
            fc.constant(null),
            fc.constant(undefined),
            fc.array(fc.string()),
            fc.object()
          ),
          (value) => {
            const result = validateElementType(value)
            return result === 'UNKNOWN'
          }
        ),
        { numRuns: 100 }
      )
    })

    it('parseVisionResponse assigns valid element types to all elements', () => {
      const elementGen = fc.record({
        id: fc.string(),
        type: fc.oneof(
          fc.constantFrom(...VALID_ELEMENT_TYPES),
          fc.string(), // Random invalid types
          fc.constant(null),
          fc.constant(undefined)
        ),
        coordinates: fc.record({
          top: fc.integer({ min: 0, max: 1000 }),
          left: fc.integer({ min: 0, max: 1000 }),
          width: fc.integer({ min: 0, max: 1000 }),
          height: fc.integer({ min: 0, max: 1000 })
        })
      })

      const responseGen = fc.record({
        elements: fc.array(elementGen, { minLength: 0, maxLength: 10 })
      })

      fc.assert(
        fc.property(responseGen, (rawResponse) => {
          const parsed = parseVisionResponse(rawResponse)
          
          return parsed.elements.every(element => 
            VALID_ELEMENT_TYPES.includes(element.type)
          )
        }),
        { numRuns: 100 }
      )
    })
  })
})
