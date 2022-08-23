<?php
namespace Elementor\Core\App\Modules\ImportExport\Runners;

use Elementor\Core\Base\Document;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Plugin;
use Elementor\Core\Settings\Page\Manager as PageManager;

class Site_Settings extends Runner_Base {

	/**
	 * @var Document|Kit|false
	 */
	private $active_kit;

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

	public function should_revert( array $data ) {
		return (
			isset( $data['runners'] ) &&
			array_key_exists( static::get_name(), $data['runners'] )
		);
	}

	public function import( array $data, array $imported_data ) {
		$new_site_settings = $data['site_settings']['settings'];
		$title = isset( $data['manifest']['title'] ) ? $data['manifest']['title'] : 'Imported Kit';

		$this->active_kit = Plugin::$instance->kits_manager->get_active_kit();

		$previous_kit_id = Plugin::$instance->kits_manager->get_previous_id();
		$active_kit_id = $this->active_kit->get_id();

		$result = [];

		$old_settings = $this->active_kit->get_meta( PageManager::META_KEY );

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

		$result = $this->get_import_session_metadata( $result, $previous_kit_id, $active_kit_id, $new_kit );

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

	public function revert( array $data ) {
		Plugin::$instance->kits_manager->revert(
			$data['runners'][ static::get_name() ]['new_kit_id'],
			$data['runners'][ static::get_name() ]['active_kit_id'],
			$data['runners'][ static::get_name() ]['previous_kit_id']
		);
	}

	public function get_import_session_metadata() : array {
		$result['revert_data'][ static::get_name() ] = [
			'previous_kit_id' => $previous_kit_id,
			'active_kit_id' => $active_kit_id,
			'new_kit_id' => $new_kit_id,
		];

		return $result;
	}
}
