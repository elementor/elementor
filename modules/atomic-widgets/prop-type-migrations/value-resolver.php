<?php

namespace Elementor\Modules\AtomicWidgets\PropTypeMigrations;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Value_Resolver {
	private const CURRENT_REF = '$$current';

	private $current_value;

	private function __construct( $current_value ) {
		$this->current_value = $current_value;
	}

	public static function make( $current_value ): self {
		return new self( $current_value );
	}

	public function resolve( $value_definition ) {
		if ( is_string( $value_definition ) ) {
			return $this->resolve_string( $value_definition );
		}

		if ( is_array( $value_definition ) ) {
			return $this->resolve_array( $value_definition );
		}

		return $value_definition;
	}

	public static function is_reference( $value ): bool {
		if ( is_string( $value ) ) {
			return self::CURRENT_REF === $value || 0 === strpos( $value, self::CURRENT_REF . '.' );
		}

		if ( is_array( $value ) ) {
			foreach ( $value as $item ) {
				if ( self::is_reference( $item ) ) {
					return true;
				}
			}
		}

		return false;
	}

	private function resolve_string( string $value ) {
		if ( self::CURRENT_REF === $value ) {
			return $this->current_value;
		}

		if ( 0 === strpos( $value, self::CURRENT_REF . '.' ) ) {
			$path = substr( $value, strlen( self::CURRENT_REF ) + 1 );

			return $this->get_nested_value( $path );
		}

		return $value;
	}

	private function resolve_array( array $value ): array {
		$result = [];

		foreach ( $value as $key => $item ) {
			$result[ $key ] = $this->resolve( $item );
		}

		return $result;
	}

	private function get_nested_value( string $path ) {
		if ( ! is_array( $this->current_value ) ) {
			return null;
		}

		$keys = explode( '.', $path );
		$current = $this->current_value;

		foreach ( $keys as $key ) {
			if ( ! is_array( $current ) || ! array_key_exists( $key, $current ) ) {
				return null;
			}

			$current = $current[ $key ];
		}

		return $current;
	}
}
