"""
Property-Based Tests for ShapeMatcher

**Feature: template-auto-mapping**

Properties tested:
- Property 5: EMU Conversion Proportionality
- Property 6: Optimal Shape Matching
- Property 2: Valid Element Classification
- Property 3: Metadata Priority in Classification
"""

import os
import sys
from typing import Optional

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from hypothesis import given, strategies as st, settings, assume
from shape_matcher import ShapeMatcher


# Standard PowerPoint slide dimensions in EMUs
# 16:9 aspect ratio: 9144000 x 5143500 EMUs
STANDARD_SLIDE_WIDTH = 9144000
STANDARD_SLIDE_HEIGHT = 5143500


# Strategies for generating test data
normalized_coord_strategy = st.integers(min_value=0, max_value=1000)
positive_dimension_strategy = st.integers(min_value=1, max_value=20000000)


class TestEMUConversionProportionality:
    """
    Property 5: EMU Conversion Proportionality
    
    **Validates: Requirements 3.2**
    
    *For any* normalized coordinate value `c` in range [0, 1000] and slide dimension `d` in EMUs,
    the converted EMU value SHALL equal `(c / 1000) * d`, maintaining proportional positioning.
    """
    
    @given(
        coord=normalized_coord_strategy,
        dimension=positive_dimension_strategy
    )
    @settings(max_examples=100)
    def test_emu_conversion_formula(self, coord: int, dimension: int):
        """
        **Feature: template-auto-mapping, Property 5: EMU Conversion Proportionality**
        
        Verify that normalize_to_emu correctly applies the formula: (coord / 1000) * dimension
        """
        matcher = ShapeMatcher(slide_width=STANDARD_SLIDE_WIDTH, slide_height=STANDARD_SLIDE_HEIGHT)
        
        result = matcher.normalize_to_emu(coord, dimension)
        expected = int((coord / 1000) * dimension)
        
        assert result == expected, f"EMU conversion failed: {result} != {expected} for coord={coord}, dimension={dimension}"
    
    @given(dimension=positive_dimension_strategy)
    @settings(max_examples=100)
    def test_emu_conversion_boundary_zero(self, dimension: int):
        """
        **Feature: template-auto-mapping, Property 5: EMU Conversion Proportionality**
        
        Coordinate 0 should always map to EMU 0
        """
        matcher = ShapeMatcher(slide_width=STANDARD_SLIDE_WIDTH, slide_height=STANDARD_SLIDE_HEIGHT)
        
        result = matcher.normalize_to_emu(0, dimension)
        
        assert result == 0, f"Coordinate 0 should map to EMU 0, got {result}"
    
    @given(dimension=positive_dimension_strategy)
    @settings(max_examples=100)
    def test_emu_conversion_boundary_max(self, dimension: int):
        """
        **Feature: template-auto-mapping, Property 5: EMU Conversion Proportionality**
        
        Coordinate 1000 should map to the full dimension
        """
        matcher = ShapeMatcher(slide_width=STANDARD_SLIDE_WIDTH, slide_height=STANDARD_SLIDE_HEIGHT)
        
        result = matcher.normalize_to_emu(1000, dimension)
        expected = dimension
        
        assert result == expected, f"Coordinate 1000 should map to {expected}, got {result}"
    
    @given(
        coord1=normalized_coord_strategy,
        coord2=normalized_coord_strategy,
        dimension=positive_dimension_strategy
    )
    @settings(max_examples=100)
    def test_emu_conversion_preserves_order(self, coord1: int, coord2: int, dimension: int):
        """
        **Feature: template-auto-mapping, Property 5: EMU Conversion Proportionality**
        
        If coord1 <= coord2, then emu1 <= emu2 (monotonicity)
        """
        matcher = ShapeMatcher(slide_width=STANDARD_SLIDE_WIDTH, slide_height=STANDARD_SLIDE_HEIGHT)
        
        emu1 = matcher.normalize_to_emu(coord1, dimension)
        emu2 = matcher.normalize_to_emu(coord2, dimension)
        
        if coord1 <= coord2:
            assert emu1 <= emu2, f"Order not preserved: coord1={coord1} -> {emu1}, coord2={coord2} -> {emu2}"
        else:
            assert emu1 >= emu2, f"Order not preserved: coord1={coord1} -> {emu1}, coord2={coord2} -> {emu2}"
    
    @given(
        coord=normalized_coord_strategy,
        dimension=positive_dimension_strategy
    )
    @settings(max_examples=100)
    def test_emu_conversion_proportionality(self, coord: int, dimension: int):
        """
        **Feature: template-auto-mapping, Property 5: EMU Conversion Proportionality**
        
        The ratio of the result to dimension should equal coord/1000
        """
        matcher = ShapeMatcher(slide_width=STANDARD_SLIDE_WIDTH, slide_height=STANDARD_SLIDE_HEIGHT)
        
        result = matcher.normalize_to_emu(coord, dimension)
        
        # Check proportionality: result/dimension ≈ coord/1000
        # Using integer math, we verify: result * 1000 is close to coord * dimension
        # Allow for rounding error due to integer truncation
        expected_product = coord * dimension
        actual_product = result * 1000
        
        # The difference should be at most 1000 (due to integer truncation)
        # Integer division truncates, so the maximum error is (dimension - 1) which
        # when multiplied by 1000 can reach up to 1000 for certain coord/dimension combinations
        diff = abs(expected_product - actual_product)
        assert diff <= 1000, f"Proportionality violated: diff={diff} for coord={coord}, dimension={dimension}"


