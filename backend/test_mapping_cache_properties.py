"""
Property-Based Tests for MappingCache

**Feature: template-auto-mapping, Property 7: Template Hash Uniqueness and Cache Persistence**
**Validates: Requirements 4.1, 4.2**

Properties tested:
1. Hash determinism: same file → same hash
2. Hash uniqueness: different files → different hashes (with high probability)
3. Cache persistence: after save, mapping can be retrieved
4. Cache retrieval: subsequent loads return cached data without re-analysis
"""

import os
import sys
import tempfile
import sqlite3

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from hypothesis import given, strategies as st, settings, assume
from mapping_cache import MappingCache


# Strategy for generating random byte sequences (simulating PPTX content)
pptx_bytes_strategy = st.binary(min_size=1, max_size=10000)

# Strategy for generating element data (without id - will be added with unique index)
element_base_strategy = st.fixed_dictionaries({
    'type': st.sampled_from(['TITLE', 'SUBTITLE', 'BODY', 'FOOTER', 'IMAGE_HOLDER', 'CHART_AREA', 'UNKNOWN']),
    'shapeId': st.integers(min_value=1, max_value=1000),
    'coordinates': st.fixed_dictionaries({
        'top': st.integers(min_value=0, max_value=1000),
        'left': st.integers(min_value=0, max_value=1000),
        'width': st.integers(min_value=1, max_value=1000),
        'height': st.integers(min_value=1, max_value=1000)
    }),
    'style': st.fixed_dictionaries({
        'color': st.from_regex(r'#[0-9A-Fa-f]{6}', fullmatch=True),
        'align': st.sampled_from(['left', 'center', 'right'])
    }),
    'userCorrected': st.booleans()
})


def add_unique_ids(elements: list) -> list:
    """Add unique IDs to elements to satisfy database UNIQUE constraint"""
    return [{'id': f'element_{i}', **elem} for i, elem in enumerate(elements)]


# Strategy for generating mapping data with unique element IDs
@st.composite
def mapping_strategy(draw):
    """Generate mapping with unique element IDs"""
    elements = draw(st.lists(element_base_strategy, min_size=1, max_size=10))
    return {'elements': add_unique_ids(elements)}


class TestHashDeterminism:
    """
    Property 7.1: Hash Determinism
    
    *For any* PPTX file bytes, calling generate_template_hash multiple times
    SHALL always produce the same hash value.
    """
    
    @given(pptx_bytes=pptx_bytes_strategy)
    @settings(max_examples=100)
    def test_hash_determinism(self, pptx_bytes: bytes):
        """Same file content should always produce the same hash"""
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as f:
            db_path = f.name
        
        try:
            cache = MappingCache(db_path=db_path)
            
            # Generate hash multiple times
            hash1 = cache.generate_template_hash(pptx_bytes)
            hash2 = cache.generate_template_hash(pptx_bytes)
            hash3 = cache.generate_template_hash(pptx_bytes)
            
            # All hashes should be identical
            assert hash1 == hash2, f"Hash mismatch: {hash1} != {hash2}"
            assert hash2 == hash3, f"Hash mismatch: {hash2} != {hash3}"
            
            # Hash should be a valid SHA-256 hex string (64 characters)
            assert len(hash1) == 64, f"Hash length should be 64, got {len(hash1)}"
            assert all(c in '0123456789abcdef' for c in hash1), "Hash should be hexadecimal"
            
        finally:
            if os.path.exists(db_path):
                os.unlink(db_path)


class TestHashUniqueness:
    """
    Property 7.2: Hash Uniqueness
    
    *For any* two different PPTX file byte sequences, the generated hashes
    SHALL be different (with high probability due to SHA-256 collision resistance).
    """
    
    @given(
        pptx_bytes1=pptx_bytes_strategy,
        pptx_bytes2=pptx_bytes_strategy
    )
    @settings(max_examples=100)
    def test_hash_uniqueness(self, pptx_bytes1: bytes, pptx_bytes2: bytes):
        """Different file contents should produce different hashes"""
        # Skip if bytes are identical
        assume(pptx_bytes1 != pptx_bytes2)
        
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as f:
            db_path = f.name
        
        try:
            cache = MappingCache(db_path=db_path)
            
            hash1 = cache.generate_template_hash(pptx_bytes1)
            hash2 = cache.generate_template_hash(pptx_bytes2)
            
            # Different content should produce different hashes
            assert hash1 != hash2, f"Hash collision detected for different content"
            
        finally:
            if os.path.exists(db_path):
                os.unlink(db_path)


