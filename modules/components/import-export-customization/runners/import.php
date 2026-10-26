<?php

namespace Elementor\Modules\Components\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Elementor_Content;
use Elementor\App\Modules\ImportExportCustomization\Utils as ImportExportUtils;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\ImportExport\Imported_Components_Registry;
use Elementor\Modules\Components\Utils\Sort_Components_By_Dependencies;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Import extends Elementor_Content {
	public static function get_name(): string {
		return 'components';
	}

	public function import( array $data, array $imported_data ) {
		Imported_Components_Registry::reset();

		return parent::import( $data, $imported_data );
	}

	protected function get_import_post_types( array $data ): array {
		return [ Component_Document::TYPE ];
	}

	protected function prepare_posts_settings( array $posts_settings, string $path ): array {
		$dependencies = ImportExportUtils::read_json_file(
			$path . basename( Component_Document::EXPORT_DEPENDENCIES_FILE_PATH )
		)['dependencies'] ?? [];

		$sorted_ids = Sort_Components_By_Dependencies::apply( array_keys( $posts_settings ), $dependencies );
		$sorted_posts_settings = [];

		foreach ( $sorted_ids as $component_id ) {
			if ( isset( $posts_settings[ $component_id ] ) ) {
				$sorted_posts_settings[ $component_id ] = $posts_settings[ $component_id ];
			}
		}

		return $sorted_posts_settings;
	}
}
