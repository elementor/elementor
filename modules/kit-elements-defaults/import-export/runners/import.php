<?php
namespace Elementor\Modules\KitElementsDefaults\ImportExport\Runners;

use Elementor\Plugin;
use Elementor\Modules\KitElementsDefaults\Module;
use Elementor\App\Modules\ImportExport\Utils as ImportExportUtils;
use Elementor\App\Modules\ImportExport\Runners\Import\Import_Runner_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Import extends Import_Runner_Base {
	public static function get_name() : string {
		return 'kit-elements-defaults';
	}

	public function should_import( array $data ) {
		// Together with site-settings.
		return (
			isset( $data['include'] ) &&
			in_array( 'settings', $data['include'], true ) &&
			! empty( $data['site_settings']['settings'] ) &&
			! empty( $data['extracted_directory_path'] )
		);
	}

	public function import( array $data ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$data = ImportExportUtils::read_json_file( $data['extracted_directory_path'] . '/kit-elements-defaults.json' );

		if ( ! $kit || ! $data ) {
			return [];
		}

		// TODO: Here should sanitize the data.
		// TODO: Maybe merge to the old kit?

		$kit->update_meta(
			Module::META_KEY,
			wp_slash( wp_json_encode( $data ) )
		);

		return $data;
	}
}