if __name__ == '__main__':
    import pytest
    pytest.main([__file__, '-v', '--tb=short'])


# Mock shape class for testing
class MockShape:
    """Mock shape object simulating python-pptx shape"""
    def __init__(self, shape_id: int, left: int, top: int, width: int = 1000000, height: int = 500000):
        self.shape_id = shape_id
        self.left = left
        self.top = top
        self.width = width
        self.height = height


# Strategies for shape matching tests
shape_id_strategy = st.integers(min_value=1, max_value=10000)
emu_coord_strategy = st.integers(min_value=0, max_value=9144000)  # Max slide width

detection_type_strategy = st.sampled_from([
    'TITLE', 'SUBTITLE', 'BODY', 'FOOTER', 'IMAGE_HOLDER', 'CHART_AREA', 'UNKNOWN'
])


@st.composite
def mock_shape_strategy(draw, index=None):
    """Generate a mock shape with valid EMU coordinates"""
    # Use a unique shape_id based on index if provided, otherwise generate random
    shape_id = index if index is not None else draw(shape_id_strategy)
    return MockShape(
        shape_id=shape_id,
        left=draw(emu_coord_strategy),
        top=draw(st.integers(min_value=0, max_value=5143500)),  # Max slide height
        width=draw(st.integers(min_value=100000, max_value=5000000)),
        height=draw(st.integers(min_value=100000, max_value=3000000))
    )


@st.composite
def unique_shapes_strategy(draw, min_size=1, max_size=10):
    """Generate a list of shapes with unique shape_ids"""
    count = draw(st.integers(min_value=min_size, max_value=max_size))
    shapes = []
    for i in range(count):
        shape = MockShape(
            shape_id=i + 1,  # Unique IDs starting from 1
            left=draw(emu_coord_strategy),
            top=draw(st.integers(min_value=0, max_value=5143500)),
            width=draw(st.integers(min_value=100000, max_value=5000000)),
            height=draw(st.integers(min_value=100000, max_value=3000000))
        )
        shapes.append(shape)
    return shapes


@st.composite
def detection_strategy(draw):
    """Generate a detection with normalized coordinates (0-1000)"""
    return {
        'id': f'element_{draw(st.integers(min_value=1, max_value=1000))}',
        'type': draw(detection_type_strategy),
        'coordinates': {
            'left': draw(normalized_coord_strategy),
            'top': draw(normalized_coord_strategy),
            'width': draw(st.integers(min_value=1, max_value=1000)),
            'height': draw(st.integers(min_value=1, max_value=1000))
        }
    }


