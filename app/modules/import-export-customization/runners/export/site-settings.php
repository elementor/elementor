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
		'customCode',
		'customIcons',
		'customFonts',
		'classes',
		'variables',
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

	private function export_all( $data, $include_theme = true, $customization = null ) {
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

		if ( $include_theme ) {
			$theme_data = $this->export_theme();

			if ( $theme_data ) {
				$kit_data['theme'] = $theme_data;
				$manifest_data['theme'] = $theme_data;
			}
		}

		$experiments_data = $this->export_experiments();

		if ( $experiments_data ) {
			$kit_data['experiments'] = $experiments_data;
			$manifest_data['experiments'] = array_keys( $experiments_data );
		}

		$manifest_data['site-settings'] = array_fill_keys( self::ALLOWED_SETTINGS, true );

		if ( ! $include_theme ) {
			$manifest_data['site-settings']['theme'] = false;
		}

		$classes_variables_info = $this->get_classes_variables_info( $customization );
		$manifest_data['site-settings']['classes'] = $classes_variables_info['classes'];
		$manifest_data['site-settings']['classesCount'] = $classes_variables_info['classesCount'];
		$manifest_data['site-settings']['variables'] = $classes_variables_info['variables'];
		$manifest_data['site-settings']['variablesCount'] = $classes_variables_info['variablesCount'];

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

	private function get_classes_variables_info( ?array $customization = null ): array {
		$classes_count = 0;
		$variables_count = 0;

		$include_classes = $customization['classes'] ?? true;
		$include_variables = $customization['variables'] ?? true;

		if ( class_exists( '\Elementor\Modules\GlobalClasses\Global_Classes_Repository' ) ) {
			$classes_repository = \Elementor\Modules\GlobalClasses\Global_Classes_Repository::make();
			$classes_data = $classes_repository->all()->get();
			$classes_count = count( $classes_data['items'] ?? [] );
		}

		if ( class_exists( '\Elementor\Modules\Variables\Storage\Variables_Repository' ) ) {
			$kit = Plugin::$instance->kits_manager->get_active_kit();
			if ( $kit ) {
				$variables_repository = new \Elementor\Modules\Variables\Storage\Variables_Repository( $kit );
				$collection = $variables_repository->load();
				foreach ( $collection->all() as $variable ) {
					if ( ! $variable->is_deleted() ) {
						$variables_count++;
					}
				}
			}
		}

		return [
			'classes' => (bool) $include_classes,
			'classesCount' => $include_classes ? $classes_count : 0,
			'variables' => (bool) $include_variables,
			'variablesCount' => $include_variables ? $variables_count : 0,
		];
	}

	private function export_customization( $data, $customization ) {
		$result = apply_filters( 'elementor/import-export-customization/export/site-settings/customization', null, $data, $customization, $this );

		if ( is_array( $result ) ) {
			return $result;
		}

		return $this->export_all( $data, ! empty( $customization['theme'] ), $customization );
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

	public function export_experiments() {
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
}
