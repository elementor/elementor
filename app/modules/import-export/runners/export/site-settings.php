<?php
namespace Elementor\App\Modules\ImportExport\Runners\Export;

use Elementor\Plugin;

class Site_Settings extends Export_Runner_Base {

	public static function get_name(): string {
		return 'site-settings';
	}

	public function should_export( array $data ) {
		return (
			isset( $data['include'] ) &&
			( in_array( 'settings', $data['include'], true ) || in_array( 'theme', $data['include'], true ) )
		);
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

		if ( isset( $data['include'] ) && in_array( 'theme', $data['include'], true ) ) {
			$theme = wp_get_theme();

			if ( ! empty( $theme ) && ! empty( $theme->get( 'ThemeURI' ) ) ) {
				$themes_data['name'] = $theme->get( 'Name' );
				$themes_data['theme_uri'] = $theme->get( 'ThemeURI' );
				$themes_data['version'] = $theme->get( 'Version' );
				$themes_data['slug'] = $theme->get_stylesheet();

				$manifest_data['theme'] = $themes_data;
			}
		}

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
