<?php

namespace Elementor\Modules\CompositeWidgets\Definitions\Validation;

use Elementor\Core\Utils\Api\Parse_Errors;
use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Markers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Fields_Rules {
	const REPEATER_FIELD_LISTS = [ 'item_fields', 'list_fields' ];
	const REPEATER_PART_KEYS = [ 'container', 'item' ];

	private Parse_Errors $errors;

	/** @var array<string, array{path: string, schema: array}> */
	private array $parts = [];
	private ?string $root_part = null;

	public function validate( array $definition, array $parts, Parse_Errors $errors ): void {
		$this->errors = $errors;
		$this->parts = $parts;
		$this->root_part = $definition['template'][ Widget_Markers::PART_KEY ] ?? null;

		foreach ( $definition['general'] as $index => $entry ) {
			$path = "general.{$index}";

			if ( ! is_array( $entry ) ) {
				$this->errors->add( $path, Definition_Error_Codes::DEFINITION_INVALID );
				continue;
			}

			if ( isset( $entry['repeater'] ) ) {
				$this->validate_repeater( $entry, $path );
				continue;
			}

			$this->validate_fields( $entry['fields'] ?? null, "{$path}.fields" );
		}
	}

	private function validate_fields( $fields, string $path ): void {
		if ( ! is_array( $fields ) ) {
			$this->errors->add( $path, Definition_Error_Codes::DEFINITION_INVALID );
			return;
		}

		foreach ( $fields as $index => $field ) {
			$field_path = "{$path}.{$index}";

			if ( ! is_array( $field ) ) {
				$this->errors->add( $field_path, Definition_Error_Codes::DEFINITION_INVALID );
				continue;
			}

			if ( isset( $field['fields'] ) ) {
				$this->validate_removable_reference( $field['removable'] ?? null, "{$field_path}.removable" );
				$this->validate_fields( $field['fields'], "{$field_path}.fields" );
				continue;
			}

			$this->validate_field( $field, $field_path );
		}
	}

	private function validate_field( array $field, string $path ): void {
		$is_target_valid = $this->validate_target( $field['target'] ?? null, "{$path}.target" );
		$removable = $field['removable'] ?? false;

		if ( true === $removable && $is_target_valid ) {
			$this->validate_removable_part( $field['target']['part'], "{$path}.removable" );
		} elseif ( is_array( $removable ) ) {
			$this->validate_removable_reference( $removable, "{$path}.removable" );
		} elseif ( false !== $removable ) {
			$this->errors->add( "{$path}.removable", Definition_Error_Codes::REMOVABLE_PART_INVALID );
		}
	}

	private function validate_repeater( array $repeater, string $path ): void {
		foreach ( self::REPEATER_PART_KEYS as $key ) {
			$part = $repeater[ $key ] ?? null;

			if ( ! is_string( $part ) || ! isset( $this->parts[ $part ] ) ) {
				$this->errors->add( "{$path}.{$key}", Definition_Error_Codes::TARGET_PART_NOT_FOUND );
			}
		}

		if ( isset( $repeater['item_label'] ) ) {
			$this->validate_target( $repeater['item_label'], "{$path}.item_label" );
		}

		foreach ( self::REPEATER_FIELD_LISTS as $key ) {
			if ( isset( $repeater[ $key ] ) ) {
				$this->validate_fields( $repeater[ $key ], "{$path}.{$key}" );
			}
		}
	}

	private function validate_target( $target, string $path ): bool {
		$part = is_array( $target ) ? ( $target['part'] ?? null ) : null;
		$prop = is_array( $target ) ? ( $target['prop'] ?? null ) : null;

		if ( ! is_string( $part ) || ! isset( $this->parts[ $part ] ) ) {
			$this->errors->add( "{$path}.part", Definition_Error_Codes::TARGET_PART_NOT_FOUND );
			return false;
		}

		if ( ! is_string( $prop ) || ! array_key_exists( $prop, $this->parts[ $part ]['schema'] ) ) {
			$this->errors->add( "{$path}.prop", Definition_Error_Codes::TARGET_PROP_NOT_FOUND );
			return false;
		}

		return true;
	}

	private function validate_removable_reference( $removable, string $path ): void {
		if ( null === $removable ) {
			return;
		}

		$part = is_array( $removable ) ? ( $removable['part'] ?? null ) : null;

		if ( ! is_string( $part ) ) {
			$this->errors->add( $path, Definition_Error_Codes::REMOVABLE_PART_INVALID );
			return;
		}

		$this->validate_removable_part( $part, $path );
	}

	private function validate_removable_part( string $part, string $path ): void {
		if ( ! isset( $this->parts[ $part ] ) || $this->root_part === $part ) {
			$this->errors->add( $path, Definition_Error_Codes::REMOVABLE_PART_INVALID );
		}
	}
}
