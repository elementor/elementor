<?php

namespace Elementor\Core\App\Modules\ImportExport;

use Elementor\Core\App\Modules\ImportExport\Content\Elementor_Content;
use Elementor\Core\App\Modules\ImportExport\Content\Plugins;
use Elementor\Core\App\Modules\ImportExport\Content\Site_Settings;
use Elementor\Core\App\Modules\ImportExport\Content\Taxonomies;
use Elementor\Core\App\Modules\ImportExport\Content\Templates;
use Elementor\Core\App\Modules\ImportExport\Content\Wp_Content;
use Elementor\Plugin;

class Export {

	private $settings_include;

	private $settings_kit_info;

	private $settings_selected_plugins;

	private $settings_selected_custom_post_types;

	private $manifest_data;

	private $runners;

	private $zip;

	public function __construct( $settings = [] ) {
		$this->settings_include = ! empty( $settings['include'] ) ? $settings['include'] : null;
		$this->settings_kit_info = ! empty( $settings['kitInfo'] ) ? $settings['kitInfo'] : null;
		$this->settings_selected_plugins = ! empty( $settings['plugins'] ) ? $settings['plugins'] : null;
		$this->settings_selected_custom_post_types = ! empty( $settings['selectedCustomPostTypes'] ) ? $settings['selectedCustomPostTypes'] : null;
	}

	public function run() {
		if ( empty( $this->runners ) ) {
			throw new \Exception( 'specify-runners' );
		}

		$this->set_default_settings();

		$this->init_zip_archive();
		$this->init_manifest_data();

		$data = [
			'include' => $this->settings_include,
			'selected_plugins' => $this->settings_selected_plugins,
			'selected_custom_post_types' => $this->settings_selected_custom_post_types,
		];

		foreach ( $this->runners as $runner ) {
			if ( $runner->should_export( $data ) ) {
				$export_result = $runner->export( $data );
				$this->handle_export_result( $export_result );
			}
		}

		$this->add_json_file( 'manifest', $this->manifest_data );

		$zip_file_name = $this->zip->filename;
		$this->zip->close();

		return [
			'manifest' => $this->manifest_data,
			'file_name' => $zip_file_name,
		];
	}

	public function register_default_runners() {
		$this->register( new Site_Settings() );
		$this->register( new Plugins() );
		$this->register( new Templates() );
		$this->register( new Taxonomies() );
		$this->register( new Elementor_Content() );
		$this->register( new Wp_Content() );
	}

	public function register( $runner_instance ) {
		$this->runners[ get_class( $runner_instance ) ] = $runner_instance;
	}

	public function set_default_settings() {
		if ( ! is_array( $this->get_settings_include() ) ) {
			$this->settings_include( $this->get_default_settings_include() );
		}

		if ( ! is_array( $this->get_settings_kit_info() ) ) {
			$this->settings_kit_info( $this->get_default_settings_kit_info() );
		}

		if ( in_array( 'content', $this->settings_include, true ) && ! is_array( $this->get_settings_selected_custom_post_types() ) ) {
			$this->settings_selected_custom_post_types( $this->get_default_settings_custom_post_types() );
		}

		if ( in_array( 'plugins', $this->settings_include, true ) && ! is_array( $this->get_settings_selected_plugins() ) ) {
			$this->settings_selected_plugins( $this->get_default_settings_selected_plugins() );
		}
	}

	public function settings_include( $include ) {
		$this->settings_include = $include;
	}

	public function get_settings_include() {
		return $this->settings_include;
	}

	private function settings_kit_info( $kit_info ) {
		$this->settings_kit_info = $kit_info;
	}

	private function get_settings_kit_info() {
		return $this->settings_kit_info;
	}

	public function settings_selected_custom_post_types( $selected_custom_post_types ) {
		$this->settings_selected_custom_post_types = $selected_custom_post_types;
	}

	public function get_settings_selected_custom_post_types() {
		return $this->settings_selected_custom_post_types;
	}

	public function settings_selected_plugins( $plugins ) {
		$this->settings_selected_plugins = $plugins;
	}

	public function get_settings_selected_plugins() {
		return $this->settings_selected_plugins;
	}

	private function get_default_settings_include() {
		return [ 'templates', 'content', 'settings', 'plugins' ];
	}

	private function get_default_settings_kit_info() {
		return [
			'title' => 'kit',
			'description' => '',
		];
	}

	private function get_default_settings_selected_plugins() {
		$plugins = [];
		$installed_plugins = Plugin::$instance->wp->get_plugins();

		foreach ( $installed_plugins as $key => $value ) {
			$plugins[] = [
				'name' => $value['Name'],
				'plugin' => $key,
				'pluginUri' => $value['PluginURI'],
				'version' => $value['Version'],
			];
		}

		return $plugins;
	}

	private function get_default_settings_custom_post_types() {
		return Utils::get_registered_cpt_names();
	}

	private function init_zip_archive() {
		$zip = new \ZipArchive();

		$temp_dir = Plugin::$instance->uploads_manager->create_unique_dir();

		$zip_file_name = $temp_dir . sanitize_title( $this->settings_kit_info['title'] ) . '.zip';

		$zip->open( $zip_file_name, \ZipArchive::CREATE | \ZipArchive::OVERWRITE );

		$this->zip = $zip;
	}

	private function init_manifest_data() {
		$kit_post = Plugin::$instance->kits_manager->get_active_kit()->get_post();

		$manifest_data = [
			'name' => sanitize_title( $this->settings_kit_info['title'] ),
			'title' => $this->settings_kit_info['title'],
			'description' => $this->settings_kit_info['description'],
			'author' => get_the_author_meta( 'display_name', $kit_post->post_author ),
			'version' => Module::FORMAT_VERSION,
			'elementor_version' => ELEMENTOR_VERSION,
			'created' => gmdate( 'Y-m-d H:i:s' ),
			'thumbnail' => get_the_post_thumbnail_url( $kit_post ),
			'site' => get_site_url(),
		];

		$this->manifest_data = $manifest_data;
	}

	private function handle_export_result( $export_result ) {
		if ( ! empty( $export_result['manifest'] ) ) {
			foreach ( $export_result['manifest'] as $data ) {
				$this->manifest_data = $this->manifest_data + $data;
			}
		}

		if ( ! empty( $export_result['files'] ) ) {

			if ( isset( $export_result['files']['path'] ) ) {
				$export_result['files'] = [ $export_result['files'] ];
			}

			foreach ( $export_result['files'] as $file ) {
				$file_extension = pathinfo( $file['path'], PATHINFO_EXTENSION );
				if ( empty( $file_extension ) ) {
					$this->add_json_file(
						$file['path'],
						$file['data']
					);
				} else {
					$this->add_file(
						$file['path'],
						$file['data']
					);
				}
			}
		}
	}

	/**
	 * Helpers
	 */

	private function add_json_file( $name, $content, $json_flags = null ) {
		$this->add_file( $name . '.json', wp_json_encode( $content, $json_flags ) );
	}

	private function add_file( $file, $content ) {
		$this->zip->addFromString( $file, $content );
	}
}
