<?php

namespace Elementor\App\Modules\ImportExport\Runners\Import;

use Elementor\Plugin;
use Elementor\Core\Settings\Page\Manager as PageManager;
use Elementor\App\Modules\ImportExport\Utils;

class Site_Settings extends Import_Runner_Base {

	/**
	 * @var int
	 */
	private $previous_kit_id;

	/**
	 * @var int
	 */
	private $active_kit_id;

	/**
	 * @var int
	 */
	private $imported_kit_id;

	/**
	 * @var string|null
	 */
	private $installed_theme;

	/**
	 * @var string|null
	 */
	private $previous_active_theme;

	/**
	 * @var \Theme_Upgrader
	 */
	private \Theme_Upgrader $theme_upgrader;

	public function get_theme_upgrader(): \Theme_Upgrader {
		if ( ! class_exists( '\Theme_Upgrader' ) ) {
			require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		}
		if ( ! class_exists( '\WP_Ajax_Upgrader_Skin' ) ) {
			require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		}

		return new \Theme_Upgrader( new \WP_Ajax_Upgrader_Skin() );
	}

	public static function get_name(): string {
		return 'site-settings';
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
		$title = $data['manifest']['title'] ?? 'Imported Kit';

		$active_kit = Plugin::$instance->kits_manager->get_active_kit();

		$this->active_kit_id = (int) $active_kit->get_id();
		$this->previous_kit_id = (int) Plugin::$instance->kits_manager->get_previous_id();

		$result = [];

		$old_settings = $active_kit->get_meta( PageManager::META_KEY );

		if ( ! $old_settings ) {
			$old_settings = [];
		}

		if ( ! empty( $old_settings['custom_colors'] ) ) {
			$new_site_settings['custom_colors'] = array_merge( $old_settings['custom_colors'], $new_site_settings['custom_colors'] );
		}

		if ( ! empty( $old_settings['custom_typography'] ) ) {
			$new_site_settings['custom_typography'] = array_merge( $old_settings['custom_typography'], $new_site_settings['custom_typography'] );
		}

		if ( ! empty( $new_site_settings['space_between_widgets'] ) ) {
			$new_site_settings['space_between_widgets'] = Utils::update_space_between_widgets_values( $new_site_settings['space_between_widgets'] );
		}

		$new_site_settings = array_replace_recursive( $old_settings, $new_site_settings );

		$new_kit = Plugin::$instance->kits_manager->create_new_kit( $title, $new_site_settings );

		$this->imported_kit_id = (int) $new_kit;

		$result['site-settings'] = (bool) $new_kit;

		$import_theme_result = $this->import_theme( $data );

		if ( ! empty( $import_theme_result ) ) {
			$result['theme'] = $import_theme_result;
		}

		return $result;
	}

	protected function install_theme( $slug, $version ) {
		$download_url = "https://downloads.wordpress.org/theme/{$slug}.{$version}.zip";

		return $this->get_theme_upgrader()->install( $download_url );
	}

	protected function activate_theme( $slug ) {
		switch_theme( $slug );
	}

	public function import_theme( array $data ) {
		if ( empty( $data['site_settings']['theme'] ) ) {
			return null;
		}

		$theme = $data['site_settings']['theme'];
		$theme_slug = $theme['slug'];
		$theme_name = $theme['name'];

		$current_theme = wp_get_theme();
		$this->previous_active_theme = $current_theme->get_stylesheet();

		try {
			if ( wp_get_theme( $theme_slug )->exists() ) {
				$this->activate_theme( $theme_slug );
				$result['succeed'][ $theme_slug ] = sprintf( __( 'Theme: %1$s has already been installed', 'elementor' ), $theme_name );
				return $result;
			}

			$import = $this->install_theme( $theme_slug, $theme['version'] );

			if ( is_wp_error( $import ) ) {
				$result['failed'][ $theme_slug ] = sprintf( __( 'Failed to install theme: %1$s', 'elementor' ), $theme_name );
				return $result;
			}

			$result['succeed'][ $theme_slug ] = sprintf( __( 'Theme: %1$s has been successfully installed', 'elementor' ), $theme_name );
			$this->installed_theme = $theme_slug;
			$this->activate_theme( $theme_slug );
		} catch ( \Exception $error ) {
			$result['failed'][ $theme_slug ] = $error->getMessage();
		}

		return $result;
	}

	public function get_import_session_metadata(): array {
		return [
			'previous_kit_id' => $this->previous_kit_id,
			'active_kit_id' => $this->active_kit_id,
			'imported_kit_id' => $this->imported_kit_id,
			'installed_theme' => $this->installed_theme,
			'previous_active_theme' => $this->previous_active_theme,
		];
	}
}
