<?php

namespace Elementor\Core\App\Modules\ImportExport\Processes;

use Elementor\Core\App\Modules\ImportExport\Compatibility\Base_Adapter;
use Elementor\Core\App\Modules\ImportExport\Compatibility\Envato;
use Elementor\Core\App\Modules\ImportExport\Compatibility\Kit_Library;
use Elementor\Core\App\Modules\ImportExport\Utils;
use Elementor\Core\Base\Document;
use Elementor\Plugin;

class Import extends Process_Base {
	const MANIFEST_ERROR_KEY = 'manifest-error';

	const SESSION_DOES_NOT_EXITS_ERROR = 'session-does-not-exits-error';

	const ZIP_FILE_ERROR_KEY = 'zip-file-error';

	/**
	 * The session ID of the import process.
	 * This ID is uniquely generated for each import process (by the temp folder which contains the extracted kit files).
	 *
	 * @var string
	 */
	private $session_id;

	/**
	 * Adapter for the kit compatibility.
	 *
	 * @var Base_Adapter[]
	 */
	private $adapters;

	/**
	 * Document's elements that imported during the process.
	 *
	 * @var array
	 */
	private $documents_elements = [];

	/**
	 * Path to the extracted kit files.
	 *
	 * @var string
	 */
	private $extracted_directory_path;

	/**
	 * Imported kit manifest.
	 *
	 * @var array
	 */
	private $manifest;

	/**
	 * Imported kit site settings. (e.g: custom_colors, custom_typography, etc.)
	 *
	 * @var array
	 */
	private $site_settings;

	/**
	 * Selected content types to import.
	 *
	 * @var array
	 */
	private $settings_include;

	/**
	 * Referer of the import. (e.g: kit-library, local, etc.)
	 *
	 * @var string
	 */
	private $settings_referrer;

	/**
	 * Selected elementor templates conditions to override.
	 *
	 * @var array
	 */
	private $settings_selected_override_conditions;

	/**
	 * Selected custom post types to import.
	 *
	 * @var array
	 */
	private $settings_selected_custom_post_types;

	/**
	 * Selected plugins to import.
	 *
	 * @var array
	 */
	private $settings_selected_plugins;

	/**
	 * The imported data output.
	 *
	 * @var array
	 */
	private $imported_data = [];

