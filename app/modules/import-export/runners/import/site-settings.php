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
	 * @var \Theme_Upgrader
	 */
	private \Theme_Upgrader $theme_upgrader;

	public function __construct() {
		$this->theme_upgrader = new \Theme_Upgrader( new \WP_Ajax_Upgrader_Skin() );
	}

	public static function get_name(): string {
		return 'site-settings';
	}

	public function should_import( array $data ) {
		return (
			isset( $data['include'] ) &&
			( in_array( 'settings', $data['include'], true ) || in_array( 'theme', $data['include'], true ) ) &&
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

		if ( ! empty( $data['manifest']['theme'] ) ) {
			$theme = $data['manifest']['theme'];

			$existing_theme = wp_get_theme( $theme['slug'] );

			try {
				if ( ! $existing_theme->exists() ) {
					$import = $this->install_theme( $theme['slug'], $theme['version'] );

					if ( is_wp_error( $import ) ) {
						$result['theme']['failed'][ $theme['slug'] ] = __( sprintf( 'Failed to install theme: %1$s', $theme['name'] ), 'elementor' );
					} else {
						$result['theme']['succeed'][ $theme['slug'] ] = $import;
						$this->installed_theme = $theme['slug'];
					}
				}
			} catch ( \Exception $error ) {
				$result['theme']['failed'][ $theme['slug'] ] = $error->getMessage();
			}
		}

		return $result;
	}

	private function install_theme( $slug, $version ) {
		$download_url = "https://downloads.wordpress.org/theme/{$slug}.{$version}.zip";

		$result = $this->theme_upgrader->install( $download_url );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return $result;
	}

	public function get_import_session_metadata(): array {
		return [
			'previous_kit_id' => $this->previous_kit_id,
			'active_kit_id' => $this->active_kit_id,
			'imported_kit_id' => $this->imported_kit_id,
			'installed_theme' => $this->installed_theme,
		];
	}
}
