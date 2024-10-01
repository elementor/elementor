<?php

namespace Elementor\Modules\AtomicWidgets\Validators;

use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Styles_Validator {

	private array $schema;

	public function __construct() {
		$this->schema = Style_Schema::get();
	}

	public static function make(): self {
		return new static();
	}

	/**
	 * @param array $styles
	 *
	 * @return array{
	 *     0: bool,
	 *     1: array<string, mixed>,
	 *     2: array<string>
	 * }
	 */
	public function validate( array $styles ): array {
		$validated = [];
		$errors = [];

		foreach ( $styles as $style_id => $style ) {
			$validated[ $style_id ] = [];
			foreach ( $style['variants'] as $variant_index => $variant ) {
				$validated[ $style_id ][ $variant_index ] = [
					'meta' => $variant['meta'],
				];

				[,$validated_props, $variant_errors] = Props_Validator::make( $this->schema )->validate( $variant['props'] );

				$validated[ $style_id ]['variants'][ $variant_index ]['props'] = $validated_props;
				$errors = array_merge( $errors, $variant_errors );
			}
		}

		$is_valid = empty( $errors );

		return [
			$is_valid,
			$validated,
			$errors,
		];
	}
}
