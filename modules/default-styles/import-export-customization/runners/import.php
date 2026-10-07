<?php

namespace Elementor\Modules\DefaultStyles\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Design_System_Import_Context;
use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Import_Runner_Base;
use Elementor\App\Modules\ImportExportCustomization\Utils as ImportExportUtils;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\DefaultStyles\Default_Styles_Repository;
use Elementor\Modules\DefaultStyles\ImportExportCustomization\Import_Export_Customization;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import extends Import_Runner_Base {
	const EMPTY_RESULT = [
		'created' => [],
		'replaced' => [],
		'skipped' => [],
		'failed' => [],
	];

	public static function get_name(): string {
		return 'default-styles';
	}

	public function should_import( array $data ): bool {
		$import_context = Design_System_Import_Context::from_data( $data );

		return (
			$import_context->is_included() &&
			! empty( $data['extracted_directory_path'] ) &&
			$this->is_feature_active() &&
			$this->is_default_styles_enabled( $data )
		);
	}

	private function is_feature_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME );
	}

	private function is_default_styles_enabled( array $data ): bool {
		if ( isset( $data['customization']['settings']['defaultStyles'] ) ) {
			return (bool) $data['customization']['settings']['defaultStyles'];
		}

		return true;
	}

	public function import( array $data, array $imported_data ): array {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$default_styles_dir = $data['extracted_directory_path'] . '/' . Import_Export_Customization::DIRECTORY_NAME;

		if ( ! $kit || ! is_dir( $default_styles_dir ) ) {
			return self::EMPTY_RESULT;
		}

		$repository = Default_Styles_Repository::make( $kit );
		$should_skip_existing = $this->should_skip_existing_styles( $data );
		$result = self::EMPTY_RESULT;

		foreach ( glob( $default_styles_dir . '/*.json' ) as $file_path ) {
			$tag = basename( $file_path, '.json' );

			if ( ! Default_Styles_Repository::is_allowed_tag( $tag ) ) {
				$result['failed'][] = [ 'tag' => $tag ];
				continue;
			}

			$existing = $repository->get( $tag );

			if ( $existing && $should_skip_existing ) {
				$result['skipped'][] = [ 'tag' => $tag ];
				continue;
			}

			$style_data = ImportExportUtils::read_json_file( $file_path );

			if ( ! $style_data ) {
				$result['failed'][] = [ 'tag' => $tag ];
				continue;
			}

			if ( ! $repository->put( $tag, $style_data ) ) {
				$result['failed'][] = [ 'tag' => $tag ];
				continue;
			}

			$result[ $existing ? 'replaced' : 'created' ][] = [ 'tag' => $tag ];
		}

		return $result;
	}

	private function should_skip_existing_styles( array $data ): bool {
		$import_context = Design_System_Import_Context::from_data( $data );

		if ( $import_context->is_settings() ) {
			return false;
		}

		return 'skip' === ( $data['customization']['design-system']['conflict_resolution'] ?? 'skip' );
	}
}
