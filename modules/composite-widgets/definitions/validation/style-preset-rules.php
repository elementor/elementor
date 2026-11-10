<?php

namespace Elementor\Modules\CompositeWidgets\Definitions\Validation;

use Elementor\Core\Utils\Api\Parse_Errors;
use Elementor\Modules\CompositeWidgets\Definitions\Widget_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Style_Preset_Rules {
	const APPEARANCE_KEY = 'appearance';
	const QUICK_EDIT_KEY = 'quick_edit';

	private Variable_References $variable_references;
	private Style_Props_Rules $style_props_rules;
	private Parse_Errors $errors;
	private array $parts = [];

	public function __construct( Variable_References $variable_references, Style_Props_Rules $style_props_rules ) {
		$this->variable_references = $variable_references;
		$this->style_props_rules = $style_props_rules;
	}

	public function validate( array $definition, array $parts, Parse_Errors $errors ): void {
		$this->errors = $errors;
		$this->parts = $parts;

		$style = $definition['style'] ?? [];
		$appearance = $this->get_list( $style, self::APPEARANCE_KEY );
		$quick_edit = $this->get_list( $style, self::QUICK_EDIT_KEY );

		foreach ( $appearance as $index => $preset ) {
			$this->validate_preset( $preset, "style.appearance.{$index}" );
		}

		foreach ( $quick_edit as $index => $quick_edit_entry ) {
			$this->validate_quick_edit( $quick_edit_entry, "style.quick_edit.{$index}" );
		}

		if ( Widget_Definition::SOURCE_CODE === $definition['source'] ) {
			foreach ( $this->variable_references->find_paths( $appearance, 'style.appearance' ) as $reference_path ) {
				$this->errors->add( $reference_path, Definition_Error_Codes::GLOBAL_REFERENCE_NOT_ALLOWED );
			}
		}
	}

	private function get_list( array $style, string $key ): array {
		if ( ! isset( $style[ $key ] ) ) {
			return [];
		}

		if ( ! is_array( $style[ $key ] ) ) {
			$this->errors->add( "style.{$key}", Definition_Error_Codes::DEFINITION_INVALID );
			return [];
		}

		return $style[ $key ];
	}

	private function validate_preset( $preset, string $path ): void {
		$options = is_array( $preset ) ? ( $preset['options'] ?? null ) : null;

		if ( ! is_array( $options ) ) {
			$this->errors->add( $path, Definition_Error_Codes::PRESET_STYLE_INVALID );
			return;
		}

		foreach ( $options as $option_index => $option ) {
			$writes = is_array( $option ) ? ( $option['set'] ?? null ) : null;
			$option_path = "{$path}.options.{$option_index}";

			if ( ! is_array( $writes ) ) {
				$this->errors->add( $option_path, Definition_Error_Codes::PRESET_STYLE_INVALID );
				continue;
			}

			foreach ( $writes as $write_index => $write ) {
				$this->validate_preset_write( $write, "{$option_path}.set.{$write_index}" );
			}
		}
	}

	private function validate_preset_write( $write, string $path ): void {
		if ( ! is_array( $write ) || ! is_array( $write['style'] ?? null ) ) {
			$this->errors->add( $path, Definition_Error_Codes::PRESET_STYLE_INVALID );
			return;
		}

		$part = $write['part'] ?? null;

		if ( ! is_string( $part ) || ! isset( $this->parts[ $part ] ) ) {
			$this->errors->add( "{$path}.part", Definition_Error_Codes::TARGET_PART_NOT_FOUND );
		}

		foreach ( $write['style'] as $breakpoint => $props ) {
			$breakpoint_path = "{$path}.style.{$breakpoint}";

			if ( ! is_array( $props ) ) {
				$this->errors->add( $breakpoint_path, Definition_Error_Codes::PRESET_STYLE_INVALID );
				continue;
			}

			$this->style_props_rules->validate_props( $props, $breakpoint_path, $this->errors, Definition_Error_Codes::PRESET_STYLE_INVALID );
		}
	}

	private function validate_quick_edit( $quick_edit, string $path ): void {
		$style_prop = is_array( $quick_edit ) ? ( $quick_edit['style_prop'] ?? null ) : null;

		if ( ! $this->style_props_rules->is_known_prop( $style_prop ) ) {
			$this->errors->add( $path, Definition_Error_Codes::QUICK_EDIT_INVALID );
			return;
		}

		$targets = $quick_edit['targets'] ?? null;

		if ( ! is_array( $targets ) ) {
			$this->errors->add( "{$path}.targets", Definition_Error_Codes::QUICK_EDIT_INVALID );
			return;
		}

		foreach ( $targets as $index => $part ) {
			if ( ! is_string( $part ) || ! isset( $this->parts[ $part ] ) ) {
				$this->errors->add( "{$path}.targets.{$index}", Definition_Error_Codes::TARGET_PART_NOT_FOUND );
			}
		}
	}
}
