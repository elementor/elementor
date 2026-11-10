<?php

namespace Elementor\Modules\CompositeWidgets\Definitions\Validation;

use Elementor\Core\Utils\Api\Parse_Errors;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Modules\CompositeWidgets\Definitions\Widget_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Style_Preset_Rules {
	private Variable_References $variable_references;
	private Parse_Errors $errors;
	private array $parts = [];
	private array $style_schema = [];

	public function __construct( Variable_References $variable_references ) {
		$this->variable_references = $variable_references;
	}

	public function validate( array $definition, array $parts, Parse_Errors $errors ): void {
		$this->errors = $errors;
		$this->parts = $parts;
		$this->style_schema = Style_Schema::get();

		$style = $definition['style'] ?? [];

		foreach ( $style['appearance'] ?? [] as $index => $preset ) {
			$this->validate_preset( $preset, "style.appearance.{$index}" );
		}

		foreach ( $style['quick_edit'] ?? [] as $index => $quick_edit ) {
			$this->validate_quick_edit( $quick_edit, "style.quick_edit.{$index}" );
		}

		if ( Widget_Definition::SOURCE_CODE === $definition['source'] && isset( $style['appearance'] ) ) {
			foreach ( $this->variable_references->find_paths( $style['appearance'], 'style.appearance' ) as $reference_path ) {
				$this->errors->add( $reference_path, Definition_Error_Codes::GLOBAL_REFERENCE_NOT_ALLOWED );
			}
		}
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

			foreach ( $props as $style_prop => $value ) {
				if ( ! $this->is_valid_style_prop_value( $style_prop, $value ) ) {
					$this->errors->add( "{$breakpoint_path}.{$style_prop}", Definition_Error_Codes::PRESET_STYLE_INVALID );
				}
			}
		}
	}

	private function validate_quick_edit( $quick_edit, string $path ): void {
		$style_prop = is_array( $quick_edit ) ? ( $quick_edit['style_prop'] ?? null ) : null;

		if ( ! is_string( $style_prop ) || ! isset( $this->style_schema[ $style_prop ] ) ) {
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

	private function is_valid_style_prop_value( $style_prop, $value ): bool {
		return is_string( $style_prop )
			&& isset( $this->style_schema[ $style_prop ] )
			&& $this->style_schema[ $style_prop ]->validate( $value );
	}
}
