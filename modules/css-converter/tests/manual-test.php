<?php
namespace Elementor\Modules\CssConverter\Tests;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../parsers/css-parser.php';
use Elementor\Modules\CssConverter\Parsers\CssParser;

function test_css_sample( $description, $css ) {
	echo "\n" . str_repeat( "=", 60 ) . "\n";
	echo "TEST: $description\n";
	echo str_repeat( "=", 60 ) . "\n";
	
	try {
		$parser = new CssParser();
		$parsed = $parser->parse( $css );
		$classes = $parser->extract_classes( $parsed );
		$variables = $parser->extract_variables( $parsed );
		$unsupported = $parser->extract_unsupported( $parsed );
		$summary = $parser->get_conversion_summary( $parsed );

		echo "INPUT CSS:\n" . trim( $css ) . "\n\n";
		
		echo "CONVERSION SUMMARY:\n";
		echo "  Classes found: " . $summary['classes']['count'] . "\n";
		echo "  Variables found: " . $summary['variables']['count'] . "\n";
		echo "  Has unsupported CSS: " . ( $summary['unsupported']['has_content'] ? 'Yes' : 'No' ) . "\n";
		echo "  Original size: " . $summary['stats']['original_size'] . " bytes\n\n";
		
		if ( ! empty( $classes ) ) {
			echo "EXTRACTED CLASSES:\n";
			foreach ( $classes as $class_name => $class_data ) {
				echo "  .$class_name:\n";
				foreach ( $class_data['rules'] as $property => $rule_data ) {
					$important = $rule_data['important'] ? ' !important' : '';
					echo "    $property: {$rule_data['value']}$important\n";
				}
				echo "\n";
			}
		}
		
		if ( ! empty( $variables ) ) {
			echo "EXTRACTED VARIABLES:\n";
			foreach ( $variables as $var_name => $var_data ) {
				echo "  {$var_data['name']}: {$var_data['value']} (scope: {$var_data['scope']})\n";
			}
			echo "\n";
		}
		
		if ( ! empty( $unsupported ) ) {
			echo "UNSUPPORTED CSS (fallback to HTML widget):\n";
			echo trim( $unsupported ) . "\n\n";
		}
		
		echo "✓ Test completed successfully\n";
		
	} catch ( Exception $e ) {
		echo "✗ Test failed: " . $e->getMessage() . "\n";
		if ( method_exists( $e, 'getTraceAsString' ) ) {
			echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
		}
	}
}

// Test 1: Bootstrap Button Classes
test_css_sample( "Bootstrap Button Classes", "
.btn {
    display: inline-block;
    padding: 0.375rem 0.75rem;
    margin-bottom: 0;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    text-align: center;
    text-decoration: none;
    vertical-align: middle;
    cursor: pointer;
    border: 1px solid transparent;
    border-radius: 0.25rem;
}

.btn-primary {
    color: #fff;
    background-color: #007bff;
    border-color: #007bff;
}

.btn:hover {
    text-decoration: none;
}
" );

// Test 2: CSS Variables & Complex Selectors
test_css_sample( "CSS Variables & Complex Selectors", "
:root {
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --font-size-large: 18px;
    --spacing-unit: 8px;
}

.card {
    background-color: var(--primary-color);
    font-size: var(--font-size-large);
    padding: calc(var(--spacing-unit) * 2);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card .title {
    font-weight: bold;
    margin-bottom: 10px;
    color: var(--secondary-color);
}

.card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
    .card {
        padding: var(--spacing-unit);
        font-size: 16px;
    }
}
" );

// Test 3: Tailwind CSS Utilities
test_css_sample( "Tailwind CSS Utilities", "
.bg-blue-500 {
    background-color: #3b82f6;
}

.text-white {
    color: #ffffff;
}

.p-4 {
    padding: 1rem;
}

.rounded-lg {
    border-radius: 0.5rem;
}

.shadow-md {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.hover\\:bg-blue-600:hover {
    background-color: #2563eb;
}

.md\\:p-6 {
    padding: 1.5rem;
}

@media (min-width: 768px) {
    .md\\:p-6 {
        padding: 1.5rem;
    }
}
" );

// Test 4: CSS Grid & Flexbox
test_css_sample( "CSS Grid & Flexbox Layout", "
.container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

.grid-item {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
    border-radius: 12px;
    color: white;
}

.flex-item {
    flex: 1 1 auto;
    margin: 0.5rem;
}
" );

// Test 5: Animation & Keyframes
test_css_sample( "Animations & Keyframes", "
.animated-button {
    background-color: #4caf50;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.pulse {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.05);
        opacity: 0.8;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes slideIn {
    from {
        transform: translateX(-100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
" );

// Test 6: Complex Selectors & Pseudo-elements
test_css_sample( "Complex Selectors & Pseudo-elements", "
.navigation {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
}

.navigation li {
    position: relative;
}

.navigation a {
    display: block;
    padding: 1rem;
    text-decoration: none;
    color: #333;
}

.navigation a:hover {
    background-color: #f0f0f0;
}

.navigation a::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background-color: #007bff;
    transition: width 0.3s ease;
}

.navigation a:hover::before {
    width: 100%;
}

.dropdown:hover .dropdown-menu {
    display: block;
}
" );

// Test 7: CSS Custom Properties with Calculations
test_css_sample( "Advanced CSS Custom Properties", "
:root {
    --base-font-size: 16px;
    --scale-ratio: 1.25;
    --primary-hue: 220;
    --primary-saturation: 70%;
    --primary-lightness: 50%;
    --primary-color: hsl(var(--primary-hue), var(--primary-saturation), var(--primary-lightness));
    --primary-dark: hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) - 20%));
}

.heading-large {
    font-size: calc(var(--base-font-size) * var(--scale-ratio) * var(--scale-ratio));
    color: var(--primary-color);
    margin-bottom: calc(var(--base-font-size) * 0.75);
}

.button-primary {
    background-color: var(--primary-color);
    border: 2px solid var(--primary-dark);
    color: white;
    padding: calc(var(--base-font-size) * 0.5) calc(var(--base-font-size) * 1);
    border-radius: calc(var(--base-font-size) * 0.25);
}
" );

echo "\n" . str_repeat( "=", 60 ) . "\n";
echo "Manual testing completed!\n";
echo "To run comprehensive unit tests, use: wp elementor css-parser-test\n";
echo str_repeat( "=", 60 ) . "\n"; 