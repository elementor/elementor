<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\Mcp\Abilities\Utils\Plain_Schema_Validator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Writes plain map settings the V4 way: check the raw value against the schema `get-widget-schemas`
 * publishes, run the setting's explicit exceptions, resolve it against the setting's prop type, then
 * let the setting adapter convert it to the control's storage.
 * Invalid values are skipped and reported instead of failing the request.
 */
class V3_Map_Settings_Writer {

	const REASON_SCHEMA = 'does not match the published schema (%s)';

	const REASON_UNRESOLVED = 'could not be resolved';

	const REASON_INVALID = 'failed validation';

	private Plain_Values_Resolver $plain_values_resolver;

	private Plain_Schema_Validator $schema_validator;

	public function __construct( Plain_Values_Resolver $plain_values_resolver ) {
		$this->plain_values_resolver = $plain_values_resolver;
		$this->schema_validator = Plain_Schema_Validator::strict();
	}

	/**
	 * @param Compiled_V3_Map      $map
	 * @param array<string, mixed> $plain Public setting key => plain value. Null clears the setting.
	 * @return array{settings: array<string, mixed>, rejected: array<string, string>}
	 */
	public function write( Compiled_V3_Map $map, array $plain ): array {
		$settings = [];
		$rejected = [];
		$map_settings = $map->get_settings();

		foreach ( $plain as $public_key => $value ) {
			$setting = $map_settings[ $public_key ] ?? null;

			if ( null === $setting ) {
				continue;
			}

			if ( null === $value ) {
				$settings[ $setting->get_control_key() ] = null;
				continue;
			}

			if ( [] === $value && $setting->accepts_empty_list() ) {
				$settings[ $setting->get_control_key() ] = [];
				continue;
			}

			$checked = $this->schema_validator->validate( $value, $setting->get_published_schema(), $public_key );

			if ( null !== $checked['error'] ) {
				$rejected[ $public_key ] = sprintf( self::REASON_SCHEMA, $checked['error'] );
				continue;
			}

			$reason = $setting->reject_reason( $checked['value'] );

			if ( null !== $reason ) {
				$rejected[ $public_key ] = $reason;
				continue;
			}

			$prop_value = $this->to_prop_value( $setting, $checked['value'] );

			if ( is_string( $prop_value ) ) {
				$rejected[ $public_key ] = $prop_value;
				continue;
			}

			$settings[ $setting->get_control_key() ] = $setting->to_control_value( $prop_value );
		}

		return [
			'settings' => $settings,
			'rejected' => $rejected,
		];
	}

	/**
	 * @param Compiled_V3_Setting $setting
	 * @param mixed               $value
	 * @return array<string, mixed>|string Sanitized prop value, or the rejection reason.
	 */
	private function to_prop_value( Compiled_V3_Setting $setting, $value ) {
		$prop_type = $setting->get_prop_type();
		$resolved = $this->plain_values_resolver->resolve( $value, $prop_type );

		if ( ! is_array( $resolved ) ) {
			return self::REASON_UNRESOLVED;
		}

		$parser = Props_Parser::make( [ 'value' => $prop_type ] );

		if ( ! $parser->validate( [ 'value' => $resolved ] )->is_valid() ) {
			return self::REASON_INVALID;
		}

		$sanitized = $parser->sanitize( [ 'value' => $resolved ] )->unwrap()['value'] ?? null;

		return is_array( $sanitized ) ? $sanitized : self::REASON_INVALID;
	}
}
