<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Settings_Validator {

	private array $schema;

	public function __construct( array $schema ) {
		$this->schema = $schema;
	}

	public static function make( array $schema ): self {
		return new static( $schema );
	}

	/**
	 * @param array $settings
	 *
	 * @return array{
	 *     0: bool,
	 *     1: array<string, mixed>,
	 *     2: array<string>
	 * }
	 */
	public function validate( array $settings ): array {
		$validated = [];
		$errors = [];

		foreach ( $settings as $key => $value ) {
			$prop_type = $this->schema[ $key ] ?? null;

			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				continue;
			}

			$validators = $this->get_validators( $prop_type );

			$is_value_valid = $validators->some( fn( $validator ) => $validator( $value ) );

			if ( ! $is_value_valid ) {
				$errors[] = $key;
				continue;
			}

			$validated[ $key ] = $value;
		}

		$is_valid = empty( $errors );

		return [
			$is_valid,
			$validated,
			$errors,
		];
	}

	private function get_validators( Prop_Type $prop_type ): Collection {
		return Collection::make( [ $prop_type ] )
			->push( ...$prop_type->get_additional_types() )
			->map( fn( Prop_Type $type ) => $this->wrap_validator( $type ) );
	}

	private function wrap_validator( Prop_Type $prop_type ): callable {
		return function ( $value ) use ( $prop_type ) {
			try {
				$prop_type->validate( $value );
			} catch ( \Exception $e ) {
				return false;
			}

			return true;
		};
	}
}
