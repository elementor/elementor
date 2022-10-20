<?php
namespace Elementor\Modules\KitElementsDefaults\ImportExport\Runners;

use Elementor\Plugin;
use Elementor\Modules\KitElementsDefaults\Module;
use Elementor\App\Modules\ImportExport\Runners\Export\Export_Runner_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Export extends Export_Runner_Base {
	public static function get_name() : string {
		return 'kit-elements-defaults';
	}

	public function should_export( array $data ) {
		// Together with site-settings.
		return (
			isset( $data['include'] ) &&
			in_array( 'settings', $data['include'], true )
		);
	}

	public function export( array $data ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( ! $kit ) {
			return [
				'manifest' => [],
				'files' => [],
			];
		}

		$default_values = $kit->get_json_meta( Module::META_KEY );

		if ( ! $default_values ) {
			return [
				'manifest' => [],
				'files' => [],
			];
		}

		// TODO: Here should sanitize the data.

		return [
			'files' => [
				'path' => 'kit-elements-defaults',
				'data' => $default_values,
			],
		];
	}
}