class TestOptimalShapeMatching:
    """
    Property 6: Optimal Shape Matching
    
    **Validates: Requirements 3.1, 3.3, 3.4, 3.5**
    
    *For any* set of shapes and Gemini detections:
    1. The Shape_Matcher SHALL calculate distances between all shape-detection pairs
    2. A shape SHALL be considered a match only if its distance is less than 10% of slide width
    3. When multiple shapes match a detection, the shape with minimum distance SHALL be selected
    4. The output SHALL be a dictionary mapping content types to their matched shape_ids
    """
    
    @given(
        shapes=unique_shapes_strategy(min_size=1, max_size=10),
        detections=st.lists(detection_strategy(), min_size=1, max_size=10)
    )
    @settings(max_examples=100)
    def test_matching_returns_dict(self, shapes, detections):
        """
        **Feature: template-auto-mapping, Property 6: Optimal Shape Matching**
        
        The output SHALL be a dictionary mapping content types to shape_ids
        """
        matcher = ShapeMatcher(slide_width=STANDARD_SLIDE_WIDTH, slide_height=STANDARD_SLIDE_HEIGHT)
        
        result = matcher.match_detections_to_shapes(shapes, detections)
        
        # Result should be a dictionary
        assert isinstance(result, dict), f"Result should be a dict, got {type(result)}"
        
        # All keys should be valid element types
        for key in result.keys():
            assert key in ShapeMatcher.VALID_ELEMENT_TYPES, f"Invalid element type: {key}"
        
        # All values should be shape_ids (integers)
        for value in result.values():
            assert isinstance(value, int), f"Shape ID should be int, got {type(value)}"
    
    @given(
        shapes=unique_shapes_strategy(min_size=1, max_size=10),
        detections=st.lists(detection_strategy(), min_size=1, max_size=10)
    )
    @settings(max_examples=100)
    def test_matching_respects_threshold(self, shapes, detections):
        """
        **Feature: template-auto-mapping, Property 6: Optimal Shape Matching**
        
        A shape SHALL be considered a match only if its distance is less than 10% of slide width
        """
        matcher = ShapeMatcher(slide_width=STANDARD_SLIDE_WIDTH, slide_height=STANDARD_SLIDE_HEIGHT)
        max_distance = STANDARD_SLIDE_WIDTH * ShapeMatcher.MATCH_THRESHOLD
        
        result = matcher.match_detections_to_shapes(shapes, detections)
        
        # For each match, verify that the matched shape has at least one detection
        # of that type where the distance is strictly less than threshold
        for detection_type, shape_id in result.items():
            # Find the shape with this ID
            matched_shape = None
            for shape in shapes:
                if shape.shape_id == shape_id:
                    matched_shape = shape
                    break
            
            if matched_shape is None:
                continue
            
            # Find the minimum distance among all detections of this type
            min_distance_for_type = float('inf')
            for detection in detections:
                if detection['type'] == detection_type:
                    distance = matcher.calculate_distance(matched_shape, detection['coordinates'])
                    min_distance_for_type = min(min_distance_for_type, distance)
            
            # The minimum distance should be strictly less than threshold
            # This verifies that there exists at least one valid detection that could have
            # caused this match (the actual matched detection must have distance < threshold)
            assert min_distance_for_type < max_distance, \
                f"Match distance {min_distance_for_type} should be strictly less than threshold {max_distance}"
    
    @given(
        shapes=unique_shapes_strategy(min_size=2, max_size=5),
        detection=detection_strategy()
    )
    @settings(max_examples=100)
    def test_matching_selects_minimum_distance(self, shapes, detection):
        """
        **Feature: template-auto-mapping, Property 6: Optimal Shape Matching**
        
        When multiple shapes match a detection, the shape with minimum distance SHALL be selected
        """
        matcher = ShapeMatcher(slide_width=STANDARD_SLIDE_WIDTH, slide_height=STANDARD_SLIDE_HEIGHT)
        max_distance = STANDARD_SLIDE_WIDTH * ShapeMatcher.MATCH_THRESHOLD
        
        # Calculate distances for all shapes
        distances = []
        for shape in shapes:
            dist = matcher.calculate_distance(shape, detection['coordinates'])
            if dist < max_distance:
                distances.append((shape.shape_id, dist))
        
        # If no shapes are within threshold, result should be empty
        result = matcher.match_detections_to_shapes(shapes, [detection])
        
        if not distances:
            # No matches expected
            assert detection['type'] not in result, \
                "Should not match when all shapes exceed threshold"
        else:
            # The matched shape should be the one with minimum distance
            if detection['type'] in result:
                matched_id = result[detection['type']]
                matched_distance = None
                for shape_id, dist in distances:
                    if shape_id == matched_id:
                        matched_distance = dist
                        break
                
                if matched_distance is not None:
                    min_distance = min(d for _, d in distances)
                    assert matched_distance == min_distance, \
                        f"Should select minimum distance shape: got {matched_distance}, expected {min_distance}"
    
    @given(shapes=unique_shapes_strategy(min_size=1, max_size=5))
    @settings(max_examples=100)
    def test_empty_detections_returns_empty_dict(self, shapes):
        """
        **Feature: template-auto-mapping, Property 6: Optimal Shape Matching**
        
        Empty detections should return empty dictionary
        """
        matcher = ShapeMatcher(slide_width=STANDARD_SLIDE_WIDTH, slide_height=STANDARD_SLIDE_HEIGHT)
        
        result = matcher.match_detections_to_shapes(shapes, [])
        
        assert result == {}, f"Empty detections should return empty dict, got {result}"
    
    @given(detections=st.lists(detection_strategy(), min_size=1, max_size=5))
    @settings(max_examples=100)
    def test_empty_shapes_returns_empty_dict(self, detections):
        """
        **Feature: template-auto-mapping, Property 6: Optimal Shape Matching**
        
        Empty shapes should return empty dictionary
        """
        matcher = ShapeMatcher(slide_width=STANDARD_SLIDE_WIDTH, slide_height=STANDARD_SLIDE_HEIGHT)
        
        result = matcher.match_detections_to_shapes([], detections)
        
        assert result == {}, f"Empty shapes should return empty dict, got {result}"



