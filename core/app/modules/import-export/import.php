<?php
namespace Elementor\Core\App\Modules\ImportExport;

use Elementor\Core\App\Modules\ImportExport\Compatibility\Base_Adapter;
use Elementor\Core\App\Modules\ImportExport\Compatibility\Envato;
use Elementor\Core\App\Modules\ImportExport\Compatibility\Kit_Library;
use Elementor\Core\App\Modules\ImportExport\Directories\Root;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Import extends Iterator {

	/**
	 * @var Base_Adapter[]
	 */
	private $adapters = [];

	private $documents_elements = [];

	final public function run() {
		$this->temp_dir = $this->get_settings( 'session' );

		$manifest_data = $this->read_json_file( 'manifest' );

		$manifest_data = $this->adapt_manifest_structure( $manifest_data );

		$root_directory = new Root( $this );

		add_filter( 'elementor/document/save/data', [ $this, 'prevent_saving_elements_on_post_creation' ], 10, 2 );

		$imported_posts = $root_directory->run_import( $manifest_data );

		remove_filter( 'elementor/document/save/data', [ $this, 'prevent_saving_elements_on_post_creation' ], 10 );

		$map_old_new_post_ids = $this->map_old_new_post_ids( $imported_posts );

		$this->save_elements_of_imported_posts( $map_old_new_post_ids );

		$this->update_object_id_of_imported_menu_items( $map_old_new_post_ids );

		return $imported_posts;
	}

	public function prevent_saving_elements_on_post_creation( $data, $document ) {
		if ( isset( $data['elements'] ) ) {
			$this->documents_elements[ $document->get_main_id() ] = $data['elements'];

			$data['elements'] = [];
		}

		return $data;
	}

	final public function read_json_file( $name ) {
		$name = $this->get_archive_file_full_path( $name . '.json' );

		return json_decode( Utils::file_get_contents( $name, true ), true );
	}

	final public function get_adapters() {
		return $this->adapters;
	}

	final public function adapt_manifest_structure( array $manifest_data ) {
		$this->init_adapters( $manifest_data );

		foreach ( $this->adapters as $adapter ) {
			$manifest_data = $adapter->get_manifest_data( $manifest_data );
		}

		return $manifest_data;
	}

	private function init_adapters( array $manifest_data ) {
		/** @var Base_Adapter[] $adapter_types */
		$adapter_types = [ Envato::class, Kit_Library::class ];

		foreach ( $adapter_types as $adapter_type ) {
			if ( $adapter_type::is_compatibility_needed( $manifest_data, $this->get_settings() ) ) {
				$this->adapters[] = new $adapter_type( $this );
			}
		}
	}

	private function save_elements_of_imported_posts( $map_old_new_post_ids ) {
		foreach ( $this->documents_elements as $new_id => $document_elements ) {
			$document = Plugin::$instance->documents->get( $new_id );
			$updated_elements = $document->on_import_replace_dynamic_content( $document_elements, $map_old_new_post_ids );
			$document->save( [ 'elements' => $updated_elements ] );
		}
	}

	private function update_object_id_of_imported_menu_items( $map_old_new_post_ids ) {
		foreach ( $map_old_new_post_ids as $new_post_id ) {
			if ( 'nav_menu_item' !== get_post_type( $new_post_id ) ) {
				continue;
			}

			$post_meta = get_post_meta( $new_post_id );

			// Skip items that not related to posts.
			if ( 'post_type' !== $post_meta['_menu_item_type'][0] ) {
				continue;
			}

			$update_meta = update_post_meta( $new_post_id, '_menu_item_object_id', $map_old_new_post_ids[ $post_meta['_menu_item_object_id'][0] ] );

			if ( ! $update_meta ) {
				wp_delete_post( $new_post_id );
			}
		}
	}

	private function map_old_new_post_ids( $imported_posts ) {
		$map_old_new_post_ids = [];

		foreach ( $imported_posts as $imported_post ) {
			if ( isset( $imported_post['succeed'] ) ) {
				$map_old_new_post_ids += $imported_post['succeed'];
			} else {
				$map_old_new_post_ids += $this->map_old_new_post_ids( $imported_post );
			}
		}

		return $map_old_new_post_ids;
	}
}
