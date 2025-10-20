<?php
namespace Elementor\App\Modules\ImportExportCustomization\Data\Routes\Traits;

use Elementor\App\Modules\ImportExportCustomization\Data\Response;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

trait Handles_Quota_Errors {

	private function is_quota_error( $error_message ) {
		return $error_message === \Elementor\Modules\CloudKitLibrary\Connect\Cloud_Kits::INSUFFICIENT_STORAGE_QUOTA;
	}

	private function get_quota_error_response( $quota, $kit_data ) {
		$max_size_gb = 0;
		if ( ! empty( $quota['storage']['threshold'] ) ) {
			$max_size_gb = round( $quota['storage']['threshold'] / ( 1024 * 1024 * 1024 ), 2 );
		}

		$filename = __( 'This file', 'elementor' );
		if ( ! empty( $kit_data['title'] ) ) {
			$filename = '"' . $kit_data['title'] . '"';
		} elseif ( ! empty( $kit_data['fileName'] ) ) {
			$filename = '"' . $kit_data['fileName'] . '"';
		}

		return Response::error(
			\Elementor\Modules\CloudKitLibrary\Connect\Cloud_Kits::INSUFFICIENT_STORAGE_QUOTA,
			[
				'placeholders' => [
					'filename' => $filename,
					'maxSize' => $max_size_gb,
				],
			]
		);
	}
}
