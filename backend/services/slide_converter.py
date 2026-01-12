"""
Slide to image conversion service.
"""
from utils.logging_utils import logger


def convert_slide_to_image(pptx_path: str, slide_index: int = 0) -> str:
    """
    Convert a specific slide to a base64 PNG image.
    Uses LibreOffice or custom renderer.
    
    Args:
        pptx_path: Path to the PPTX file
        slide_index: Index of the slide to convert (default: 0 for first slide)
        
    Returns:
        Base64 encoded PNG image with data URL prefix
    """
    try:
        from pptx_to_images import convert_pptx_to_images
        
        images = convert_pptx_to_images(pptx_path)
        if images and len(images) > slide_index:
            return images[slide_index]
    except Exception as e:
        logger.warning(f"LibreOffice conversion failed: {e}")
    
    # Fallback to custom renderer
    try:
        from pptx_to_images_custom import convert_pptx_to_images_custom
        
        images = convert_pptx_to_images_custom(pptx_path)
        if images and len(images) > slide_index:
            return images[slide_index]
    except Exception as e:
        logger.warning(f"Custom renderer failed: {e}")
    
    # Final fallback: generate placeholder
    from pptx_to_images import generate_placeholder_image
    return generate_placeholder_image(slide_index + 1)
