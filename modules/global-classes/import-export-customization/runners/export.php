<?php

namespace Elementor\Modules\GlobalClasses\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Export\Export_Runner_Base;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\GlobalClasses\Global_Classes_Parser;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\ImportExportCustomization\Import_Export_Customization;
use Elementor\Modules\GlobalClasses\Module as Global_Classes_Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Export extends Export_Runner_Base {
	const ORDER_FILE = 'order.json';

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
			return $this->empty_result();
		}

		$repository = Global_Classes_Repository::make( $kit );
		$labels_by_id = [];
		$files = [];

		$skip_migration = true;
		$repository->each_item(
			static function ( array $class_data ) use ( &$files, &$labels_by_id ) {
				if ( empty( $class_data['id'] ) || ! is_string( $class_data['id'] ) ) {
					return;
				}

				$class_id = $class_data['id'];

				$files[] = [
					'path' => Import_Export_Customization::FILE_NAME . '/' . $class_id . '.json',
					'data' => wp_json_encode( $class_data ),
				];
				$labels_by_id[ $class_id ] = $class_data['label'] ?? $class_id;
			},
			$skip_migration
		);

		if ( empty( $files ) ) {
			return $this->empty_result();
		}

		$files[] = [
			'path' => Import_Export_Customization::FILE_NAME . '/' . self::ORDER_FILE,
			'data' => wp_json_encode( $this->build_order_entries( $kit, $labels_by_id ) ),
		];

		return [
			'files' => $files,
			'manifest' => [],
		];
	}

	private function build_order_entries( $kit, array $labels_by_id ): array {
		$repository_order = Global_Classes_Order::make( $kit )->set_preview( false )->get_order();
		$sanitized_order = Global_Classes_Parser::sanitize_order( $labels_by_id, $repository_order );

		return array_map(
			static fn( string $id ) => [
				'id' => $id,
				'label' => $labels_by_id[ $id ],
			],
			$sanitized_order
		);
	}

	private function empty_result(): array {
		return [
			'manifest' => [],
			'files' => [],
		];
	}
}
