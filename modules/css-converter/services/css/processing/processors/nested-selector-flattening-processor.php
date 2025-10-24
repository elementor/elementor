<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;
use Elementor\Modules\CssConverter\Services\Css\Nested_Selector_Parser;
use Elementor\Modules\CssConverter\Services\Css\Flattened_Class_Name_Generator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Nested_Selector_Flattening_Processor implements Css_Processor_Interface {

	const PRIORITY = 15;
	const PROCESSOR_NAME = 'nested_selector_flattening';

	private $parser;
	private $name_generator;

	public function __construct(
		Nested_Selector_Parser $parser = null,
		Flattened_Class_Name_Generator $name_generator = null
	) {
		$this->parser = $parser ?: Nested_Selector_Parser::make();
		$this->name_generator = $name_generator ?: Flattened_Class_Name_Generator::make();
	}

	public static function make(): self {
		return new self();
	}

	public function get_processor_name(): string {
		return self::PROCESSOR_NAME;
	}

	public function get_priority(): int {
		return self::PRIORITY;
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules' );
		return ! empty( $css_rules ) && is_array( $css_rules );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$css_rules = $context->get_metadata( 'css_rules', [] );

		if ( empty( $css_rules ) ) {
			return $context;
		}

		$existing_class_names = $this->get_existing_class_names( $context );
		$result = $this->flatten_nested_selectors( $css_rules, $existing_class_names );
		$this->validate_flattening_result( $result );

		$context->set_metadata( 'flattened_rules', $result['flattened_rules'] );
		$context->set_metadata( 'flattened_classes', $result['flattened_classes'] );
		$context->set_metadata( 'class_mappings', $result['class_mappings'] );
		$context->set_metadata( 'classes_with_direct_styles', $result['classes_with_direct_styles'] );
		$context->set_metadata( 'classes_only_in_nested', $result['classes_only_in_nested'] );

		$context->add_statistic( 'nested_selectors_flattened', count( $result['flattened_classes'] ) );
		$context->add_statistic( 'class_mappings_created', count( $result['class_mappings'] ) );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'nested_selectors_flattened',
			'class_mappings_created',
		];
	}

	private function flatten_nested_selectors( array $css_rules, array $existing_class_names ): array {
		$flattened_rules = [];
		$flattened_classes = [];
		$class_mappings = [];
		$classes_with_direct_styles = [];
		$classes_only_in_nested = [];

		$used_names = $existing_class_names;

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';

			if ( empty( $selector ) ) {
				$flattened_rules[] = $rule;
				continue;
			}

			if ( $this->is_direct_class_selector( $selector ) ) {
				$class_name = $this->extract_class_name_from_selector( $selector );
				if ( $class_name ) {
					$classes_with_direct_styles[] = $class_name;
				}
			}

			if ( ! $this->should_flatten_selector( $selector ) ) {
				$flattened_rules[] = $rule;
				continue;
			}

			if ( $this->is_compound_class_selector( $selector ) ) {
				$flattened_rules[] = $rule;
				continue;
			}

			$flatten_result = $this->flatten_single_selector( $rule, $used_names );

			if ( null === $flatten_result ) {
				$flattened_rules[] = $rule;
				continue;
			}

			$flattened_rules[] = $flatten_result['rule'];
			$flattened_class_name = $flatten_result['class_name'];
			$flattened_classes[ $flattened_class_name ] = $flatten_result['class_data'];
			$used_names[] = $flattened_class_name;

			if ( ! empty( $flatten_result['mapping'] ) ) {
				$mapping_key = $flatten_result['mapping']['key'];
				$mapping_value = $flatten_result['mapping']['value'];
				$class_mappings[ $mapping_key ] = $mapping_value;
				$classes_only_in_nested[] = $mapping_key;
			}
		}

		$classes_only_in_nested = array_diff(
			array_unique( $classes_only_in_nested ),
			$classes_with_direct_styles
		);

		return [
			'flattened_rules' => $flattened_rules,
			'flattened_classes' => $flattened_classes,
			'class_mappings' => $class_mappings,
			'classes_with_direct_styles' => array_unique( $classes_with_direct_styles ),
			'classes_only_in_nested' => array_values( $classes_only_in_nested ),
		];
	}

	private function flatten_single_selector( array $rule, array $used_names ): ?array {
		$selector = $rule['selector'];
		$properties = $rule['properties'] ?? [];

		$parsed_selector = $this->parser->parse_nested_selector( $selector );

		if ( null === $parsed_selector ) {
			return null;
		}

		$flattened_class_name = $this->name_generator->generate_flattened_class_name(
			$parsed_selector,
			$used_names
		);

		if ( empty( $flattened_class_name ) || in_array( $flattened_class_name, $used_names, true ) ) {
			return null;
		}

		$flattened_rule = [
			'selector' => '.' . $flattened_class_name,
			'properties' => $properties,
			'original_selector' => $selector,
			'flattened' => true,
			'global_class_id' => $flattened_class_name,
		];

		$class_data = [
			'id' => $flattened_class_name,
			'label' => $flattened_class_name,
			'original_selector' => $selector,
			'flattened_selector' => '.' . $flattened_class_name,
			'properties' => $properties,
			'specificity' => $parsed_selector['specificity'] ?? 0,
			'css_converter_specificity' => $parsed_selector['specificity'] ?? 0,
			'css_converter_original_selector' => $selector,
		];

		$mapping = $this->build_class_mapping( $parsed_selector, $flattened_class_name );

		return [
			'rule' => $flattened_rule,
			'class_name' => $flattened_class_name,
			'class_data' => $class_data,
			'mapping' => $mapping,
		];
	}

	private function build_class_mapping( array $parsed_selector, string $flattened_class_name ): ?array {
		$target_class = $parsed_selector['target_class'] ?? null;

		if ( empty( $target_class ) ) {
			return null;
		}

		$mapping_key = $this->normalize_mapping_key( $target_class );

		return [
			'key' => $mapping_key,
			'value' => $flattened_class_name,
		];
	}

	private function normalize_mapping_key( string $class_name ): string {
		if ( $this->is_element_tag( $class_name ) ) {
			return '.' . $class_name;
		}

		if ( 0 === strpos( $class_name, '.' ) ) {
			return $class_name;
		}

		return '.' . $class_name;
	}

	private function should_flatten_selector( string $selector ): bool {
		if ( false !== strpos( $selector, '#' ) ) {
			return false;
		}

		if ( $this->is_core_elementor_selector( $selector ) ) {
			return false;
		}

		return $this->parser->is_nested_selector( $selector );
	}

	private function is_direct_class_selector( string $selector ): bool {
		$trimmed = trim( $selector );

		if ( 0 !== strpos( $trimmed, '.' ) ) {
			return false;
		}

		if ( preg_match( '/[\s>+~]/', $trimmed ) ) {
			return false;
		}

		return true;
	}

	private function extract_class_name_from_selector( string $selector ): string {
		$trimmed = trim( $selector );

		if ( 0 === strpos( $trimmed, '.' ) ) {
			$trimmed = substr( $trimmed, 1 );
		}

		$trimmed = preg_replace( '/:[a-z-]+(\([^)]*\))?/i', '', $trimmed );

		return $trimmed;
	}

	private function is_compound_class_selector( string $selector ): bool {
		$trimmed = trim( $selector );
		$dot_count = substr_count( $trimmed, '.' );

		if ( $dot_count < 2 ) {
			return false;
		}

		if ( preg_match( '/\.[a-zA-Z_-]+\.[a-zA-Z_-]+/', $trimmed ) ) {
			return true;
		}

		return false;
	}

	private function is_element_tag( string $name ): bool {
		$html_tags = [
			'div',
			'span',
			'p',
			'a',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'ul',
			'ol',
			'li',
			'table',
			'tr',
			'td',
			'th',
			'thead',
			'tbody',
			'section',
			'article',
			'header',
			'footer',
			'nav',
			'main',
			'aside',
			'button',
			'input',
			'form',
			'label',
			'select',
			'textarea',
			'img',
			'video',
			'audio',
			'canvas',
			'svg',
		];

		return in_array( strtolower( $name ), $html_tags, true );
	}

	private function is_core_elementor_selector( string $selector ): bool {
		$core_patterns = [
			'/\.elementor-element\.elementor-/',
			'/\.elementor-widget\.elementor-/',
			'/\.elementor-container\.elementor-/',
			'/\.elementor-section\.elementor-/',
			'/\.elementor-column\.elementor-/',
			'/\.e-con\.e-/',
			'/\.e-flex\.e-/',
		];

		foreach ( $core_patterns as $pattern ) {
			if ( preg_match( $pattern, $selector ) ) {
				return true;
			}
		}

		return false;
	}

	private function get_existing_class_names( Css_Processing_Context $context ): array {
		$existing_classes = $context->get_metadata( 'existing_global_class_names', [] );
		return is_array( $existing_classes ) ? $existing_classes : [];
	}

	private function validate_flattening_result( array $result ): void {
		$required_keys = [
			'flattened_rules',
			'flattened_classes',
			'class_mappings',
			'classes_with_direct_styles',
			'classes_only_in_nested',
		];

		foreach ( $required_keys as $key ) {
			if ( ! isset( $result[ $key ] ) ) {
				throw new \Exception(
					"Flattening result missing required key: {$key}"
				);
			}

			if ( ! is_array( $result[ $key ] ) ) {
				throw new \Exception(
					"Flattening result key '{$key}' must be an array"
				);
			}
		}
	}
}
