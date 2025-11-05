<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;
use Elementor\Modules\CssConverter\Services\Css\Nested_Selector_Parser;
use Elementor\Modules\CssConverter\Services\Css\Flattened_Class_Name_Generator;
use Elementor\Modules\CssConverter\Services\Css\Css_Selector_Utils;

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
		$this->parser = $parser ? $parser : Nested_Selector_Parser::make();
		$this->name_generator = $name_generator ? $name_generator : Flattened_Class_Name_Generator::make();
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

		// DEBUG: Check for .loading selectors BEFORE flattening
		$loading_before = [];
		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			if ( false !== strpos( $selector, 'loading' ) ) {
				$loading_before[] = $selector;
			}
		}
		file_put_contents( '/tmp/flattening_debug.log', 'NESTED_FLATTENING BEFORE: ' . count( $loading_before ) . ' loading selectors: ' . implode( ', ', $loading_before ) . "\n", FILE_APPEND );

		if ( empty( $css_rules ) ) {
			return $context;
		}

		$existing_class_names = $this->get_existing_class_names( $context );
		$result = $this->transform_nested_selectors_in_place( $css_rules, $existing_class_names );

		// Update css_rules with transformed selectors
		$context->set_metadata( 'css_rules', $result['css_rules'] );

		// DEBUG: Check for .loading selectors AFTER flattening
		$loading_after = [];
		foreach ( $result['css_rules'] as $rule ) {
			$selector = $rule['selector'] ?? '';
			if ( false !== strpos( $selector, 'loading' ) ) {
				$loading_after[] = $selector;
			}
		}
		file_put_contents( '/tmp/flattening_debug.log', 'NESTED_FLATTENING AFTER: ' . count( $loading_after ) . ' loading selectors: ' . implode( ', ', $loading_after ) . "\n", FILE_APPEND );

		// Store HTML modification instructions
		$css_class_modifiers = $context->get_metadata( 'css_class_modifiers', [] );
		$css_class_modifiers[] = [
			'type' => 'flattening',
			'mappings' => $result['class_mappings'],
		];
		$context->set_metadata( 'css_class_modifiers', $css_class_modifiers );

		// Add statistics
		$context->add_statistic( 'nested_selectors_transformed', $result['transformed_count'] );
		$context->add_statistic( 'nested_selectors_processed', $result['processed_count'] );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'nested_selectors_transformed',
			'nested_selectors_processed',
		];
	}

	private function transform_nested_selectors_in_place( array $css_rules, array $existing_class_names ): array {
		$transformed_css_rules = [];
		$class_mappings = [];
		$processed_count = 0;
		$transformed_count = 0;
		$used_names = $existing_class_names;

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';

			if ( empty( $selector ) ) {
				$transformed_css_rules[] = $rule;
				continue;
			}

			if ( ! $this->should_flatten_selector( $selector ) ) {
				$transformed_css_rules[] = $rule;
				continue;
			}

			if ( $this->is_compound_class_selector( $selector ) ) {
				$transformed_css_rules[] = $rule;
				continue;
			}

			if ( $this->has_element_tag_in_last_part( $selector ) ) {
				$transformed_css_rules[] = $rule;
				continue;
			}

			++$processed_count;

			$flatten_result = $this->flatten_single_selector( $rule, $used_names );

			if ( null === $flatten_result ) {
				$transformed_css_rules[] = $rule;
				continue;
			}

			// Transform the selector in the rule: .parent .child → .parent-and-child
			$transformed_rule = $rule;
			$transformed_rule['selector'] = '.' . $flatten_result['class_name'];
			$transformed_css_rules[] = $transformed_rule;

			// Store HTML class mapping for modifier
			if ( ! empty( $flatten_result['mapping'] ) ) {
				$mapping_key = $flatten_result['mapping']['key'];
				$mapping_value = $flatten_result['mapping']['value'];
				$class_mappings[ $mapping_key ] = $mapping_value;
			}

			// Track used name
			$used_names[] = $flatten_result['class_name'];
			++$transformed_count;
		}

		return [
			'css_rules' => $transformed_css_rules,
			'class_mappings' => $class_mappings,
			'transformed_count' => $transformed_count,
			'processed_count' => $processed_count,
		];
	}

	private function flatten_single_selector( array $rule, array $used_names ): ?array {
		$selector = $rule['selector'];

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

		$mapping = $this->build_class_mapping( $parsed_selector, $flattened_class_name );

		return [
			'class_name' => $flattened_class_name,
			'mapping' => $mapping,
		];
	}

	private function build_class_mapping( array $parsed_selector, string $flattened_class_name ): ?array {
		$target_class = $parsed_selector['target'] ?? null;

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
		// Remove dot prefix if present - mapping keys should be without dots
		// This matches the format expected by Nested_Class_Mapping_Service
		if ( 0 === strpos( $class_name, '.' ) ) {
			return ltrim( $class_name, '.' );
		}

		return $class_name;
	}

	private function should_flatten_selector( string $selector ): bool {
		if ( false !== strpos( $selector, '#' ) ) {
			return false;
		}

		return $this->parser->is_nested_selector( $selector );
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

	private function has_element_tag_in_last_part( string $selector ): bool {
		$parts = preg_split( '/\s+/', trim( $selector ) );
		if ( empty( $parts ) ) {
			return false;
		}

		$last_part = end( $parts );
		$last_part = str_replace( '>', '', $last_part );
		$last_part = trim( $last_part );

		if ( $this->has_mixed_element_and_class( $last_part ) ) {
			return true;
		}

		return Css_Selector_Utils::is_element_tag( $last_part );
	}

	private function has_mixed_element_and_class( string $part ): bool {
		return preg_match( '/^[a-zA-Z][a-zA-Z0-9]*\./', $part );
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

	private function get_existing_class_names( Css_Processing_Context $context ): array {
		$existing_classes = $context->get_metadata( 'existing_global_class_names', [] );
		return is_array( $existing_classes ) ? $existing_classes : [];
	}
}
