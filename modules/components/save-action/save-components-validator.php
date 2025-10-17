<?php

namespace Elementor\Modules\Components\SaveAction;

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

	public function validate( Save_Components_DTO $dto ) {
		$errors = Collection::make( [
			$this->validate_count( $dto ),
			$this->validate_editable( $dto ),
			$this->validate_duplicated_names( $dto ),
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

	private function validate_count( Save_Components_DTO $dto ): array {
		$current = $this->components->filter(
			function ( $component ) use ( $dto ) {
				return ! $dto->get_deleted()->contains( $component['id'] ) ||
					$dto->get_modified()->contains( $component['id'] ) ||
					$dto->get_added()->contains( $component['id'] );
			}
		);

		$count = $current->count() + $dto->get_added()->count() + $dto->get_modified()->count();

		if ( $count > self::MAX_COMPONENTS ) {
			return [ esc_html__( 'Maximum number of components exceeded.', 'elementor' ) ];
		}

		return [];
	}

	private function validate_editable( Save_Components_DTO $dto ): array {
		return $dto->get_deleted()
			->merge( $dto->get_modified() )
			->map( function ( $id ) {
				/** @var Component $component */
				$component = $this->components->get( $id );

				// If component not exists, it will not be deleted, or will be created as new if marked as modified.
				if ( ! $component ) {
					return [];
				}

				if ( ! $component->is_editable_by_current_user() ) {
					return [
						sprintf(
							// translators: %s Component name.
							esc_html__( 'You don\'t have permission to edit component "%s."', 'elementor' ),
							$component->get_name()
						),
					];
				}

				return [];
			} )
			->flatten()
			->values();
	}

	private function validate_duplicated_names( Save_Components_DTO $dto ): array {
		return $dto->get_data()
			->map( function ( $component ) {
				$title = $component['title'];

				$is_name_exists = $this->components->some(
					fn ( Component $component ) => $component->get_name() === $title
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
