<?php

namespace Elementor\Modules\Components;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Components\Documents\Component;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Save_Components_Validator {
	const MAX_COMPONENTS = 50;

	private Collection $components;

	public function __construct( Collection $components ) {
		$this->components = $components;
	}

	public static function make( Collection $components ) {
		return new static( $components );
	}

	public function validate( Collection $data ) {
		$errors = Collection::make( [
			$this->validate_count( $data ),
			$this->validate_duplicated_names( $data ),
		] )->flatten();

		if ( $errors->is_empty() ) {
			return [
				'success' => true,
				'messages' => [],
			];
		}

		return [
			'success' => false,
			'messages' => $errors->values(),
		];
	}

	private function validate_count( Collection $data ): array {
		$count = $this->components->count() + $data->count();

		if ( $count > self::MAX_COMPONENTS ) {
			return [ esc_html__( 'Maximum number of components exceeded.', 'elementor' ) ];
		}

		return [];
	}

	private function validate_duplicated_names( Collection $data ): array {
		return $data
			->map( function ( $component ) {
				$title = $component['title'];

				$is_name_exists = $this->components->some(
					fn ( $component ) => $component['name'] === $title
				);

				if ( $is_name_exists ) {
					return [
						sprintf(
							// translators: %s Component name.
							esc_html__( "Component name '%s' is duplicated.", 'elementor' ),
							$title
						),
					];
				}

				return [];
			} )
			->flatten()
			->values();
	}
}
