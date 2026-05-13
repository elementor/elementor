<?php
namespace Elementor\Modules\Components\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Override_Parser {
	public static function make(): self {
		return new static();
	}

	abstract public static function get_override_type(): string;

	/**
	 * @param array{override_key: string, override_value: ?array, schema_source: array} $value
	 */
	public function validate( $value ): bool {
		[ 'override_key' => $override_key, 'override_value' => $override_value, 'schema_source' => $schema_source ] = $value;

		if ( ! isset( $schema_source['type'] ) || $schema_source['type'] !== $this->get_override_type() ) {
			return false;
		}

		return $this->validate_override( $override_key, $override_value, $schema_source );
	}

	abstract public function validate_override( string $override_key, ?array $override_value, array $schema_source ): bool;

	/**
	 * @param array{override_key: string, override_value: array, schema_source: array} $value
	 */
	abstract public function sanitize( $value );
}
