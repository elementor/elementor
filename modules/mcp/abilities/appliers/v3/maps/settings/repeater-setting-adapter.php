<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REPEATER and nested-elements-repeater controls. Each row exposes the declared fields only,
 * converted by their own adapters. A write replaces the whole list; every row gets a fresh `_id`.
 * Nested widgets still store each row's panel as a child element at the same index.
 */
class Repeater_Setting_Adapter implements V3_Setting_Adapter {

	const CONTROL_TYPES = [ 'repeater', 'nested-elements-repeater' ];

	const ROW_ID_KEY = '_id';

	const ROW_ID_LENGTH = 7;

	/**
	 * @var array<string, V3_Setting>
	 */
	private array $fields;

	/**
	 * @param array<string, V3_Setting> $fields Keyed by the public row property name.
	 */
	public function __construct( array $fields ) {
		$this->fields = $fields;
	}

	public function supports( array $control ): bool {
		if ( ! in_array( $control['type'] ?? null, self::CONTROL_TYPES, true ) || empty( $this->fields ) ) {
			return false;
		}

		foreach ( $this->fields as $field ) {
			$field_control = self::field_control( $control, $field );

			if ( null === $field_control || ! $field->get_adapter()->supports( $field_control ) ) {
				return false;
			}
		}

		return true;
	}

	public function prop_type( array $control ): Prop_Type {
		$shape = [];

		foreach ( $this->fields as $public_key => $field ) {
			$shape[ $public_key ] = $field->get_adapter()->prop_type( self::field_control( $control, $field ) ?? [] );
		}

		return V3_Repeater_Prop_Type::make()->set_item_type( V3_Repeater_Item_Prop_Type::make()->set_shape( $shape ) );
	}

	public function to_control_value( array $prop_value, array $control ) {
		$rows = is_array( $prop_value['value'] ?? null ) ? $prop_value['value'] : [];
		$stored = [];

		foreach ( $rows as $row ) {
			$values = is_array( $row['value'] ?? null ) ? $row['value'] : [];
			$stored_row = [ self::ROW_ID_KEY => self::row_id() ];

			foreach ( $this->fields as $public_key => $field ) {
				if ( ! is_array( $values[ $public_key ] ?? null ) ) {
					continue;
				}

				$stored_row[ $field->get_control_key() ] = $field->get_adapter()->to_control_value(
					$values[ $public_key ],
					self::field_control( $control, $field ) ?? []
				);
			}

			$stored[] = $stored_row;
		}

		return $stored;
	}

	public function from_control_value( $stored, array $control ) {
		if ( ! is_array( $stored ) ) {
			return null;
		}

		$rows = [];

		foreach ( $stored as $stored_row ) {
			if ( ! is_array( $stored_row ) ) {
				continue;
			}

			$row = [];

			foreach ( $this->fields as $public_key => $field ) {
				if ( ! array_key_exists( $field->get_control_key(), $stored_row ) ) {
					continue;
				}

				$value = $field->get_adapter()->from_control_value(
					$stored_row[ $field->get_control_key() ],
					self::field_control( $control, $field ) ?? []
				);

				if ( null !== $value ) {
					$row[ $public_key ] = $value;
				}
			}

			$rows[] = $row;
		}

		return $rows;
	}

	/**
	 * @param array<string, mixed> $control
	 * @return array<string, mixed>|null
	 */
	private static function field_control( array $control, V3_Setting $field ): ?array {
		$field_control = $control['fields'][ $field->get_control_key() ] ?? null;

		return is_array( $field_control ) ? $field_control : null;
	}

	private static function row_id(): string {
		return substr( md5( uniqid( '', true ) ), 0, self::ROW_ID_LENGTH );
	}
}
