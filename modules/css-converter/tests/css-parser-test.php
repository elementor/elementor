<?php
namespace Elementor\Modules\CssConverter\Tests;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../parsers/css-parser.php';
use Elementor\Modules\CssConverter\Parsers\CssParser;
use Elementor\Modules\CssConverter\Exceptions\CssParseException;

class CssParserTest {
	
	private $test_count = 0;
	private $passed_count = 0;
	private $failed_count = 0;

	public function run_all_tests() {
		$this->log( "Starting CSS Parser Tests..." );
		$this->log( str_repeat( "=", 50 ) );
		
		$this->test_simple_class_parsing();
		$this->test_complex_selectors();
		$this->test_css_variables();
		$this->test_shorthand_properties();
		$this->test_unsupported_rules();
		$this->test_empty_css();
		$this->test_malformed_css();
		$this->test_conversion_summary();
		$this->test_important_declarations();
		$this->test_bootstrap_sample();
		
		$this->log( str_repeat( "=", 50 ) );
		$this->log( "Test Results:" );
		$this->log( "Total: {$this->test_count}" );
		$this->log( "Passed: {$this->passed_count}" );
		$this->log( "Failed: {$this->failed_count}" );
		
		return $this->failed_count === 0;
	}

	public function test_simple_class_parsing() {
		$this->log( "\nTesting simple class parsing..." );
		
		$css = "
			.button {
				background-color: red;
				color: white;
				padding: 10px;
			}
			.header {
				font-size: 24px;
				margin-bottom: 20px;
			}
		";

		try {
			$parser = new CssParser();
			$parsed = $parser->parse( $css );
			$classes = $parser->extract_classes( $parsed );

			$this->assert( count( $classes ) === 2, "Should extract 2 classes" );
			$this->assert( isset( $classes['button'] ), "Should extract 'button' class" );
			$this->assert( isset( $classes['header'] ), "Should extract 'header' class" );
			$this->assert( 
				$classes['button']['rules']['background-color']['value'] === 'red', 
				"Should extract background-color property" 
			);
			$this->assert( 
				$classes['header']['rules']['font-size']['value'] === '24px', 
				"Should extract font-size property" 
			);
			
			$this->log( "✓ Simple class parsing test passed" );
		} catch ( Exception $e ) {
			$this->log( "✗ Simple class parsing test failed: " . $e->getMessage() );
		}
	}

	public function test_complex_selectors() {
		$this->log( "\nTesting complex selectors..." );
		
		$css = "
			.parent .child {
				color: blue;
			}
			.button:hover {
				background-color: darkred;
			}
			#header {
				width: 100%;
			}
			div.container {
				display: flex;
			}
		";

