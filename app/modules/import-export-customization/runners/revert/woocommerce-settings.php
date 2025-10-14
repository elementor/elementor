<?php
namespace Elementor\App\Modules\ImportExportCustomization\Runners\Revert;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Woocommerce_Settings extends Revert_Runner_Base {

	public static function get_name(): string {
		return 'woocommerce-settings';
	}

	public function should_revert( array $data ): bool {
		return isset( $data['runners'][ static::get_name() ] );
	}

	public function revert( array $data ) {
		$runner_data = $data['runners'][ static::get_name() ];

		$previous_pages = $runner_data['previous_pages'] ?? [];

		foreach ( $previous_pages as $key => $value ) {
			update_option( $key, $value );
		}
	}
}

