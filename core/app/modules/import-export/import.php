<?php

namespace Elementor\Core\App\Modules\ImportExport;

use Elementor\Core\App\Modules\ImportExport\Compatibility\Base_Adapter;
use Elementor\Core\App\Modules\ImportExport\Compatibility\Envato;
use Elementor\Core\App\Modules\ImportExport\Compatibility\Kit_Library;
use Elementor\Core\App\Modules\ImportExport\Content\Elementor_Content;
use Elementor\Core\App\Modules\ImportExport\Content\Plugins;
use Elementor\Core\App\Modules\ImportExport\Content\Site_Settings;
use Elementor\Core\App\Modules\ImportExport\Content\Taxonomies;
use Elementor\Core\App\Modules\ImportExport\Content\Templates;
use Elementor\Core\App\Modules\ImportExport\Content\Wp_Content;
use Elementor\Plugin;
class Import {
	const BUILTIN_WP_POST_TYPES = [ 'post', 'page', 'nav_menu_item' ];
	const MANIFEST_ERROR_KEY = 'manifest-error';
	const MISSING_TMP_FOLDER_ERROR_KEY = 'missing-tmp-folder-error';

	private $runners;

	private $extracted_directory_path;

	private $adapters;

	private $manifest;

	private $documents_elements = [];

	private $site_settings;

	private $settings_include;

	private $settings_referrer;

	private $settings_selected_override_conditions;

	private $settings_selected_custom_post_types;

	private $settings_selected_plugins;

	private $imported_data = [];

	private $session;

	public function __construct( $path, $settings = [] ) {
		$file_extension = pathinfo( $path, PATHINFO_EXTENSION );
		if ( 'zip' === $file_extension || 'tmp' === $file_extension ) {
			$this->extracted_directory_path = $this->extract_zip( $path );
		} else {
			$elementor_tmp_directory = Plugin::$instance->uploads_manager->get_temp_dir();
			$path = $elementor_tmp_directory . basename( $path );

			if ( ! is_dir( $path ) ) {
				throw new \Exception( self::MISSING_TMP_FOLDER_ERROR_KEY );
			}
			$this->extracted_directory_path = $path . '/';
		}

		$this->session = basename( $this->extracted_directory_path );
		$this->settings_referrer = ! empty( $settings['referrer'] ) ? $settings['referrer'] : 'local';

		// Using isset and not empty is important since empty array is a valid option for those arrays.
		$this->settings_include = ! empty( $settings['include'] ) ? $settings['include'] : null;
		$this->settings_selected_override_conditions = isset( $settings['overrideConditions'] ) ? $settings['overrideConditions'] : null;
		$this->settings_selected_custom_post_types = isset( $settings['selectedCustomPostTypes'] ) ? $settings['selectedCustomPostTypes'] : null;
		$this->settings_selected_plugins = isset( $settings['plugins'] ) ? $settings['plugins'] : null;

		$this->manifest = $this->read_manifest_json();
		$this->site_settings = $this->read_site_settings_json();

		$this->set_default_settings();
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

		if ( in_array( 'templates', $this->settings_include, true ) && ! is_array( $this->get_settings_selected_override_conditions() ) ) {
			$this->settings_selected_override_conditions( $this->get_default_settings_override_conditions() );
		}

		if ( in_array( 'content', $this->settings_include, true ) && ! is_array( $this->get_settings_selected_custom_post_types() ) ) {
			$this->settings_selected_custom_post_types( $this->get_default_settings_custom_post_types() );
		}

		if ( in_array( 'plugins', $this->settings_include, true ) && ! is_array( $this->get_settings_selected_plugins() ) ) {
			$this->settings_selected_plugins( $this->get_default_settings_plugins() );
		}
	}

	public function run() {
		if ( empty( $this->runners ) ) {
			throw new \Exception( 'specify-runners' );
		}

		$data = [
			'include' => $this->settings_include,
			'manifest' => $this->manifest,
			'site_settings' => $this->site_settings,
			'selected_plugins' => $this->settings_selected_plugins,
			'extracted_directory_path' => $this->extracted_directory_path,
			'selected_custom_post_types' => $this->settings_selected_custom_post_types,
		];

		add_filter( 'elementor/document/save/data', [ $this, 'prevent_saving_elements_on_post_creation' ], 10, 2 );

		foreach ( $this->runners as $runner ) {
			if ( $runner->should_import( $data ) ) {
				$this->imported_data = $this->imported_data + $runner->import( $data, $this->imported_data );
			}
		}

		remove_filter( 'elementor/document/save/data', [ $this, 'prevent_saving_elements_on_post_creation' ], 10 );

		$map_old_new_post_ids = Utils::map_old_new_post_ids( $this->imported_data );
		$this->save_elements_of_imported_posts( $map_old_new_post_ids );

		Plugin::$instance->uploads_manager->remove_file_or_dir( $this->extracted_directory_path );
		return $this->imported_data;
	}

	public function get_manifest() {
		return $this->manifest;
	}

	public function get_extracted_directory_path() {
		return $this->extracted_directory_path;
	}

	public function get_session() {
		return $this->session;
	}

	public function get_adapters() {
		return $this->adapters;
	}

