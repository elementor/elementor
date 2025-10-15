<?php
namespace Elementor\App\Modules\ImportExportCustomization\Runners\Import;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Woocommerce_Settings extends Import_Runner_Base {

	const KEYS_TO_IMPORT = [
		'woocommerce_cart_page_id',
		'woocommerce_checkout_page_id',
		'woocommerce_myaccount_page_id',
		'woocommerce_terms_page_id',
		'elementor_woocommerce_purchase_summary_page_id',
		'woocommerce_shop_page_id',
	];

	private $old_values = [];
	private $imported_pages = [];

	public static function get_name(): string {
		return 'woocommerce-settings';
	}

	public function should_import( array $data ) {
		return (
			isset( $data['include'] ) &&
			in_array( 'settings', $data['include'], true ) &&
			! empty( $data['site_settings']['settings'] )
		);
	}

	public function import( array $data, array $imported_data ) {
		$new_site_settings = $data['site_settings']['settings'];

		$pages = $imported_data['content']['page']['succeed'];

		$imported = false;

		foreach ( self::KEYS_TO_IMPORT as $key ) {
			$value = $new_site_settings[ $key ] ?? null;
			if ( isset( $pages[ $value ] ) ) {
				$page = $pages[ $value ];

				$this->old_values[ $key ] = get_option( $key );
				$update_result = update_option( $key, $page );
				if ( $update_result ) {
					$this->imported_pages[ $key ] = $page;
					$imported = true;
				}
			}
		}

		return [ 'woocommerce-settings' => $imported ];
	}

	public function get_import_session_metadata(): array {
		return [
			'previous_pages' => $this->old_values,
			'imported_pages' => $this->imported_pages,
		];
	}
}
