<?php

namespace Elementor\Modules\GlobalClasses\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Export\Export_Runner_Base;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\GlobalClasses\Global_Classes_Parser;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\ImportExportCustomization\Import_Export_Customization;
use Elementor\Modules\GlobalClasses\Module as Global_Classes_Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Export extends Export_Runner_Base {
	public static function get_name(): string {
		return 'global-classes';
	}

	public function should_export( array $data ): bool {
		return (
			isset( $data['include'] ) &&
			in_array( 'settings', $data['include'], true ) &&
			$this->is_classes_enabled( $data )
		);
	}

	private function is_classes_enabled( array $data ): bool {
		if ( ! $this->is_feature_active() ) {
			return false;
		}

		if ( isset( $data['customization']['settings']['classes'] ) ) {
			return (bool) $data['customization']['settings']['classes'];
		}

		return true;
	}

	private function is_feature_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( Global_Classes_Module::NAME )
			&& Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME );
	}

	public function export( array $data ): array {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			return [
				'manifest' => [],
				'files' => [],
			];
		}

		$global_classes = Global_Classes_Repository::make()->all()->get();

		$global_classes_result = Global_Classes_Parser::make()->parse( $global_classes );

		if ( ! $global_classes_result->is_valid() ) {
			return [
				'manifest' => [],
				'files' => [],
			];
		}

		$classes_data = $global_classes_result->unwrap();

		if ( empty( $classes_data['items'] ) ) {
			return [
				'manifest' => [],
				'files' => [],
			];
		}

		return [
			'files' => [
				'path' => Import_Export_Customization::FILE_NAME,
				'data' => $classes_data,
			],
			'manifest' => [],
		];
	}
}
