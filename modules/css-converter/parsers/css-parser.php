<?php
namespace Elementor\Modules\CssConverter\Parsers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/../../../includes/libraries/sabberworm-css-parser/bootstrap.php';

use Elementor\Modules\CssConverter\Exceptions\CssParseException;
use Elementor\Modules\CssConverter\Parsers\ParsedCss;
use Sabberworm\CSS\Parser;
use Sabberworm\CSS\CSSList\Document;
use Sabberworm\CSS\Settings;

class CssParser {

	private $settings;
	private $charset;

	public function __construct( array $options = [] ) {
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
			throw new CssParseException( 'Failed to parse CSS.', 0 );
		}
	}

	public function extract_variables( ParsedCss $parsed ): array {
		$variables = [];
		$this->extract_variables_recursive( $parsed->get_document(), $variables );
		return $variables;
	}

	private function extract_variables_recursive( $css_node, &$variables ) {
		if ( $css_node instanceof \Sabberworm\CSS\RuleSet\DeclarationBlock ) {
			$this->process_declaration_block_for_variables( $css_node, $variables );
		}
		$this->process_node_contents_recursively( $css_node, 'extract_variables_recursive', $variables );
	}
	private function process_declaration_block_for_variables( $css_node, &$variables ) {
		foreach ( $css_node->getSelectors() as $selector ) {
			$selector_string = $selector->getSelector();
			if ( ! $this->is_root_selector( $selector_string ) ) {
				continue;
			}
			$this->extract_variables_from_rules( $css_node, $selector_string, $variables );
		}
	}
	private function extract_variables_from_rules( $css_node, $selector_string, &$variables ) {
		foreach ( $css_node->getRules() as $rule ) {
			$property = $rule->getRule();
			if ( ! $this->is_css_variable( $property ) ) {
				continue;
			}
			$this->add_variable_to_collection( $property, $rule, $selector_string, $css_node, $variables );
		}
	}
	private function add_variable_to_collection( $property, $rule, $selector_string, $css_node, &$variables ) {
		$value = (string) $rule->getValue();
		$variables[ $property ] = [
			'name' => $property,
			'value' => $value,
			'scope' => $selector_string,
			'original_block' => $css_node->render( \Sabberworm\CSS\OutputFormat::create() ),
		];
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
