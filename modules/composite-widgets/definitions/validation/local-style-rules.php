<?php

namespace Elementor\Modules\CompositeWidgets\Definitions\Validation;

use Elementor\Core\Utils\Api\Parse_Errors;
use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Markers;
use Elementor\Modules\AtomicWidgets\Parsers\Style_Parser;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Local_Style_Rules {
	private Style_Props_Rules $style_props_rules;
	private ?Style_Parser $style_parser = null;

	public function __construct( Style_Props_Rules $style_props_rules ) {
		$this->style_props_rules = $style_props_rules;
	}

	public function validate( array $node, string $path, ?string $part, Parse_Errors $errors ): void {
		$styles = $node['styles'] ?? [];

		if ( ! is_array( $styles ) ) {
			$errors->add( "{$path}.styles", Definition_Error_Codes::TEMPLATE_STYLE_INVALID );
			return;
		}

		$expected_style_id = null !== $part ? Widget_Markers::get_template_local_style_id( $part ) : null;

		foreach ( $styles as $style_id => $style ) {
			$style_path = "{$path}.styles.{$style_id}";

			if ( $expected_style_id !== $style_id || ! is_array( $style ) || ( $style['id'] ?? null ) !== $style_id ) {
				$errors->add( $style_path, Definition_Error_Codes::TEMPLATE_STYLE_INVALID );
				continue;
			}

			$this->validate_style( $style, $style_path, $errors );
		}
	}

	private function validate_style( array $style, string $style_path, Parse_Errors $errors ): void {
		$result = $this->get_style_parser()->parse( $style );

		foreach ( $result->errors()->all() as $error ) {
			$errors->add( "{$style_path}.{$error['key']}", Definition_Error_Codes::TEMPLATE_STYLE_INVALID );
		}

		if ( ! is_array( $style['variants'] ?? null ) ) {
			return;
		}

		foreach ( $style['variants'] as $index => $variant ) {
			$this->validate_variant( $variant, "{$style_path}.variants.{$index}", $errors );
		}
	}

	private function validate_variant( $variant, string $variant_path, Parse_Errors $errors ): void {
		$breakpoint = $variant['meta']['breakpoint'] ?? null;

		if ( is_string( $breakpoint ) && ! $this->style_props_rules->is_known_breakpoint( $breakpoint ) ) {
			$errors->add( "{$variant_path}.meta.breakpoint", Definition_Error_Codes::TEMPLATE_STYLE_INVALID );
		}

		if ( is_array( $variant['props'] ?? null ) ) {
			$this->style_props_rules->validate_known_props(
				$variant['props'],
				"{$variant_path}.props",
				$errors,
				Definition_Error_Codes::TEMPLATE_STYLE_INVALID
			);
		}
	}

	private function get_style_parser(): Style_Parser {
		if ( null === $this->style_parser ) {
			$this->style_parser = Style_Parser::make( Style_Schema::get() );
		}

		return $this->style_parser;
	}
}
