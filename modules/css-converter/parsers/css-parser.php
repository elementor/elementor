<?php
namespace Elementor\Modules\CssConverter\Parsers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Exceptions\CssParseException;
use Elementor\Modules\CssConverter\Parsers\ParsedCss;
use Sabberworm\CSS\Parser;
use Sabberworm\CSS\CSSList\Document;
use Sabberworm\CSS\Settings;

class CssParser {

	private $settings;
	private $charset;

	public function __construct( array $options = [] ) {
		// Ensure Sabberworm CSS Parser autoloader is registered
		$this->ensure_sabberworm_autoloader();
		
		$this->charset = $options['charset'] ?? 'utf-8';
		$this->settings = Settings::create()
			->withDefaultCharset( $this->charset )
			->withMultibyteSupport( true )
			->beStrict( false );
	}

	private function ensure_sabberworm_autoloader() {
		// 🔍 MAX DEBUG: Check if Sabberworm classes are already available
		error_log( "🔍 CSS PARSER: Checking for Sabberworm\\CSS\\Parser class" );
		
		if ( class_exists( 'Sabberworm\CSS\Parser' ) ) {
			error_log( "✅ CSS PARSER: Sabberworm\\CSS\\Parser class EXISTS" );
			return;
		}
		
		error_log( "⚠️ CSS PARSER: Sabberworm\\CSS\\Parser class NOT FOUND - attempting to load autoloader" );

		// Load the autoloader if classes are not available
		// First try the standard Elementor path
		$autoloader_path = ELEMENTOR_PATH . 'includes/libraries/sabberworm-css-parser/bootstrap.php';
		error_log( "🔍 CSS PARSER: Trying path 1: " . $autoloader_path );
		
		// If that doesn't exist, try the elementor-css plugin path (for custom installations)
		if ( ! file_exists( $autoloader_path ) ) {
			error_log( "❌ CSS PARSER: Path 1 NOT FOUND" );
			$elementor_css_path = WP_PLUGIN_DIR . '/elementor-css/includes/libraries/sabberworm-css-parser/bootstrap.php';
			error_log( "🔍 CSS PARSER: Trying path 2: " . $elementor_css_path );
			if ( file_exists( $elementor_css_path ) ) {
				$autoloader_path = $elementor_css_path;
				error_log( "✅ CSS PARSER: Path 2 FOUND" );
			}
		}
		
		// If still not found, try relative to current module (for elementor-css plugin)
		if ( ! file_exists( $autoloader_path ) ) {
			error_log( "❌ CSS PARSER: Path 2 NOT FOUND" );
			// From parsers/css-parser.php: __DIR__ = parsers/, up 3 = plugins/elementor-css/
			$relative_path = dirname( __DIR__, 3 ) . '/includes/libraries/sabberworm-css-parser/bootstrap.php';
			error_log( "🔍 CSS PARSER: Trying path 3 (fixed): " . $relative_path );
			if ( file_exists( $relative_path ) ) {
				$autoloader_path = $relative_path;
				error_log( "✅ CSS PARSER: Path 3 FOUND!" );
			}
		}
		
		// Last resort: try direct path for elementor-css plugin
		if ( ! file_exists( $autoloader_path ) ) {
			error_log( "❌ CSS PARSER: Path 3 NOT FOUND" );
			$direct_path = '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/includes/libraries/sabberworm-css-parser/bootstrap.php';
			error_log( "🔍 CSS PARSER: Trying path 4 (direct): " . $direct_path );
			if ( file_exists( $direct_path ) ) {
				$autoloader_path = $direct_path;
				error_log( "✅ CSS PARSER: Path 4 FOUND" );
			}
		}
		
		if ( file_exists( $autoloader_path ) ) {
			error_log( "✅ CSS PARSER: Loading autoloader from: " . $autoloader_path );
			require_once $autoloader_path;
			
			// Verify the class is now available
			if ( class_exists( 'Sabberworm\CSS\Parser' ) ) {
				error_log( "✅ CSS PARSER: Sabberworm\\CSS\\Parser class SUCCESSFULLY LOADED" );
			} else {
				error_log( "❌ CSS PARSER: CRITICAL - Autoloader loaded but class still not available!" );
			}
		} else {
			error_log( "🚨 CSS PARSER: CRITICAL ERROR - No Sabberworm autoloader found in any location!" );
			error_log( "🚨 CSS PARSER: Searched paths:" );
			error_log( "  1. " . ( ELEMENTOR_PATH ?? 'ELEMENTOR_PATH not defined' ) . 'includes/libraries/sabberworm-css-parser/bootstrap.php' );
			error_log( "  2. " . ( WP_PLUGIN_DIR ?? 'WP_PLUGIN_DIR not defined' ) . '/elementor-css/includes/libraries/sabberworm-css-parser/bootstrap.php' );
			error_log( "  3. " . dirname( __DIR__, 4 ) . '/includes/libraries/sabberworm-css-parser/bootstrap.php' );
			error_log( "  4. /Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/includes/libraries/sabberworm-css-parser/bootstrap.php" );
		}
	}

