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

		if ( class_exists( 'Sabberworm\CSS\Parser' ) ) {
			return;
		}

		// Load the autoloader if classes are not available
		// First try the standard Elementor path
		$autoloader_path = ELEMENTOR_PATH . 'includes/libraries/sabberworm-css-parser/bootstrap.php';

		// If that doesn't exist, try the elementor-css plugin path (for custom installations)
		if ( ! file_exists( $autoloader_path ) ) {
			$elementor_css_path = WP_PLUGIN_DIR . '/elementor-css/includes/libraries/sabberworm-css-parser/bootstrap.php';
			if ( file_exists( $elementor_css_path ) ) {
				$autoloader_path = $elementor_css_path;
			}
		}

		// If still not found, try relative to current module (for elementor-css plugin)
		if ( ! file_exists( $autoloader_path ) ) {
			// From parsers/css-parser.php: __DIR__ = parsers/, up 3 = plugins/elementor-css/
			$relative_path = dirname( __DIR__, 3 ) . '/includes/libraries/sabberworm-css-parser/bootstrap.php';
			if ( file_exists( $relative_path ) ) {
				$autoloader_path = $relative_path;
			}
		}

		// Last resort: try direct path for elementor-css plugin
		if ( ! file_exists( $autoloader_path ) ) {
			$direct_path = '/Users/janvanvlastuin1981/Local Sites/elementor/app/public/wp-content/plugins/elementor-css/includes/libraries/sabberworm-css-parser/bootstrap.php';
			if ( file_exists( $direct_path ) ) {
				$autoloader_path = $direct_path;
			}
		}

		if ( file_exists( $autoloader_path ) ) {
			require_once $autoloader_path;

			// Verify the class is now available
			if ( class_exists( 'Sabberworm\CSS\Parser' ) ) {
			} else {
			}
		} else {
		}
	}

	public function parse( string $css ): ParsedCss {

		if ( empty( trim( $css ) ) ) {
			// ✅ GRACEFUL HANDLING: Return empty ParsedCss instead of throwing exception
			// This allows HTML without CSS to be processed successfully
			$empty_document = new \Sabberworm\CSS\CSSList\Document();
			return new ParsedCss( $empty_document, '' );
		}

		try {
			// Check if Parser class exists before trying to instantiate
			if ( ! class_exists( 'Sabberworm\CSS\Parser' ) ) {
				throw new \Exception( 'Sabberworm CSS Parser library not loaded' );
			}

			$parser = new Parser( $css, $this->settings );

			$document = $parser->parse();

			return new ParsedCss( $document, $css );
		} catch ( \Exception $e ) {
			throw new CssParseException( 'Failed to parse CSS: ' . $e->getMessage(), 0 );
		}
	}

	public function extract_variables( ParsedCss $parsed ): array {
		$variables = [];
		$this->extract_variables_recursive( $parsed->get_document(), $variables );
		return $variables;
	}

	public function extract_variables_with_nesting( ParsedCss $parsed ): array {
		$raw_variables = [];
		$this->extract_variables_with_scope_recursive( $parsed->get_document(), $raw_variables, '' );
		return $raw_variables;
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

	private function extract_variables_with_scope_recursive( $css_node, &$variables, string $scope_prefix ) {
		if ( $css_node instanceof \Sabberworm\CSS\AtRuleBlockList ) {
			$at_rule = $css_node->getAtRule();
			$new_scope = trim( $scope_prefix . ' ' . $at_rule->__toString() );
			$this->extract_variables_with_scope_recursive_contents( $css_node, $variables, $new_scope );
		} elseif ( $css_node instanceof \Sabberworm\CSS\RuleSet\DeclarationBlock ) {
			$this->process_declaration_block( $css_node, function( $selector_string, $css_node ) use ( &$variables, $scope_prefix ) {
				$full_scope = trim( $scope_prefix . ' ' . $selector_string );

				foreach ( $css_node->getRules() as $rule ) {
					$property = $rule->getRule();
					if ( $this->is_css_variable( $property ) ) {
						$value = (string) $rule->getValue();
						$var_key = $property . '::' . md5( $full_scope );

						$variables[ $var_key ] = [
							'name' => $property,
							'value' => $value,
							'scope' => $full_scope,
							'original_block' => $css_node->render( \Sabberworm\CSS\OutputFormat::create() ),
						];
					}
				}
			});
		}

		if ( method_exists( $css_node, 'getContents' ) ) {
			foreach ( $css_node->getContents() as $content ) {
				$this->extract_variables_with_scope_recursive( $content, $variables, $scope_prefix );
			}
		}
	}

	private function extract_variables_with_scope_recursive_contents( $css_node, &$variables, string $scope ) {
		if ( method_exists( $css_node, 'getContents' ) ) {
			foreach ( $css_node->getContents() as $content ) {
				$this->extract_variables_with_scope_recursive( $content, $variables, $scope );
			}
		}
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

	private function process_declaration_block( $css_node, callable $callback ) {
		if ( ! $css_node instanceof \Sabberworm\CSS\RuleSet\DeclarationBlock ) {
			return;
		}

		$selectors = $css_node->getSelectors();
		if ( ! $selectors ) {
			return;
		}

		// getSelectors() returns an array of selector objects
		if ( is_array( $selectors ) ) {
			foreach ( $selectors as $selector ) {
				$selector_string = $selector->__toString();
				$callback( $selector_string, $css_node );
			}
		} else {
			// If it's a SelectorList object, get its selectors
			foreach ( $selectors->getSelectors() as $selector ) {
				$selector_string = $selector->__toString();
				$callback( $selector_string, $css_node );
			}
		}
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