	/**
	 * @param $path string session_id | zip_file_path
	 * @param $settings array Use to determine which content to import.
	 *      (e.g: include, selected_plugins, selected_cpt, selected_override_conditions, etc.)
	 * @throws \Exception
	 */
	public function __construct( $path, $settings = [] ) {
		parent::__construct();

		if ( is_file( $path ) ) {
			$this->extracted_directory_path = $this->extract_zip( $path );
		} else {
			$elementor_tmp_directory = Plugin::$instance->uploads_manager->get_temp_dir();
			$path = $elementor_tmp_directory . basename( $path );

			if ( ! is_dir( $path ) ) {
				throw new \Exception( static::SESSION_DOES_NOT_EXITS_ERROR );
			}

			$this->extracted_directory_path = $path . '/';
		}

		$this->session_id = basename( $this->extracted_directory_path );
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

	/**
	 * Set default settings for the import.
	 */
	public function set_default_settings() {
		if ( ! is_array( $this->get_settings_include() ) ) {
			$this->settings_include( $this->get_default_settings_include() );
		}

		if ( ! is_array( $this->get_settings_selected_override_conditions() ) ) {
			$this->settings_selected_override_conditions( $this->get_default_settings_override_conditions() );
		}

		if ( ! is_array( $this->get_settings_selected_custom_post_types() ) ) {
			$this->settings_selected_custom_post_types( $this->get_default_settings_custom_post_types() );
		}

		if ( ! is_array( $this->get_settings_selected_plugins() ) ) {
			$this->settings_selected_plugins( $this->get_default_settings_plugins() );
		}
	}

	/**
	 * Execute the import process.
	 *
	 * @return array The imported data output.
	 * @throws \Exception
	 */
	public function run() {
		if ( empty( $this->runners ) ) {
			throw new \Exception( 'Please specify import runners.' );
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

		// Set the Request's state as an Elementor upload request, in order to support unfiltered file uploads.
		Plugin::$instance->uploads_manager->set_elementor_upload_state( true );

		foreach ( $this->runners as $runner ) {
			if ( $runner->should_import( $data ) ) {
				$this->imported_data = $this->imported_data + $runner->import( $data, $this->imported_data );
			}
		}

		// After the upload complete, set the elementor upload state back to false.
		Plugin::$instance->uploads_manager->set_elementor_upload_state( false );

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

	public function get_session_id() {
		return $this->session_id;
	}

	public function get_adapters() {
		return $this->adapters;
	}

	/**
	 * Get settings by key.
	 * Used for backward compatibility.
	 *
	 * @param string $key The key of the setting.
	 */
	public function get_settings( $key ) {
		switch ( $key ) {
			case 'include':
				return $this->get_settings_include();

			case 'overrideConditions':
				// BC: Remove it in the future,
				// the consumer should work with the actual override_conditions object and not with his keys.
				return array_keys( $this->get_settings_selected_override_conditions() );

			case 'selectedCustomPostTypes':
				return $this->get_settings_selected_custom_post_types();

			case 'plugins':
				return $this->get_settings_selected_plugins();

			default:
				return [];
		}
	}

	public function settings_include( array $settings_include ) {
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

	public function settings_selected_override_conditions( array $settings_selected_override_conditions ) {
		$this->settings_selected_override_conditions = $settings_selected_override_conditions;

		return $this;
	}

	public function get_settings_selected_override_conditions() {
		return $this->settings_selected_override_conditions;
	}

	public function settings_selected_custom_post_types( array $settings_selected_custom_post_types ) {
		$this->settings_selected_custom_post_types = $settings_selected_custom_post_types;

		return $this;
	}

	public function get_settings_selected_custom_post_types() {
		return $this->settings_selected_custom_post_types;
	}

	public function settings_selected_plugins( array $settings_selected_plugins ) {
		$this->settings_selected_plugins = $settings_selected_plugins;

		return $this;
	}

	public function get_settings_selected_plugins() {
		return $this->settings_selected_plugins;
	}

	/**
	 * Prevent saving elements on elementor post creation.
	 *
	 * @param array $data
	 * @param Document $document
	 *
	 * @return array
	 */
	public function prevent_saving_elements_on_post_creation( array $data, Document $document ) {
		if ( isset( $data['elements'] ) ) {
			$this->documents_elements[ $document->get_main_id() ] = $data['elements'];

			$data['elements'] = [];
		}

		return $data;
	}

	/**
	 * Extract the zip file.
	 *
	 * @param string $zip_path The path to the zip file.
	 * @return string The extracted directory path.
	 */
	private function extract_zip( $zip_path ) {
		$extraction_result = Plugin::$instance->uploads_manager->extract_and_validate_zip( $zip_path, [ 'json', 'xml' ] );

		if ( is_wp_error( $extraction_result ) ) {
			throw new \Error( static::ZIP_FILE_ERROR_KEY );
		}

		return $extraction_result['extraction_directory'];
	}

	/**
	 * Get the manifest file from the extracted directory and adapt it if needed.
	 *
	 * @return string The manifest file content.
	 */
	private function read_manifest_json() {
		$manifest = Utils::read_json_file( $this->extracted_directory_path . 'manifest' );

		if ( ! $manifest ) {
			throw new \Error( static::MANIFEST_ERROR_KEY );
		}

		$this->init_adapters( $manifest );

		foreach ( $this->adapters as $adapter ) {
			$manifest = $adapter->adapt_manifest( $manifest );
		}

		return $manifest;
	}

	/**
	 * Init the adapters and determine which ones to use.
	 *
	 * @param array $manifest_data The manifest file content.
	 */
	private function init_adapters( array $manifest_data ) {
		$this->adapters = [];

		/** @var Base_Adapter[] $adapter_types */
		$adapter_types = [ Envato::class, Kit_Library::class ];

		foreach ( $adapter_types as $adapter_type ) {
			if ( $adapter_type::is_compatibility_needed( $manifest_data, [ 'referrer' => $this->get_settings_referrer() ] ) ) {
				$this->adapters[] = new $adapter_type( $this );
			}
		}
	}

	/**
	 * Get the site settings file from the extracted directory and adapt it if needed.
	 *
	 * @return string The site settings file content.
	 */
	private function read_site_settings_json() {
		$site_settings = Utils::read_json_file( $this->extracted_directory_path . 'site-settings' );

		foreach ( $this->adapters as $adapter ) {
			$site_settings = $adapter->adapt_site_settings( $site_settings, $this->manifest, $this->extracted_directory_path );
		}

		return $site_settings;
	}

	/**
	 * Get all the custom post types in the kit.
	 *
	 * @return array Custom post types names.
	 */
	private function get_default_settings_custom_post_types() {
		if ( empty( $this->manifest['wp-content'] ) ) {
			return [];
		}

		$manifest_post_types = array_keys( $this->manifest['wp-content'] );

		return array_diff( $manifest_post_types, Utils::get_builtin_wp_post_types() );
	}

	/**
	 * Get the default settings of elementor templates conditions to override.
	 *
	 * @return array
	 */
	private function get_default_settings_override_conditions() {
		return apply_filters( 'elementor/import/get_default_settings_override_conditions', [], $this->manifest );
	}

	/**
	 * Get the default settings of the plugins that should be imported.
	 *
	 * @return array
	 */
	private function get_default_settings_plugins() {
		return ! empty( $this->manifest['plugins'] ) ? $this->manifest['plugins'] : [];
	}

	/**
	 * Get the default settings of which content types should be imported.
	 *
	 * @return array
	 */
	private function get_default_settings_include() {
		return [ 'templates', 'plugins', 'content', 'settings' ];
	}

	/**
	 * Save the prevented elements on elementor post creation elements.
	 * Handle the replacement of all the dynamic content of the elements that probably have been changed during the import.
	 *
	 * @param array $map_old_new_post_ids Mapped array of old and new post ids.
	 */
	private function save_elements_of_imported_posts( array $map_old_new_post_ids ) {
		foreach ( $this->documents_elements as $new_id => $document_elements ) {
			$document = Plugin::$instance->documents->get( $new_id );
			$updated_elements = $document->on_import_replace_dynamic_content( $document_elements, $map_old_new_post_ids );
			$document->save( [ 'elements' => $updated_elements ] );
		}
	}
}