	// Get settings by key, for BC.
	public function get_settings( $key ) {
		switch ( $key ) {
			case 'include':
				return $this->get_settings_include();

			case 'overrideConditions':
				return $this->get_settings_selected_override_conditions();

			case 'selectedCustomPostTypes':
				return $this->get_settings_selected_custom_post_types();

			case 'plugins':
				return $this->get_settings_selected_plugins();

			default:
				return [];
		}
	}

	public function settings_include( $settings_include ) {
		$this->settings_include = $settings_include;

		return $this;
	}

	public function get_settings_include() {
		return $this->settings_include;
	}

	public function settings_referrer( $settings_referrer ) {
		$this->settings_referrer = $settings_referrer;

		return $this;
	}

	public function get_settings_referrer() {
		return $this->settings_referrer;
	}

	public function settings_selected_override_conditions( $settings_selected_override_conditions ) {
		$this->settings_selected_override_conditions = $settings_selected_override_conditions;

		return $this;
	}

	public function get_settings_selected_override_conditions() {
		return $this->settings_selected_override_conditions;
	}

	public function settings_selected_custom_post_types( $settings_selected_custom_post_types ) {
		$this->settings_selected_custom_post_types = $settings_selected_custom_post_types;

		return $this;
	}

	public function get_settings_selected_custom_post_types() {
		return $this->settings_selected_custom_post_types;
	}

	public function settings_selected_plugins( $settings_selected_plugins ) {
		$this->settings_selected_plugins = $settings_selected_plugins;

		return $this;
	}

	public function get_settings_selected_plugins() {
		return $this->settings_selected_plugins;
	}

	public function prevent_saving_elements_on_post_creation( $data, $document ) {
		if ( isset( $data['elements'] ) ) {
			$this->documents_elements[ $document->get_main_id() ] = $data['elements'];

			$data['elements'] = [];
		}

		return $data;
	}

	private function extract_zip( $zip_path ) {
		$extraction_result = Plugin::$instance->uploads_manager->extract_and_validate_zip( $zip_path, [ 'json', 'xml' ] );
		return $extraction_result['extraction_directory'];
	}

	private function read_manifest_json() {
		$manifest = Utils::read_json_file( $this->extracted_directory_path . 'manifest' );

		if ( ! $manifest ) {
			throw new \Error( self::MANIFEST_ERROR_KEY );
		}

		$this->init_adapters( $manifest );

		foreach ( $this->adapters as $adapter ) {
			$manifest = $adapter->adapt_manifest( $manifest );
		}

		return $manifest;
	}

	private function init_adapters( $manifest_data ) {
		$this->adapters = [];

		/** @var Base_Adapter[] $adapter_types */
		$adapter_types = [ Envato::class, Kit_Library::class ];

		foreach ( $adapter_types as $adapter_type ) {
			if ( $adapter_type::is_compatibility_needed( $manifest_data, [ 'referrer' => $this->get_settings_referrer() ] ) ) {
				$this->adapters[] = new $adapter_type( $this );
			}
		}
	}

	private function read_site_settings_json() {
		$site_settings = Utils::read_json_file( $this->extracted_directory_path . 'site-settings' );

		foreach ( $this->adapters as $adapter ) {
			$site_settings = $adapter->adapt_site_settings( $site_settings, $this->manifest, $this->extracted_directory_path );
		}

		return $site_settings;
	}

	private function get_default_settings_custom_post_types() {
		if ( empty( $this->manifest['wp-content'] ) ) {
			return [];
		}
		$manifest_post_types = array_keys( $this->manifest['wp-content'] );
		$custom_post_types = array_diff( $manifest_post_types, self::BUILTIN_WP_POST_TYPES );

		foreach ( $custom_post_types as $post_type ) {
			if ( empty( $this->manifest['wp-content'][ $post_type ]['label_plural'] ) ) {
				unset( $custom_post_types[ $post_type ] );
			}
		}

		return $custom_post_types;
	}

	private function get_default_settings_override_conditions() {
		$conflicts = [];
		$conflicts = apply_filters( 'elementor/import/get_default_settings_override_conditions', $conflicts, $this->manifest );
		return $conflicts;
	}

	private function get_default_settings_plugins() {
		if ( empty( $this->manifest['plugins'] ) ) {
			return [];
		}

		return $this->manifest['plugins'];
	}

	private function get_default_settings_include() {
		$include = [ 'templates', 'plugins', 'content', 'settings' ];

		if ( empty( $this->manifest['templates'] ) ) {
			unset( $include['templates'] );
		}

		if ( empty( $this->manifest['content'] ) && empty( $this->manifest['wp-content'] ) ) {
			unset( $include['content'] );
		}

		if ( empty( $this->manifest['site-settings'] ) ) {
			unset( $include['settings'] );
		}

		if ( empty( $this->manifest['plugins'] ) ) {
			unset( $include['plugins'] );
		}

		return $include;
	}

	/**
	 * Post Import Functions
	 */

	private function save_elements_of_imported_posts( $map_old_new_post_ids ) {
		foreach ( $this->documents_elements as $new_id => $document_elements ) {
			$document = Plugin::$instance->documents->get( $new_id );
			$updated_elements = $document->on_import_replace_dynamic_content( $document_elements, $map_old_new_post_ids );
			$document->save( [ 'elements' => $updated_elements ] );
		}
	}
}
