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
class Repeater_Setting_Adapter implements V3_Setting_Adapter, V3_Plain_Value_Guard {

	const CONTROL_TYPE = 'repeater';

	const ROW_ID_KEY = '_id';

	const ROW_ID_LENGTH = 7;

	/**
	 * Rows must be a list of objects that only use the repeater's own fields, and each field gets the
	 * same vetting as a standalone setting, so nothing is silently stripped from a row.
	 */
	public function reject_reason( $plain, array $control ): ?string {
		if ( ! is_array( $plain ) || $plain !== array_values( $plain ) ) {
			return 'is not a list of rows';
		}

		$adapters = $this->field_adapters( $control );

		foreach ( $plain as $index => $row ) {
			if ( ! is_array( $row ) || ( [] !== $row && $row === array_values( $row ) ) ) {
				return sprintf( 'has row %d that is not an object', $index );
			}

			$unknown = array_diff( array_keys( $row ), array_keys( $adapters ) );

			if ( ! empty( $unknown ) ) {
				return sprintf( 'has row %d with unsupported keys (%s; allowed: %s)', $index, implode( ', ', $unknown ), implode( ', ', array_keys( $adapters ) ) );
			}

			foreach ( $row as $key => $value ) {
				$adapter = $adapters[ $key ];

				if ( $adapter instanceof V3_Plain_Value_Guard ) {
					$reason = $adapter->reject_reason( $value, $control['fields'][ $key ] );

					if ( null !== $reason ) {
						return sprintf( 'has row %d where "%s" %s', $index, $key, $reason );
					}
				}
			}
		}

		return null;
	}

	public function supports( array $control ): bool {
		return self::CONTROL_TYPE === ( $control['type'] ?? null ) && ! empty( $this->field_adapters( $control ) );
	}

	public function prop_type( array $control ): Prop_Type {
		$shape = [];

		foreach ( $this->field_adapters( $control ) as $key => $adapter ) {
			$shape[ $key ] = $adapter->prop_type( $control['fields'][ $key ] );
		}

		return V3_Repeater_Prop_Type::make()->set_item_shape( $shape );
	}

	public function to_control_value( array $prop_value, array $control ) {
		$rows = is_array( $prop_value['value'] ?? null ) ? $prop_value['value'] : [];
		$adapters = $this->field_adapters( $control );
		$stored = [];

		foreach ( $rows as $index => $row ) {
			$values = is_array( $row['value'] ?? null ) ? $row['value'] : [];
			$stored_row = [];

			foreach ( $adapters as $key => $adapter ) {
				if ( is_array( $values[ $key ] ?? null ) ) {
					$stored_row[ $key ] = $adapter->to_control_value( $values[ $key ], $control['fields'][ $key ] );
				}
			}

			$stored[] = [ self::ROW_ID_KEY => self::row_id( $index, $stored_row ) ] + $stored_row;
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

	/**
	 * Derived from the row's position and content so that writing the same rows again keeps their ids,
	 * which makes read-then-write idempotent.
	 *
	 * @param int                  $index
	 * @param array<string, mixed> $stored_row
	 */
	private static function row_id( int $index, array $stored_row ): string {
		return substr( md5( $index . wp_json_encode( $stored_row ) ), 0, self::ROW_ID_LENGTH );
	}
}