class MockShapeWithPlaceholder:
    """Mock shape object with placeholder metadata"""
    def __init__(self, shape_id: int, left: int, top: int, width: int, height: int, 
                 placeholder_type: Optional[int] = None):
        self.shape_id = shape_id
        self.left = left
        self.top = top
        self.width = width
        self.height = height
        self._placeholder_type = placeholder_type
        
        # Create placeholder_format mock if type is provided
        if placeholder_type is not None:
            self.placeholder_format = type('PlaceholderFormat', (), {
                'type': type('PlaceholderType', (), {'value': placeholder_type})()
            })()
        else:
            self.placeholder_format = None


class TestValidElementClassification:
    """
    Property 2: Valid Element Classification
    
    **Validates: Requirements 2.1**
    
    *For any* element detected by the Vision_Service, its type classification SHALL be 
    exactly one of: TITLE, SUBTITLE, BODY, FOOTER, IMAGE_HOLDER, CHART_AREA, or UNKNOWN.
    """
    
    @given(
        left=st.integers(min_value=0, max_value=9144000),
        top=st.integers(min_value=0, max_value=5143500),
        width=st.integers(min_value=1, max_value=9144000),
        height=st.integers(min_value=1, max_value=5143500)
    )
    @settings(max_examples=100)
    def test_classification_returns_valid_type(self, left: int, top: int, width: int, height: int):
        """
        **Feature: template-auto-mapping, Property 2: Valid Element Classification**
        
        classify_by_geometry SHALL return exactly one of the valid element types
        """
        matcher = ShapeMatcher(slide_width=STANDARD_SLIDE_WIDTH, slide_height=STANDARD_SLIDE_HEIGHT)
        shape = MockShape(shape_id=1, left=left, top=top, width=width, height=height)
        
        result = matcher.classify_by_geometry(shape)
        
        assert result in ShapeMatcher.VALID_ELEMENT_TYPES, \
            f"Classification '{result}' is not a valid element type"
    
    @given(
        left=st.integers(min_value=0, max_value=9144000),
        top=st.integers(min_value=0, max_value=5143500),
        width=st.integers(min_value=1, max_value=9144000),
        height=st.integers(min_value=1, max_value=5143500)
    )
    @settings(max_examples=100)
    def test_classify_shape_returns_valid_type(self, left: int, top: int, width: int, height: int):
        """
        **Feature: template-auto-mapping, Property 2: Valid Element Classification**
        
        classify_shape SHALL return exactly one of the valid element types
        """
        matcher = ShapeMatcher(slide_width=STANDARD_SLIDE_WIDTH, slide_height=STANDARD_SLIDE_HEIGHT)
        shape = MockShapeWithPlaceholder(shape_id=1, left=left, top=top, width=width, height=height)
        
        result = matcher.classify_shape(shape)
        
        assert result in ShapeMatcher.VALID_ELEMENT_TYPES, \
            f"Classification '{result}' is not a valid element type"


