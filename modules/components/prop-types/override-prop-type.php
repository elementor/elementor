<?php

namespace Elementor\Modules\Components\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Override_Prop_Type extends Plain_Prop_Type {
	public static function get_key(): string {
		return 'override';
	}

	protected function validate_value( $value ): bool {
		if ( ! is_array( $value ) ) {
			return false;
		}

		$required_fields = [
			'override_key' => 'is_string',
			'override_value' => fn( $value ) => is_null( $value ) || is_array( $value ),
			'schema_source' => 'is_array',
		];

		$is_valid_structure = true;
		foreach ( $required_fields as $field => $validator ) {
			if ( ! array_key_exists( $field, $value ) || ! call_user_func( $validator, $value[ $field ] ) ) {
				$is_valid_structure = false;
				break;
			}
		}

		if ( ! $is_valid_structure ) {
			return false;
		}

		$parser = $this->get_parser( sanitize_text_field( $value['schema_source']['type'] ) );

		if ( ! $parser || ! $parser instanceof Override_Parser ) {
			return false;
		}

		return $parser->validate( $value );
	}

	protected function sanitize_value( $value ): ?array {
		$parser = $this->get_parser( sanitize_text_field( $value['schema_source']['type'] ) );

		if ( ! $parser ) {
			return null;
		}

		return $parser->sanitize( $value );
	}

	private function get_parser( string $schema_source_type ): ?Override_Parser {
		switch ( $schema_source_type ) {
			case Component_Override_Parser::get_override_type():
				return Component_Override_Parser::make();
			default:
				return null;
		}
	}
}