class TestCachePersistence:
    """
    Property 7.3: Cache Persistence
    
    *For any* valid mapping saved to the cache, the mapping SHALL be
    retrievable from the database with all data intact.
    """
    
    @given(
        pptx_bytes=pptx_bytes_strategy,
        mapping=mapping_strategy()
    )
    @settings(max_examples=100)
    def test_cache_persistence_round_trip(self, pptx_bytes: bytes, mapping: dict):
        """Saved mappings should be retrievable with all data intact"""
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as f:
            db_path = f.name
        
        try:
            cache = MappingCache(db_path=db_path)
            
            # Generate hash and save mapping
            template_hash = cache.generate_template_hash(pptx_bytes)
            cache.save_mapping(
                template_hash=template_hash,
                mapping=mapping,
                template_name="Test Template"
            )
            
            # Retrieve mapping
            retrieved = cache.get_cached_mapping(template_hash)
            
            # Verify retrieval was successful
            assert retrieved is not None, "Mapping should be retrievable after save"
            assert retrieved['templateHash'] == template_hash
            assert retrieved['source'] == 'cache'
            assert len(retrieved['elements']) == len(mapping['elements'])
            
            # Verify each element was persisted correctly
            for original, retrieved_elem in zip(mapping['elements'], retrieved['elements']):
                assert retrieved_elem['id'] == original['id']
                assert retrieved_elem['type'] == original['type']
                assert retrieved_elem['shapeId'] == original['shapeId']
                assert retrieved_elem['coordinates'] == original['coordinates']
                
        finally:
            if os.path.exists(db_path):
                os.unlink(db_path)


class TestCacheRetrieval:
    """
    Property 7.4: Cache Retrieval Without Re-analysis
    
    *For any* template that has been analyzed and cached, subsequent loads
    of the same template (same hash) SHALL retrieve from cache.
    """
    
    @given(
        pptx_bytes=pptx_bytes_strategy,
        mapping=mapping_strategy()
    )
    @settings(max_examples=100)
    def test_cache_retrieval_consistency(self, pptx_bytes: bytes, mapping: dict):
        """Multiple retrievals should return consistent cached data"""
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as f:
            db_path = f.name
        
        try:
            cache = MappingCache(db_path=db_path)
            
            # Generate hash and save mapping
            template_hash = cache.generate_template_hash(pptx_bytes)
            cache.save_mapping(template_hash=template_hash, mapping=mapping)
            
            # Retrieve multiple times
            retrieved1 = cache.get_cached_mapping(template_hash)
            retrieved2 = cache.get_cached_mapping(template_hash)
            
            # Both retrievals should return the same data
            assert retrieved1 is not None
            assert retrieved2 is not None
            assert retrieved1['templateHash'] == retrieved2['templateHash']
            assert len(retrieved1['elements']) == len(retrieved2['elements'])
            
            # Verify template_exists also works
            assert cache.template_exists(template_hash) is True
            
        finally:
            if os.path.exists(db_path):
                os.unlink(db_path)
    
    @given(pptx_bytes=pptx_bytes_strategy)
    @settings(max_examples=100)
    def test_nonexistent_template_returns_none(self, pptx_bytes: bytes):
        """Querying for a non-existent template should return None"""
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as f:
            db_path = f.name
        
        try:
            cache = MappingCache(db_path=db_path)
            
            # Generate hash but don't save
            template_hash = cache.generate_template_hash(pptx_bytes)
            
            # Should return None for non-existent template
            retrieved = cache.get_cached_mapping(template_hash)
            assert retrieved is None, "Non-existent template should return None"
            
            # template_exists should also return False
            assert cache.template_exists(template_hash) is False
            
        finally:
            if os.path.exists(db_path):
                os.unlink(db_path)


