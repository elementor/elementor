<?php
namespace Elementor\App\Modules\ImportExportCustomization\Runners\Export;

use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\GlobalClasses\Module as Global_Classes_Module;
use Elementor\Modules\Variables\Module as Variables_Module;
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

	private function export_all( $data, $include_theme = true ) {
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

		if ( $this->is_classes_feature_active() ) {
			$manifest_data['site-settings']['classesCount'] = $this->get_classes_count();
		} else {
			unset( $manifest_data['site-settings']['classes'] );
		}

		if ( $this->is_variables_feature_active() ) {
			$manifest_data['site-settings']['variablesCount'] = $this->get_variables_count();
		} else {
			unset( $manifest_data['site-settings']['variables'] );
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

	public function get_classes_count(): int {
		$classes_repository = \Elementor\Modules\GlobalClasses\Global_Classes_Repository::make();
		$classes_data = $classes_repository->all()->get();

		return count( $classes_data['items'] ?? [] );
	}

	public function get_variables_count(): int {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$variables_repository = new \Elementor\Modules\Variables\Storage\Variables_Repository( $kit );
		$collection = $variables_repository->load();
		$count = 0;

		foreach ( $collection->all() as $variable ) {
			if ( ! $variable->is_deleted() ) {
				$count++;
			}
		}

		return $count;
	}

	public function is_classes_feature_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( Global_Classes_Module::NAME )
			&& Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME );
	}

	public function is_variables_feature_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( Variables_Module::EXPERIMENT_NAME )
			&& Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME );
	}

	private function export_customization( $data, $customization ) {
		$result = apply_filters( 'elementor/import-export-customization/export/site-settings/customization', null, $data, $customization, $this );

		if ( is_array( $result ) ) {
			return $result;
		}

		$export_result = $this->export_all( $data, ! empty( $customization['theme'] ) );

		if ( $this->is_classes_feature_active() ) {
			$include_classes = $customization['classes'] ?? false;
			$export_result['manifest'][0]['site-settings']['classes'] = (bool) $include_classes;

			if ( ! $include_classes ) {
				$export_result['manifest'][0]['site-settings']['classesCount'] = 0;
			}
		}

		if ( $this->is_variables_feature_active() ) {
			$include_variables = $customization['variables'] ?? false;
			$export_result['manifest'][0]['site-settings']['variables'] = (bool) $include_variables;

			if ( ! $include_variables ) {
				$export_result['manifest'][0]['site-settings']['variablesCount'] = 0;
			}
		}

		return $export_result;
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
