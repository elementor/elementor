<?php

namespace Elementor\App\Modules\ImportExportCustomization\Runners\Export;

use Elementor\Core\Utils\Collection;

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
			return $this->export_with_customization( $data, $customization );
		}

		return $this->export_all( $data );
	}

	private function export_with_customization( array $data, array $customization ) {
		$result = apply_filters( 'elementor/import-export-customization/export/plugins/customization', null, $data, $customization, $this );

		if ( is_array( $result ) ) {
			return $result;
		}

		return $this->export_all( $data );
	}

	private function export_all( array $data ) {
		$plugins = $data['selected_plugins'];

		return [
			'manifest' => [
				[ 'plugins' => array_values( $plugins ) ],
			],
			'files' => [],
		];
	}
}