class TestUserCorrectionPersistence:
    """
    **Feature: template-auto-mapping, Property 4: User Correction Persistence**
    **Validates: Requirements 2.5**
    
    *For any* user correction to an element's classification, if the same template
    (identified by hash) is loaded again, the corrected classification SHALL be
    returned instead of the original AI classification.
    """
    
    @given(
        pptx_bytes=pptx_bytes_strategy,
        mapping=mapping_strategy(),
        new_type=st.sampled_from(['TITLE', 'SUBTITLE', 'BODY', 'FOOTER', 'IMAGE_HOLDER', 'CHART_AREA'])
    )
    @settings(max_examples=100)
    def test_user_correction_persists_across_loads(self, pptx_bytes: bytes, mapping: dict, new_type: str):
        """
        User corrections should persist and be returned on subsequent loads.
        
        This test verifies that:
        1. A mapping can be saved with an initial element type
        2. The element type can be updated via user correction
        3. Subsequent loads return the corrected type, not the original
        4. The userCorrected flag is set to True
        """
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as f:
            db_path = f.name
        
        try:
            cache = MappingCache(db_path=db_path)
            
            # Generate hash and save initial mapping
            template_hash = cache.generate_template_hash(pptx_bytes)
            cache.save_mapping(template_hash=template_hash, mapping=mapping)
            
            # Get the first element's ID and original type
            first_element = mapping['elements'][0]
            element_id = first_element['id']
            original_type = first_element['type']
            
            # Skip if new_type is the same as original (no change to test)
            assume(new_type != original_type)
            
            # Apply user correction
            success = cache.update_element_type(
                template_hash=template_hash,
                element_id=element_id,
                new_type=new_type
            )
            
            assert success is True, "User correction should succeed"
            
            # Reload the mapping (simulating a new session)
            retrieved = cache.get_cached_mapping(template_hash)
            
            assert retrieved is not None, "Mapping should be retrievable after correction"
            
            # Find the corrected element
            corrected_element = None
            for elem in retrieved['elements']:
                if elem['id'] == element_id:
                    corrected_element = elem
                    break
            
            assert corrected_element is not None, f"Element {element_id} should exist in retrieved mapping"
            
            # Verify the correction persisted
            assert corrected_element['type'] == new_type, \
                f"Element type should be corrected to {new_type}, got {corrected_element['type']}"
            
            # Verify userCorrected flag is set
            assert corrected_element['userCorrected'] is True, \
                "userCorrected flag should be True after correction"
            
        finally:
            if os.path.exists(db_path):
                os.unlink(db_path)
    
    @given(
        pptx_bytes=pptx_bytes_strategy,
        mapping=mapping_strategy()
    )
    @settings(max_examples=100)
    def test_correction_to_nonexistent_element_fails(self, pptx_bytes: bytes, mapping: dict):
        """
        Attempting to correct a non-existent element should return False.
        """
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as f:
            db_path = f.name
        
        try:
            cache = MappingCache(db_path=db_path)
            
            # Generate hash and save mapping
            template_hash = cache.generate_template_hash(pptx_bytes)
            cache.save_mapping(template_hash=template_hash, mapping=mapping)
            
            # Try to update a non-existent element
            success = cache.update_element_type(
                template_hash=template_hash,
                element_id="nonexistent_element_xyz",
                new_type="TITLE"
            )
            
            assert success is False, "Correction to non-existent element should fail"
            
        finally:
            if os.path.exists(db_path):
                os.unlink(db_path)
    
    @given(
        pptx_bytes=pptx_bytes_strategy,
        mapping=mapping_strategy()
    )
    @settings(max_examples=100)
    def test_correction_to_nonexistent_template_fails(self, pptx_bytes: bytes, mapping: dict):
        """
        Attempting to correct an element in a non-existent template should return False.
        """
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as f:
            db_path = f.name
        
        try:
            cache = MappingCache(db_path=db_path)
            
            # Generate hash but DON'T save the mapping
            template_hash = cache.generate_template_hash(pptx_bytes)
            
            # Try to update an element in a non-existent template
            success = cache.update_element_type(
                template_hash=template_hash,
                element_id="element_0",
                new_type="TITLE"
            )
            
            assert success is False, "Correction to non-existent template should fail"
            
        finally:
            if os.path.exists(db_path):
                os.unlink(db_path)
    
    @given(
        pptx_bytes=pptx_bytes_strategy,
        mapping=mapping_strategy(),
        corrections=st.lists(
            st.sampled_from(['TITLE', 'SUBTITLE', 'BODY', 'FOOTER', 'IMAGE_HOLDER', 'CHART_AREA']),
            min_size=2,
            max_size=5
        )
    )
    @settings(max_examples=100)
    def test_multiple_corrections_last_one_wins(self, pptx_bytes: bytes, mapping: dict, corrections: list):
        """
        Multiple corrections to the same element should result in the last correction being persisted.
        """
        with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as f:
            db_path = f.name
        
        try:
            cache = MappingCache(db_path=db_path)
            
            # Generate hash and save mapping
            template_hash = cache.generate_template_hash(pptx_bytes)
            cache.save_mapping(template_hash=template_hash, mapping=mapping)
            
            # Get the first element's ID
            element_id = mapping['elements'][0]['id']
            
            # Apply multiple corrections
            for new_type in corrections:
                cache.update_element_type(
                    template_hash=template_hash,
                    element_id=element_id,
                    new_type=new_type
                )
            
            # Retrieve and verify the last correction persisted
            retrieved = cache.get_cached_mapping(template_hash)
            
            corrected_element = None
            for elem in retrieved['elements']:
                if elem['id'] == element_id:
                    corrected_element = elem
                    break
            
            assert corrected_element is not None
            assert corrected_element['type'] == corrections[-1], \
                f"Last correction ({corrections[-1]}) should persist, got {corrected_element['type']}"
            
        finally:
            if os.path.exists(db_path):
                os.unlink(db_path)


if __name__ == '__main__':
    import pytest
    pytest.main([__file__, '-v', '--tb=short'])