class TestMetadataPriorityInClassification:
    """
    Property 3: Metadata Priority in Classification
    
    **Validates: Requirements 2.2, 2.3**
    
    *For any* PowerPoint shape with native placeholder_type metadata, the Shape_Matcher 
    SHALL use that metadata as the primary classification source. *For any* shape without 
    metadata, the classification SHALL be derived from geometric heuristics.
    """
    
    @given(
        left=st.integers(min_value=0, max_value=9144000),
        top=st.integers(min_value=0, max_value=5143500),
        width=st.integers(min_value=1, max_value=9144000),
        height=st.integers(min_value=1, max_value=5143500),
        placeholder_type=st.sampled_from([1, 2, 3, 4, 5, 18, 19])  # Valid PowerPoint placeholder types
    )
    @settings(max_examples=100)
    def test_metadata_takes_priority(self, left: int, top: int, width: int, height: int, placeholder_type: int):
        """
        **Feature: template-auto-mapping, Property 3: Metadata Priority in Classification**
        
        When a shape has placeholder metadata, classify_shape SHALL use it instead of geometry
        """
        matcher = ShapeMatcher(slide_width=STANDARD_SLIDE_WIDTH, slide_height=STANDARD_SLIDE_HEIGHT)
        
        # Create shape with placeholder metadata
        shape_with_metadata = MockShapeWithPlaceholder(
            shape_id=1, left=left, top=top, width=width, height=height,
            placeholder_type=placeholder_type
        )
        
        # Create identical shape without metadata
        shape_without_metadata = MockShapeWithPlaceholder(
            shape_id=2, left=left, top=top, width=width, height=height,
            placeholder_type=None
        )
        
        result_with_metadata = matcher.classify_shape(shape_with_metadata)
        result_without_metadata = matcher.classify_shape(shape_without_metadata)
        
        # Expected mapping from placeholder types
        expected_mapping = {
            1: 'TITLE',
            2: 'BODY',
            3: 'SUBTITLE',
            4: 'SUBTITLE',
            5: 'FOOTER',
            18: 'IMAGE_HOLDER',
            19: 'CHART_AREA',
        }
        
        expected_type = expected_mapping.get(placeholder_type)
        
        # Shape with metadata should return the mapped type
        assert result_with_metadata == expected_type, \
            f"Shape with placeholder_type={placeholder_type} should be '{expected_type}', got '{result_with_metadata}'"
        
        # Shape without metadata should use geometry (may differ from metadata result)
        assert result_without_metadata in ShapeMatcher.VALID_ELEMENT_TYPES, \
            f"Shape without metadata should return valid type, got '{result_without_metadata}'"
    
    @given(
        left=st.integers(min_value=0, max_value=9144000),
        top=st.integers(min_value=0, max_value=5143500),
        width=st.integers(min_value=1, max_value=9144000),
        height=st.integers(min_value=1, max_value=5143500)
    )
    @settings(max_examples=100)
    def test_geometry_fallback_when_no_metadata(self, left: int, top: int, width: int, height: int):
        """
        **Feature: template-auto-mapping, Property 3: Metadata Priority in Classification**
        
        When a shape has no placeholder metadata, classify_shape SHALL use geometric heuristics
        """
        matcher = ShapeMatcher(slide_width=STANDARD_SLIDE_WIDTH, slide_height=STANDARD_SLIDE_HEIGHT)
        
        # Create shape without metadata
        shape = MockShapeWithPlaceholder(
            shape_id=1, left=left, top=top, width=width, height=height,
            placeholder_type=None
        )
        
        result_classify_shape = matcher.classify_shape(shape)
        result_classify_geometry = matcher.classify_by_geometry(shape)
        
        # Without metadata, classify_shape should return same result as classify_by_geometry
        assert result_classify_shape == result_classify_geometry, \
            f"Without metadata, classify_shape ({result_classify_shape}) should equal classify_by_geometry ({result_classify_geometry})"
    
    @given(
        width_ratio=st.floats(min_value=0.51, max_value=0.99),
        top_ratio=st.floats(min_value=0.0, max_value=0.19)
    )
    @settings(max_examples=100)
    def test_title_classification_by_geometry(self, width_ratio: float, top_ratio: float):
        """
        **Feature: template-auto-mapping, Property 3: Metadata Priority in Classification**
        
        Shapes at top < 20% with width > 50% should be classified as TITLE
        """
        matcher = ShapeMatcher(slide_width=STANDARD_SLIDE_WIDTH, slide_height=STANDARD_SLIDE_HEIGHT)
        
        # Create shape in title position
        shape = MockShape(
            shape_id=1,
            left=int(STANDARD_SLIDE_WIDTH * 0.1),
            top=int(STANDARD_SLIDE_HEIGHT * top_ratio),
            width=int(STANDARD_SLIDE_WIDTH * width_ratio),
            height=int(STANDARD_SLIDE_HEIGHT * 0.1)
        )
        
        result = matcher.classify_by_geometry(shape)
        
        assert result == 'TITLE', \
            f"Shape at top={top_ratio:.2f} with width={width_ratio:.2f} should be TITLE, got {result}"
    
    @given(
        height_ratio=st.floats(min_value=0.01, max_value=0.14),
        bottom_ratio=st.floats(min_value=0.81, max_value=0.99)
    )
    @settings(max_examples=100)
    def test_footer_classification_by_geometry(self, height_ratio: float, bottom_ratio: float):
        """
        **Feature: template-auto-mapping, Property 3: Metadata Priority in Classification**
        
        Shapes at bottom > 80% with small height should be classified as FOOTER
        """
        matcher = ShapeMatcher(slide_width=STANDARD_SLIDE_WIDTH, slide_height=STANDARD_SLIDE_HEIGHT)
        
        # Calculate top position so that bottom is at bottom_ratio
        height = int(STANDARD_SLIDE_HEIGHT * height_ratio)
        top = int(STANDARD_SLIDE_HEIGHT * bottom_ratio) - height
        
        # Ensure top is valid
        if top < 0:
            top = 0
        
        shape = MockShape(
            shape_id=1,
            left=int(STANDARD_SLIDE_WIDTH * 0.1),
            top=top,
            width=int(STANDARD_SLIDE_WIDTH * 0.3),
            height=height
        )
        
        result = matcher.classify_by_geometry(shape)
        
        # Verify the shape is actually in footer position
        actual_bottom = (shape.top + shape.height) / STANDARD_SLIDE_HEIGHT
        actual_height_ratio = shape.height / STANDARD_SLIDE_HEIGHT
        
        if actual_bottom > 0.80 and actual_height_ratio < 0.15:
            assert result == 'FOOTER', \
                f"Shape at bottom={actual_bottom:.2f} with height_ratio={actual_height_ratio:.2f} should be FOOTER, got {result}"
