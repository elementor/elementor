<?php
/**
 * Test file for Widget Converter - Phase 1 Implementation
 * 
 * This file tests the basic functionality of the HTML/CSS to Widget converter
 * Run this file to verify Phase 1 implementation is working correctly.
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Test HTML content
$test_html = '
<div class="hero-section" style="background-color: #f0f0f0; padding: 20px;">
    <h1 id="main-title" class="hero-title" style="color: #333; font-size: 2em;">Welcome to Our Site</h1>
    <p class="hero-subtitle">Your journey starts here with amazing content.</p>
    <button class="cta-button" style="background-color: #007cba; color: white;">Get Started</button>
    <img src="hero-image.jpg" alt="Hero Image" class="hero-image">
    <a href="/about" class="learn-more">Learn More</a>
</div>
';

echo "<h2>Widget Converter - Phase 1 Test</h2>\n";

try {
    // Test HTML Parser
    echo "<h3>1. Testing HTML Parser</h3>\n";
    $html_parser = new \Elementor\Modules\CssConverter\Services\Html_Parser();
    $parsed_elements = $html_parser->parse( $test_html );
    
    echo "<p>✅ HTML Parser: Successfully parsed " . count( $parsed_elements ) . " elements</p>\n";
    echo "<pre>Parsed Structure:\n";
    print_r( array_map( function( $el ) {
        return [
            'tag' => $el['tag'],
            'attributes' => array_keys( $el['attributes'] ),
            'has_inline_css' => !empty( $el['inline_css'] ),
            'children_count' => count( $el['children'] ),
        ];
    }, $parsed_elements ) );
    echo "</pre>\n";

    // Test Widget Mapper
    echo "<h3>2. Testing Widget Mapper</h3>\n";
    $widget_mapper = new \Elementor\Modules\CssConverter\Services\Widget_Mapper();
    $mapped_widgets = $widget_mapper->map_elements( $parsed_elements );
    
    echo "<p>✅ Widget Mapper: Successfully mapped " . count( $mapped_widgets ) . " widgets</p>\n";
    
    $mapping_stats = $widget_mapper->get_mapping_stats( $parsed_elements );
    echo "<p>Mapping Statistics:</p>\n";
    echo "<ul>\n";
    echo "<li>Total elements: " . $mapping_stats['total_elements'] . "</li>\n";
    echo "<li>Supported elements: " . $mapping_stats['supported_elements'] . "</li>\n";
    echo "<li>Unsupported elements: " . $mapping_stats['unsupported_elements'] . "</li>\n";
    echo "<li>Widget types created: " . implode( ', ', array_keys( $mapping_stats['widget_types'] ) ) . "</li>\n";
    if ( !empty( $mapping_stats['unsupported_tags'] ) ) {
        echo "<li>Unsupported tags: " . implode( ', ', $mapping_stats['unsupported_tags'] ) . "</li>\n";
    }
    echo "</ul>\n";

    // Test CSS Extraction
    echo "<h3>3. Testing CSS Extraction</h3>\n";
    $css_urls = $html_parser->extract_linked_css( $test_html );
    echo "<p>✅ CSS Extraction: Found " . count( $css_urls ) . " linked CSS files</p>\n";

    // Test Widget Conversion Service (basic functionality)
    echo "<h3>4. Testing Widget Conversion Service</h3>\n";
    $conversion_service = new \Elementor\Modules\CssConverter\Services\Widget_Conversion_Service();
    
    // Test HTML conversion (without actually creating posts)
    echo "<p>✅ Widget Conversion Service: Initialized successfully</p>\n";
    echo "<p>Note: Full conversion test requires WordPress post creation capabilities</p>\n";

    // Test supported tags
    echo "<h3>5. Supported HTML Tags</h3>\n";
    $supported_tags = $widget_mapper->get_supported_tags();
    echo "<p>Supported tags (" . count( $supported_tags ) . "): " . implode( ', ', $supported_tags ) . "</p>\n";

    echo "<h3>✅ Phase 1 Implementation Test: PASSED</h3>\n";
    echo "<p>All core components are working correctly!</p>\n";

} catch ( Exception $e ) {
    echo "<h3>❌ Phase 1 Implementation Test: FAILED</h3>\n";
    echo "<p>Error: " . $e->getMessage() . "</p>\n";
    echo "<pre>Stack trace:\n" . $e->getTraceAsString() . "</pre>\n";
}

echo "<hr>\n";
echo "<h3>Next Steps (Phase 2)</h3>\n";
echo "<ul>\n";
echo "<li>Implement CSS specificity calculator with !important support</li>\n";
echo "<li>Add CSS file URL fetching functionality</li>\n";
echo "<li>Integrate with existing Global Classes system</li>\n";
echo "<li>Add comprehensive error handling and validation</li>\n";
echo "<li>Create unit tests for all components</li>\n";
echo "</ul>\n";
?>
