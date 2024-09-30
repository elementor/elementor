<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Styles_Validator {

	private array $schema;

	public function __construct() {
		$this->schema = Style_Schema::get();
	}

	public static function make( array $schema ): self {
		return new static( $schema );
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
					'props' => [],
				];
				foreach ( $variant['props'] as $key => $value ) {
					$prop_type = $this->schema[ $key ] ?? null;

					if ( ! ( $prop_type instanceof Prop_Type ) ) {
						continue;
					}

					try {
						$prop_type->validate_with_additional( $value );
					} catch ( \Exception $e ) {
						$errors[] = $key;
						continue;
					}

					$validated[ $style_id ][ $variant_index ]['props'][ $key ] = $value;
				}
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
