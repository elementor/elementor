<?php

namespace Elementor\App\Modules\ImportExportCustomization\Runners\Export;

class Plugins extends Export_Runner_Base {

	public static function get_name(): string {
		return 'plugins';
	}

	public function should_export( array $data ) {
		return (
			isset( $data['include'] ) &&
			in_array( 'plugins', $data['include'], true ) &&
			is_array( $data['selected_plugins'] )
		);
	}

	public function export( array $data ) {
		$customization = $data['customization']['plugins'] ?? null;

		if ( $customization ) {
			$selected_plugin_keys = array_keys( array_filter( $customization ) );
			$plugins = array_intersect_key( $data['selected_plugins'], array_flip( $selected_plugin_keys ) );
		} else {
			$plugins = $data['selected_plugins'];
		}

		return [
			'manifest' => [
				[ 'plugins' => $plugins ],
			],
			'files' => [],
		];
	}
}
