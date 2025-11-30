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
			$this->validate_duplicated_values( $data ),
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

	private function validate_duplicated_values( Collection $data ): array {
		return $data
			->map( function ( $component ) use ( $data ) {
				$errors = [];

				$title = $component['title'];
				$uid = $component['uid'];

				$is_title_exists = $this->components->some(
					fn ( $component ) => $component['title'] === $title
				) || $data->filter(
					fn ( $component ) => $component['title'] === $title
				)->count() > 1;

				if ( $is_title_exists ) {
					$errors[] = [
						sprintf(
							// translators: %s Component title.
							esc_html__( "Component title '%s' is duplicated.", 'elementor' ),
							$title
						),
					];
				}

				$is_uid_exists = $this->components->some(
					fn ( $component ) => $component['uid'] === $uid
				) || $data->filter(
					fn ( $component ) => $component['uid'] === $uid
				)->count() > 1;

				if ( $is_uid_exists ) {
					$errors[] = [
						sprintf(
							// translators: %s Component uid.
							esc_html__( "Component uid '%s' is duplicated.", 'elementor' ),
							$uid
						),
					];
				}

				return $errors;
			} )
			->flatten()
			->flatten()
			->unique()
			->values();
	}
}
