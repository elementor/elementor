<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REPEATER control. The row shape is derived from the control's own fields: each field whose
 * type maps to a setting adapter is exposed under its field key and converted by that adapter.
 * A write replaces the whole list; every row gets a fresh `_id`.
 */
class Repeater_Setting_Adapter implements V3_Setting_Adapter {

	const CONTROL_TYPE = 'repeater';

	const ROW_ID_KEY = '_id';

	const ROW_ID_LENGTH = 7;

	public function supports( array $control ): bool {
		return self::CONTROL_TYPE === ( $control['type'] ?? null ) && ! empty( $this->field_adapters( $control ) );
	}

	public function prop_type( array $control ): Prop_Type {
		$shape = [];

		foreach ( $this->field_adapters( $control ) as $key => $adapter ) {
			$shape[ $key ] = $adapter->prop_type( $control['fields'][ $key ] );
		}

		return V3_Repeater_Prop_Type::make()->set_item_type( V3_Repeater_Item_Prop_Type::make()->set_shape( $shape ) );
	}

	public function to_control_value( array $prop_value, array $control ) {
		$rows = is_array( $prop_value['value'] ?? null ) ? $prop_value['value'] : [];
		$adapters = $this->field_adapters( $control );
		$stored = [];

		foreach ( $rows as $row ) {
			$values = is_array( $row['value'] ?? null ) ? $row['value'] : [];
			$stored_row = [ self::ROW_ID_KEY => self::row_id() ];

			foreach ( $adapters as $key => $adapter ) {
				if ( is_array( $values[ $key ] ?? null ) ) {
					$stored_row[ $key ] = $adapter->to_control_value( $values[ $key ], $control['fields'][ $key ] );
				}
			}

			$stored[] = $stored_row;
		}

		return $stored;
	}

	public function from_control_value( $stored, array $control ) {
		if ( ! is_array( $stored ) ) {
			return null;
		}

		$adapters = $this->field_adapters( $control );
		$rows = [];

		foreach ( $stored as $stored_row ) {
			if ( ! is_array( $stored_row ) ) {
				continue;
			}

			$row = [];

			foreach ( $adapters as $key => $adapter ) {
				if ( array_key_exists( $key, $stored_row ) ) {
					$value = $adapter->from_control_value( $stored_row[ $key ], $control['fields'][ $key ] );

					if ( null !== $value ) {
						$row[ $key ] = $value;
					}
				}
			}

			$rows[] = $row;
		}

		return $rows;
	}

	/**
	 * @param array<string, mixed> $control
	 * @return array<string, V3_Setting_Adapter> Field key => adapter, for fields that map to a content setting.
	 */
	private function field_adapters( array $control ): array {
		$fields = is_array( $control['fields'] ?? null ) ? $control['fields'] : [];
		$adapters = [];

		foreach ( $fields as $key => $field ) {
			if ( self::ROW_ID_KEY === $key || ! is_array( $field ) ) {
				continue;
			}

			$adapter = V3_Setting_Adapter_Resolver::resolve( $field );

			if ( null !== $adapter ) {
				$adapters[ $key ] = $adapter;
			}
		}

		return $adapters;
	}

	private static function row_id(): string {
		return substr( md5( uniqid( '', true ) ), 0, self::ROW_ID_LENGTH );
	}
}
