<?php
namespace Elementor\Modules\CssConverter\Parsers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../autoloader.php';
require_once __DIR__ . '/../exceptions/css-parse-exception.php';
require_once __DIR__ . '/parsed-css.php';

use Elementor\Modules\CssConverter\CSS_Converter_Autoloader;
use Elementor\Modules\CssConverter\Exceptions\CssParseException;
use Sabberworm\CSS\Parser;
use Sabberworm\CSS\CSSList\Document;
use Sabberworm\CSS\Settings;

class CssParser {

	private $settings;
	private $charset;

	public function __construct( array $options = [] ) {
		CSS_Converter_Autoloader::register();

		if ( ! CSS_Converter_Autoloader::is_loaded() ) {
			throw new CssParseException( 'CSS parser dependencies not loaded. Run composer install.' );
		}

		$this->charset = $options['charset'] ?? 'utf-8';
		$this->settings = Settings::create()
			->withDefaultCharset( $this->charset )
			->withMultibyteSupport( true )
			->beStrict( false );
	}

	public function parse( string $css ): ParsedCss {
		if ( empty( trim( $css ) ) ) {
			throw new CssParseException( 'Empty CSS provided' );
		}

		try {
			$parser = new Parser( $css, $this->settings );
			$document = $parser->parse();

			return new ParsedCss( $document, $css );
        } catch ( \Exception $e ) {
            // Do not include raw exception messages in the thrown exception to
            // avoid leaking implementation details and to satisfy PHPCS escaping rules.
            throw new CssParseException( 'Failed to parse CSS.', 0, $e );
        }
	}

	public function parse_from_file( string $file_path ): ParsedCss {
        if ( ! file_exists( $file_path ) ) {
            throw new CssParseException( 'CSS file not found.' );
        }

		$css = file_get_contents( $file_path );
        if ( false === $css ) {
            throw new CssParseException( 'Failed to read CSS file.' );
        }

		return $this->parse( $css );
	}

	public function parse_from_url( string $url ): ParsedCss {
		$css = wp_remote_retrieve_body( wp_remote_get( $url ) );
        if ( empty( $css ) ) {
            throw new CssParseException( 'Failed to fetch CSS from URL.' );
        }

		return $this->parse( $css );
	}

	public function extract_classes( ParsedCss $parsed ): array {
		$classes = [];
		$this->extract_classes_recursive( $parsed->get_document(), $classes );
		return $classes;
	}

	public function extract_variables( ParsedCss $parsed ): array {
		$variables = [];
		$this->extract_variables_recursive( $parsed->get_document(), $variables );
		return $variables;
	}

	public function extract_unsupported( ParsedCss $parsed ): string {
		$unsupported = [];
		$this->extract_unsupported_recursive( $parsed->get_document(), $unsupported );
		return implode( "\n\n", array_filter( $unsupported ) );
	}

	public function get_conversion_summary( ParsedCss $parsed ): array {
		$classes = $this->extract_classes( $parsed );
		$variables = $this->extract_variables( $parsed );
		$unsupported = $this->extract_unsupported( $parsed );

		return [
			'classes' => [
				'count' => count( $classes ),
				'names' => array_keys( $classes ),
			],
			'variables' => [
				'count' => count( $variables ),
				'names' => array_keys( $variables ),
			],
			'unsupported' => [
				'has_content' => ! empty( $unsupported ),
				'size' => strlen( $unsupported ),
			],
			'stats' => $parsed->get_stats(),
		];
	}

	private function extract_classes_recursive( $css_node, &$classes ) {
		if ( $css_node instanceof \Sabberworm\CSS\RuleSet\DeclarationBlock ) {
			foreach ( $css_node->getSelectors() as $selector ) {
				$selector_string = $selector->getSelector();

				if ( $this->is_simple_class_selector( $selector_string ) ) {
					$class_name = trim( $selector_string, '.' );
					$classes[ $class_name ] = [
						'name' => $class_name,
						'selector' => $selector_string,
						'rules' => $this->extract_rules_from_block( $css_node ),
						'original_block' => $css_node->render( \Sabberworm\CSS\OutputFormat::create() ),
					];
				}
			}
		}

		if ( method_exists( $css_node, 'getContents' ) ) {
			foreach ( $css_node->getContents() as $content ) {
				$this->extract_classes_recursive( $content, $classes );
			}
		}
	}

	private function extract_variables_recursive( $css_node, &$variables ) {
		if ( $css_node instanceof \Sabberworm\CSS\RuleSet\DeclarationBlock ) {
			foreach ( $css_node->getSelectors() as $selector ) {
				$selector_string = $selector->getSelector();

				if ( $this->is_root_selector( $selector_string ) ) {
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
				}
			}
		}

		if ( method_exists( $css_node, 'getContents' ) ) {
			foreach ( $css_node->getContents() as $content ) {
				$this->extract_variables_recursive( $content, $variables );
			}
		}
	}

	private function extract_unsupported_recursive( $css_node, &$unsupported ) {
		if ( $css_node instanceof \Sabberworm\CSS\RuleSet\DeclarationBlock ) {
			$has_unsupported_selector = false;

			foreach ( $css_node->getSelectors() as $selector ) {
				$selector_string = $selector->getSelector();

				if ( ! $this->is_simple_class_selector( $selector_string ) &&
					! $this->is_root_selector( $selector_string ) ) {
					$has_unsupported_selector = true;
					break;
				}
			}

			if ( $has_unsupported_selector ) {
				$unsupported[] = $css_node->render( \Sabberworm\CSS\OutputFormat::create() );
			}
		}

		if ( $css_node instanceof \Sabberworm\CSS\CSSList\AtRuleBlockList ) {
			$unsupported[] = $css_node->render( \Sabberworm\CSS\OutputFormat::create() );
		}

		if ( $css_node instanceof \Sabberworm\CSS\Property\AtRule ) {
			$unsupported[] = $css_node->render( \Sabberworm\CSS\OutputFormat::create() );
		}

		if ( method_exists( $css_node, 'getContents' ) ) {
			foreach ( $css_node->getContents() as $content ) {
				$this->extract_unsupported_recursive( $content, $unsupported );
			}
		}
	}

	private function is_simple_class_selector( string $selector ): bool {
		$trimmed = trim( $selector );
		return preg_match( '/^\.[\w-]+$/', $trimmed );
	}

	private function is_root_selector( string $selector ): bool {
		$trimmed = trim( $selector );
		return $trimmed === ':root' || $trimmed === 'html';
	}

	private function is_css_variable( string $property ): bool {
		return strpos( $property, '--' ) === 0;
	}

	private function extract_rules_from_block( $block ): array {
		$rules = [];
		foreach ( $block->getRules() as $rule ) {
			$property = $rule->getRule();
			$value = (string) $rule->getValue();
			$is_important = $rule->getIsImportant();
			$raw = $rule->render( \Sabberworm\CSS\OutputFormat::create() );

			$rules[ $property ] = [
				'value' => $value,
				'important' => $is_important,
				'raw' => $raw,
			];
		}
		return $rules;
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
