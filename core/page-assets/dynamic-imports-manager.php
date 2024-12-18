<?php
namespace Elementor\Core\Page_Assets;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Imports_Manager {
	private array $registered_imports = [];

	private array $queued_imports = [];

	public function create_registration_hook(): void {
		/**
		 * Fires to allow developers to add dynamic imports.
		 *
		 * @param Dynamic_Imports_Manager $this Current instance of the manager.
		 */
		do_action( 'elementor/frontend/register_dynamic_imports', $this );
	}

	public function register_dynamic_import( string $class_name, string|array $group_names, string $relative_path, array $dependencies = [], bool $initialize_class = false ): void {
        $groups = is_array( $group_names ) ? $group_names : [ $group_names ];

        $this->registered_imports[ $class_name ] = [
			'groups' => $groups,
			'path' => $relative_path,
			'dependencies' => $dependencies,
			'initializeClass' => $initialize_class
		];
	}

	public function queue_dynamic_import( $import ): void {
		$this->queued_imports[] = $import;
	}

	public function get_enqueued_imports(): array {
		$transformed_imports = [];
		$this->transform_queued_imports( $transformed_imports );
		return $this->group_transformed_imports( $transformed_imports );
	}

	private function transform_queued_imports( array &$transformed_imports ): void {
		foreach ( $this->queued_imports as $queued_import ) {
			if ( isset( $this->registered_imports[ $queued_import ] ) ) {
				$transformed_imports[ $queued_import ] = $this->registered_imports[ $queued_import ];
				$this->handle_dependencies( $transformed_imports, $queued_import );
			}
		}
	}

	private function handle_dependencies(  array &$transformed_imports, string $queued_import ): void {
		$dependencies = $this->registered_imports[ $queued_import ]['dependencies'];

		if ( ! empty( $dependencies ) ) {
			foreach ( $dependencies as $dependency ) {
				if ( isset( $this->registered_imports[ $dependency ] ) ) {
					$transformed_imports[ $dependency ] = $this->registered_imports[ $dependency ];
				}
			}
		}
	}

	private function group_transformed_imports( array $transformed_imports ): array {
		$grouped_imports = [];

		foreach ( $transformed_imports as $key => $import) {
            $groups = $import['groups'] ?? [];
            unset( $import['groups'] );

            foreach ( $groups as $group ) {
                $grouped_imports[ $group ][ $key ] = $import;
            }
		}

		return $grouped_imports;
	}
}
