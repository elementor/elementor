<?php
namespace Elementor\App\Modules\ImportExportCustomization\Runners\Export;

use Elementor\Plugin;

class Site_Settings extends Export_Runner_Base {
	const ALLOWED_SETTINGS = [
		'theme',
		'globalColors',
		'globalFonts',
		'themeStyleSettings',
		'generalSettings',
		'experiments',
	];

	public static function get_name(): string {
		return 'site-settings';
	}

	public function should_export( array $data ) {
		return (
			isset( $data['include'] ) &&
			in_array( 'settings', $data['include'], true )
		);
	}

	public function export( array $data ) {
		$customization = $data['customization']['settings'] ?? null;
		if ( $customization ) {
			return $this->export_customization( $data, $customization );
		}

		return $this->export_all( $data );
	}

	private function export_all( $data ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit_data = $kit->get_export_data();

		$excluded_kit_settings_keys = [
			'site_name',
			'site_description',
			'site_logo',
			'site_favicon',
		];

		foreach ( $excluded_kit_settings_keys as $setting_key ) {
			unset( $kit_data['settings'][ $setting_key ] );
		}

		$theme_data = $this->export_theme();

		if ( $theme_data ) {
			$kit_data['theme'] = $theme_data;
		}

		$experiments_data = $this->export_experiments();

		if ( $experiments_data ) {
			$kit_data['experiments'] = $experiments_data;
		}

		$manifest_data['site-settings'] = array_fill_keys( self::ALLOWED_SETTINGS, true );

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

	private function export_customization( $data, $customization ) {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$kit_data = $kit->get_export_data();

		foreach ( $customization as $key => $value ) {
			if ( ! in_array( $key, self::ALLOWED_SETTINGS ) ) {
				unset( $customization[ $key ] );
			}
		}

		if ( ! $customization['globalColors'] ) {
			$kit_data = $this->remove_global_colors( $kit_data );
		}

		if ( ! $customization['globalFonts'] ) {
			$kit_data = $this->remove_global_fonts( $kit_data );
		}

		if ( ! $customization['themeStyleSettings'] ) {
			$kit_data = $this->remove_theme_style( $kit_data );
		}

		if ( ! $customization['generalSettings'] ) {
			$kit_data = $this->remove_other_settings( $kit_data );
		}

		if ( $customization['theme'] ) {
			$theme_data = $this->export_theme();

			if ( $theme_data ) {
				$kit_data['theme'] = $theme_data;
			}
		}

		if ( $customization['experiments'] ) {
			$experiments_data = $this->export_experiments();

			if ( $experiments_data ) {
				$kit_data['experiments'] = $experiments_data;
			}
		}

		return [
			'files' => [
				'path' => 'site-settings',
				'data' => $kit_data,
			],
			'manifest' => [
				[ 'site-settings' => $customization ],
			],
		];
	}

	public function export_theme() {
		$theme = wp_get_theme();

		if ( empty( $theme ) || empty( $theme->get( 'ThemeURI' ) ) ) {
			return null;
		}

		$theme_data['name'] = $theme->get( 'Name' );
		$theme_data['theme_uri'] = $theme->get( 'ThemeURI' );
		$theme_data['version'] = $theme->get( 'Version' );
		$theme_data['slug'] = $theme->get_stylesheet();

		return $theme_data;
	}

	private function export_experiments() {
		$features = Plugin::$instance->experiments->get_features();

		if ( empty( $features ) ) {
			return null;
		}

		$experiments_data = [];

		foreach ( $features as $feature_name => $feature ) {
			$experiments_data[ $feature_name ] = [
				'name' => $feature_name,
				'title' => $feature['title'],
				'state' => $feature['state'],
				'default' => $feature['default'],
				'release_status' => $feature['release_status'],
			];
		}

		return empty( $experiments_data ) ? null : $experiments_data;
	}

	private function remove_global_colors( $kit_data ) {
		$color_keys = [ 'system_colors', 'custom_colors' ];

		foreach ( $color_keys as $key ) {
			if ( isset( $kit_data['settings'][ $key ] ) ) {
				unset( $kit_data['settings'][ $key ] );
			}
		}

		return $kit_data;
	}

	private function remove_global_fonts( $kit_data ) {
		$typography_keys = [ 'system_typography', 'custom_typography', 'default_generic_fonts' ];

		foreach ( $typography_keys as $key ) {
			if ( isset( $kit_data['settings'][ $key ] ) ) {
				unset( $kit_data['settings'][ $key ] );
			}
		}

		return $kit_data;
	}

	private function remove_theme_style( $kit_data ) {
		$theme_style_patterns = [
			'/^body_/',
			'/^h[1-6]_/',
			'/^button_/',
			'/^link_/',
			'/^form_field_/',
		];

		foreach ( $kit_data['settings'] as $key => $value ) {
			foreach ( $theme_style_patterns as $pattern ) {
				if ( preg_match( $pattern, $key ) ) {
					unset( $kit_data['settings'][ $key ] );
					break;
				}
			}
		}

		return $kit_data;
	}

	private function remove_other_settings( $kit_data ) {
		$settings_keys = [
			'template',
			'container_width',
			'container_padding',
			'space_between_widgets',
			'viewport_md',
			'viewport_lg',
			'page_title_selector',
			'activeItemIndex',
		];

		foreach ( $settings_keys as $key ) {
			if ( isset( $kit_data['settings'][ $key ] ) ) {
				unset( $kit_data['settings'][ $key ] );
			}
		}

		return $kit_data;
	}
}
