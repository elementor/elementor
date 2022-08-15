<?php
namespace Elementor\Core\App\Modules\ImportExport\Runners;

use Elementor\Plugin;
use Elementor\Core\Settings\Page\Manager as PageManager;

class Site_Settings extends Runner_Base {

	public static function get_name() {
		return 'site-settings';
	}

	public function should_import( array $data ) {
		return (
			isset( $data['include'] ) &&
			in_array( 'settings', $data['include'], true ) &&
			! empty( $data['site_settings']['settings'] )
		);
	}

	public function should_export( array $data ) {
		return (
			isset( $data['include'] ) &&
			in_array( 'settings', $data['include'], true )
		);
	}

	public function import( array $data, array $imported_data ) {
		$new_site_settings = $data['site_settings']['settings'];
		$title = isset( $data['manifest']['title'] ) ? $data['manifest']['title'] : 'Imported Kit';

		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$old_settings = $kit->get_meta( PageManager::META_KEY );

		if ( ! $old_settings ) {
			$old_settings = [];
		}

		if ( ! empty( $old_settings['custom_colors'] ) ) {
			$new_site_settings['custom_colors'] = array_merge( $old_settings['custom_colors'], $new_site_settings['custom_colors'] );
		}

		if ( ! empty( $old_settings['custom_typography'] ) ) {
			$new_site_settings['custom_typography'] = array_merge( $old_settings['custom_typography'], $new_site_settings['custom_typography'] );
		}

		$new_site_settings = array_replace_recursive( $old_settings, $new_site_settings );

		$new_kit = Plugin::$instance->kits_manager->create_new_kit( $title, $new_site_settings );

		$result['site-settings'] = (bool) $new_kit;

		return $result;
	}

	public function export( array $data ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit_data = $kit->get_export_data();
		$kit_tabs = $kit->get_tabs();

		$excluded_kit_settings_keys = [
			'site_name',
			'site_description',
			'site_logo',
			'site_favicon',
		];

		foreach ( $excluded_kit_settings_keys as $setting_key ) {
			unset( $kit_data['settings'][ $setting_key ] );
		}

		unset( $kit_tabs['settings-site-identity'] );

		$kit_tabs = array_keys( $kit_tabs );
		$manifest_data['site-settings'] = $kit_tabs;

		return [
			'files' => [
				'path' => 'site-settings',
				'data' => $kit_data,
			],
			'manifest' => [
				$manifest_data,
			],
		];
	}
}
