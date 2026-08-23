<?php

namespace Elementor\Modules\DefaultStyles\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Export\Export_Runner_Base;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\DefaultStyles\Default_Styles_Repository;
use Elementor\Modules\DefaultStyles\ImportExportCustomization\Import_Export_Customization;
use Elementor\Modules\DefaultStyles\Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Export extends Export_Runner_Base {
	public static function get_name(): string {
		return 'default-styles';
	}

	public function should_export( array $data ): bool {
		return (
			isset( $data['include'] ) &&
			in_array( 'settings', $data['include'], true ) &&
			$this->is_feature_active()
		);
	}

	private function is_feature_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( Module::EXPERIMENT_NAME )
			&& Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME );
	}

	public function export( array $data ): array {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			return $this->empty_result();
		}

		$files = [];
		$skip_migration = true;

		Default_Styles_Repository::make( $kit )->each_item(
			static function ( array $style_data ) use ( &$files ) {
				if ( empty( $style_data['id'] ) || ! is_string( $style_data['id'] ) ) {
					return;
				}

				$tag = $style_data['id'];

				$files[] = [
					'path' => Import_Export_Customization::DIRECTORY_NAME . '/' . $tag . '.json',
					'data' => wp_json_encode( $style_data ),
				];
			},
			$skip_migration
		);

		if ( empty( $files ) ) {
			return $this->empty_result();
		}

		return [
			'files' => $files,
			'manifest' => [],
		];
	}

	private function empty_result(): array {
		return [
			'manifest' => [],
			'files' => [],
		];
	}
}