	public function parse( string $css ): ParsedCss {
		error_log( "🔍 CSS PARSER: parse() called with " . strlen( $css ) . " characters of CSS" );
		
		if ( empty( trim( $css ) ) ) {
			error_log( "⚠️ CSS PARSER: Empty CSS provided, returning empty ParsedCss" );
			// ✅ GRACEFUL HANDLING: Return empty ParsedCss instead of throwing exception
			// This allows HTML without CSS to be processed successfully
			$empty_document = new \Sabberworm\CSS\CSSList\Document();
			return new ParsedCss( $empty_document, '' );
		}

		error_log( "📝 CSS PARSER: CSS Content (first 200 chars): " . substr( $css, 0, 200 ) );
		
		try {
			// Check if Parser class exists before trying to instantiate
			if ( ! class_exists( 'Sabberworm\CSS\Parser' ) ) {
				error_log( "🚨 CSS PARSER: CRITICAL - Sabberworm\\CSS\\Parser class does not exist!" );
				error_log( "🚨 CSS PARSER: Cannot parse CSS without Sabberworm library" );
				throw new \Exception( "Sabberworm CSS Parser library not loaded" );
			}
			
			error_log( "✅ CSS PARSER: Creating Sabberworm Parser instance" );
			$parser = new Parser( $css, $this->settings );
			
			error_log( "✅ CSS PARSER: Parsing CSS..." );
			$document = $parser->parse();
			
			error_log( "✅ CSS PARSER: CSS parsed successfully" );
			return new ParsedCss( $document, $css );
		} catch ( \Exception $e ) {
			error_log( "❌ CSS PARSER: Parse FAILED - " . $e->getMessage() );
			error_log( "❌ CSS PARSER: Exception class: " . get_class( $e ) );
			error_log( "❌ CSS PARSER: File: " . $e->getFile() . ":" . $e->getLine() );
			throw new CssParseException( 'Failed to parse CSS: ' . $e->getMessage(), 0 );
		}
	}

	public function extract_variables( ParsedCss $parsed ): array {
		$variables = [];
		$this->extract_variables_recursive( $parsed->get_document(), $variables );
		return $variables;
	}

	private function extract_variables_recursive( $css_node, &$variables ) {
		if ( $css_node instanceof \Sabberworm\CSS\RuleSet\DeclarationBlock ) {
			$this->process_declaration_block( $css_node, function( $selector_string, $css_node ) use ( &$variables ) {
				if ( ! $this->is_root_selector( $selector_string ) ) {
					return;
				}
				
				foreach ( $css_node->getRules() as $rule ) {
					$property = $rule->getRule();
					if ( $this->is_css_variable( $property ) ) {
						$value = (string) $rule->getValue();
						$variables[ $property ] = [
							'name' => $property,
							'value' => $value,
							'scope' => $selector_string,
							'original_block' => $css_node->render( \Sabberworm\CSS\OutputFormat::create() ),
						];
					}
				}
			});
		}
		$this->process_node_contents_recursively( $css_node, 'extract_variables_recursive', $variables );
	}

	private function process_node_contents_recursively( $css_node, $method_name, &$collection ) {
		if ( ! method_exists( $css_node, 'getContents' ) ) {
			return;
		}
		foreach ( $css_node->getContents() as $content ) {
			$this->$method_name( $content, $collection );
		}
	}

	private function is_root_selector( string $selector ): bool {
		$trimmed = trim( $selector );
		return ':root' === $trimmed || 'html' === $trimmed;
	}
	
	private function is_css_variable( string $property ): bool {
		return 0 === strpos( $property, '--' );
	}

	public function extract_classes( ParsedCss $parsed ): array {
		$classes = [];
		$this->extract_classes_recursive( $parsed->get_document(), $classes );
		return $classes;
	}

	private function extract_classes_recursive( $css_node, &$classes ) {
		if ( $css_node instanceof \Sabberworm\CSS\RuleSet\DeclarationBlock ) {
			$this->process_declaration_block_for_classes( $css_node, $classes );
		}
		$this->process_node_contents_recursively( $css_node, 'extract_classes_recursive', $classes );
	}

	private function process_declaration_block_for_classes( $css_node, &$classes ) {
		foreach ( $css_node->getSelectors() as $selector ) {
			$selector_string = $selector->getSelector();
			
			if ( $this->is_simple_class_selector( $selector_string ) ) {
				$this->extract_properties_from_class( $css_node, $selector_string, $classes );
			}
		}
	}

	private function extract_properties_from_class( $css_node, $selector_string, &$classes ) {
		$properties = [];
		
		foreach ( $css_node->getRules() as $rule ) {
			$property = $rule->getRule();
			$value = (string) $rule->getValue();
			$properties[ $property ] = $value;
		}

		$classes[] = [
			'selector' => $selector_string,
			'properties' => $properties,
			'original_block' => $css_node->render( \Sabberworm\CSS\OutputFormat::create() ),
		];
	}

	private function is_simple_class_selector( string $selector ): bool {
		$trimmed = trim( $selector );
		return 1 === preg_match( '/^\.[\w-]+$/', $trimmed );
	}

	public function validate_css( string $css ): array {
		$errors = [];

		try {
			$this->parse( $css );
		} catch ( CssParseException $e ) {
			if ( function_exists( 'esc_html' ) ) {
				$errors[] = esc_html( $e->getMessage() );
			} else {
				$errors[] = $e->getMessage();
			}
		}

		return $errors;
	}
}