		try {
			$parser = new CssParser();
			$parsed = $parser->parse( $css );
			$classes = $parser->extract_classes( $parsed );
			$unsupported = $parser->extract_unsupported( $parsed );

			$this->assert( count( $classes ) === 0, "Should not extract complex selectors as simple classes" );
			$this->assert( ! empty( $unsupported ), "Should have unsupported CSS" );
			$this->assert( 
				strpos( $unsupported, '.parent .child' ) !== false, 
				"Should capture descendant selector" 
			);
			$this->assert( 
				strpos( $unsupported, ':hover' ) !== false, 
				"Should capture pseudo-class selector" 
			);
			
			$this->log( "✓ Complex selectors test passed" );
		} catch ( Exception $e ) {
			$this->log( "✗ Complex selectors test failed: " . $e->getMessage() );
		}
	}

	public function test_css_variables() {
		$this->log( "\nTesting CSS variables..." );
		
		$css = "
			:root {
				--primary-color: #007cba;
				--spacing: 20px;
				--font-family: 'Arial', sans-serif;
			}
			.button {
				background-color: var(--primary-color);
				margin: var(--spacing);
				font-family: var(--font-family);
			}
		";

		try {
			$parser = new CssParser();
			$parsed = $parser->parse( $css );
			$classes = $parser->extract_classes( $parsed );
			$variables = $parser->extract_variables( $parsed );

			$this->assert( isset( $classes['button'] ), "Should extract class with CSS variables" );
			$this->assert( 
				strpos( $classes['button']['rules']['background-color']['value'], 'var(--primary-color)' ) !== false, 
				"Should preserve CSS variable syntax" 
			);
			$this->assert( count( $variables ) === 3, "Should extract 3 CSS variables" );
			$this->assert( isset( $variables['--primary-color'] ), "Should extract --primary-color variable" );
			$this->assert( 
				$variables['--primary-color']['value'] === '#007cba', 
				"Should extract variable value correctly" 
			);
			
			$this->log( "✓ CSS variables test passed" );
		} catch ( Exception $e ) {
			$this->log( "✗ CSS variables test failed: " . $e->getMessage() );
		}
	}

	public function test_shorthand_properties() {
		$this->log( "\nTesting shorthand properties..." );
		
		$css = "
			.box {
				margin: 10px 20px 15px 5px;
				border: 1px solid black;
				background: red url(image.jpg) no-repeat center;
				font: bold 16px/1.5 'Arial', sans-serif;
			}
		";

		try {
			$parser = new CssParser();
			$parsed = $parser->parse( $css );
			$classes = $parser->extract_classes( $parsed );

			$this->assert( isset( $classes['box'] ), "Should extract class with shorthand properties" );
			$this->assert( 
				isset( $classes['box']['rules']['margin'] ), 
				"Should preserve margin shorthand" 
			);
			$this->assert( 
				isset( $classes['box']['rules']['border'] ), 
				"Should preserve border shorthand" 
			);
			$this->assert( 
				strpos( $classes['box']['rules']['background']['value'], 'url(image.jpg)' ) !== false, 
				"Should preserve background shorthand with URL" 
			);
			
			$this->log( "✓ Shorthand properties test passed" );
		} catch ( Exception $e ) {
			$this->log( "✗ Shorthand properties test failed: " . $e->getMessage() );
		}
	}

	public function test_unsupported_rules() {
		$this->log( "\nTesting unsupported rules..." );
		
		$css = "
			@media (max-width: 768px) {
				.responsive { display: none; }
			}
			@keyframes slide {
				from { left: 0; }
				to { left: 100px; }
			}
			@import url('fonts.css');
			.simple {
				color: red;
			}
		";

		try {
			$parser = new CssParser();
			$parsed = $parser->parse( $css );
			$classes = $parser->extract_classes( $parsed );
			$unsupported = $parser->extract_unsupported( $parsed );

			$this->assert( count( $classes ) === 1, "Should extract only simple class" );
			$this->assert( isset( $classes['simple'] ), "Should extract 'simple' class" );
			$this->assert( 
				strpos( $unsupported, '@media' ) !== false, 
				"Should capture media query as unsupported" 
			);
			$this->assert( 
				strpos( $unsupported, '@keyframes' ) !== false, 
				"Should capture keyframes as unsupported" 
			);
			
			$this->log( "✓ Unsupported rules test passed" );
		} catch ( Exception $e ) {
			$this->log( "✗ Unsupported rules test failed: " . $e->getMessage() );
		}
	}

	public function test_empty_css() {
		$this->log( "\nTesting empty CSS..." );
		
		try {
			$parser = new CssParser();
			$parsed = $parser->parse( "" );
			$this->log( "✗ Empty CSS test failed: Should throw exception" );
		} catch ( CssParseException $e ) {
			$this->assert( 
				strpos( $e->getMessage(), 'Empty CSS' ) !== false, 
				"Should throw appropriate exception for empty CSS" 
			);
			$this->log( "✓ Empty CSS test passed" );
		} catch ( Exception $e ) {
			$this->log( "✗ Empty CSS test failed: " . $e->getMessage() );
		}
	}

	public function test_malformed_css() {
		$this->log( "\nTesting malformed CSS..." );
		
		$malformed_css = "
			.button {
				color: red
				background-color: blue;
			}
			.invalid { color: ; }
		";

		try {
			$parser = new CssParser();
			
			// Should not throw exception due to lenient parsing
			$parsed = $parser->parse( $malformed_css );
			$classes = $parser->extract_classes( $parsed );
			
			$this->assert( 
				isset( $classes['button'] ) || isset( $classes['invalid'] ), 
				"Should handle malformed CSS gracefully" 
			);
			
			$this->log( "✓ Malformed CSS test passed" );
		} catch ( Exception $e ) {
			$this->log( "✗ Malformed CSS test failed: " . $e->getMessage() );
		}
	}

	public function test_conversion_summary() {
		$this->log( "\nTesting conversion summary..." );
		
		$css = "
			:root {
				--primary: blue;
			}
			.button { color: red; }
			.card { padding: 20px; }
			.parent .child { margin: 10px; }
			@media (max-width: 768px) {
				.responsive { display: none; }
			}
		";

		try {
			$parser = new CssParser();
			$parsed = $parser->parse( $css );
			$summary = $parser->get_conversion_summary( $parsed );

			$this->assert( $summary['classes']['count'] === 2, "Should count 2 simple classes" );
			$this->assert( $summary['variables']['count'] === 1, "Should count 1 CSS variable" );
			$this->assert( $summary['unsupported']['has_content'] === true, "Should detect unsupported content" );
			$this->assert( isset( $summary['stats'] ), "Should include parsing stats" );
			
			$this->log( "✓ Conversion summary test passed" );
		} catch ( Exception $e ) {
			$this->log( "✗ Conversion summary test failed: " . $e->getMessage() );
		}
	}

	public function test_important_declarations() {
		$this->log( "\nTesting !important declarations..." );
		
		$css = "
			.priority {
				color: red !important;
				background-color: blue;
				margin: 10px !important;
			}
		";

		try {
			$parser = new CssParser();
			$parsed = $parser->parse( $css );
			$classes = $parser->extract_classes( $parsed );

			$this->assert( isset( $classes['priority'] ), "Should extract class with !important rules" );
			$this->assert( 
				$classes['priority']['rules']['color']['important'] === true, 
				"Should detect !important on color" 
			);
			$this->assert( 
				$classes['priority']['rules']['background-color']['important'] === false, 
				"Should detect no !important on background-color" 
			);
			$this->assert( 
				$classes['priority']['rules']['margin']['important'] === true, 
				"Should detect !important on margin" 
			);
			
			$this->log( "✓ Important declarations test passed" );
		} catch ( Exception $e ) {
			$this->log( "✗ Important declarations test failed: " . $e->getMessage() );
		}
	}

	public function test_bootstrap_sample() {
		$this->log( "\nTesting Bootstrap sample..." );
		
		$css = "
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
		";

		try {
			$parser = new CssParser();
			$parsed = $parser->parse( $css );
			$classes = $parser->extract_classes( $parsed );
			$unsupported = $parser->extract_unsupported( $parsed );

			$this->assert( count( $classes ) === 2, "Should extract 2 Bootstrap classes" );
			$this->assert( isset( $classes['btn'] ), "Should extract 'btn' class" );
			$this->assert( isset( $classes['btn-primary'] ), "Should extract 'btn-primary' class" );
			$this->assert( 
				strpos( $unsupported, ':hover' ) !== false, 
				"Should capture hover state as unsupported" 
			);
			$this->assert( 
				count( $classes['btn']['rules'] ) > 10, 
				"Should extract all btn properties" 
			);
			
			$this->log( "✓ Bootstrap sample test passed" );
		} catch ( Exception $e ) {
			$this->log( "✗ Bootstrap sample test failed: " . $e->getMessage() );
		}
	}

	private function assert( $condition, $message ) {
		$this->test_count++;
		if ( $condition ) {
			$this->passed_count++;
		} else {
			$this->failed_count++;
			$this->log( "  ASSERTION FAILED: " . $message );
		}
	}

	private function log( $message ) {
		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			WP_CLI::log( $message );
		} else {
			echo $message . "\n";
		}
	}
}

// Test runner for WP-CLI
if ( defined( 'WP_CLI' ) && WP_CLI ) {
	WP_CLI::add_command( 'elementor css-parser-test', function() {
		$test = new CssParserTest();
		$success = $test->run_all_tests();
		
		if ( ! $success ) {
			WP_CLI::error( 'Some tests failed!' );
		} else {
			WP_CLI::success( 'All tests passed!' );
		}
	});
} 

if (php_sapi_name() === 'cli' && (!defined('WP_CLI') || !WP_CLI)) {
    try {
        echo "Running CssParserTest...\n";
        $test = new \Elementor\Modules\CssConverter\Tests\CssParserTest();
        $success = $test->run_all_tests();
        if (!$success) {
            exit(1);
        }
    } catch (\Throwable $e) {
        echo "Test runner error: " . $e->getMessage() . "\n";
        echo $e->getTraceAsString() . "\n";
        exit(1);
    }
} 