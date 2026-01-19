<?php

namespace Elementor\Modules\Variables\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Export\Export_Runner_Base;
use Elementor\Modules\Variables\ImportExportCustomization\Import_Export_Customization;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Export extends Export_Runner_Base {
	public static function get_name(): string {
		return 'global-variables';
	}

	public function should_export( array $data ): bool {
		return (
			isset( $data['include'] ) &&
			in_array( 'settings', $data['include'], true ) &&
			$this->is_variables_enabled( $data )
		);
	}

	private function is_variables_enabled( array $data ): bool {
		if ( isset( $data['customization']['settings']['variables'] ) ) {
			return (bool) $data['customization']['settings']['variables'];
		}

		return true;
	}

	public function export( array $data ): array {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			return [
				'manifest' => [],
				'files' => [],
			];
		}

		$repository = new Variables_Repository( $kit );
		$collection = $repository->load();

		$variables_data = $collection->serialize();

		if ( empty( $variables_data['data'] ) ) {
			return [
				'manifest' => [],
				'files' => [],
			];
		}

		return [
			'files' => [
				'path' => Import_Export_Customization::FILE_NAME,
				'data' => $variables_data,
			],
			'manifest' => [],
		];
	}
}
