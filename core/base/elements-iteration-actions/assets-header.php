<?php
namespace Elementor\Core\Base\Elements_Iteration_Actions;

use Elementor\Conditions;
use Elementor\Element_Base;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Assets_Header extends Base {
	const ASSETS_META_KEY = '_elementor_page_header_assets';

	// Default value must be empty.
	private $page_assets;

	// Default value must be empty.
	private $saved_page_assets;

	public function element_action( Element_Base $element_data ) {
		$element_assets = $this->get_assets( $element_data );

		if ( $element_assets ) {
			$this->update_page_assets( $element_assets );
		}
	}

	public function is_action_needed() {
		// No need to evaluate in preview mode, will be made in the saving process.
		if ( Plugin::$instance->preview->is_preview_mode() ) {
			return false;
		}

		$page_assets = $this->get_saved_page_assets();

		// When $page_assets is array it means that the assets registration has already been made at least once.
		if ( is_array( $page_assets ) ) {
			return false;
		}

		return true;
	}

	public function after_elements_iteration() {
		// In case that the page assets value is empty, it should still be saved as an empty array as an indication that at lease one iteration has occurred.
		if ( ! is_array( $this->page_assets ) ) {
			$this->page_assets = [];
		}

		$this->get_document_assets();

		// Saving the page assets data.
		$this->document->update_meta( self::ASSETS_META_KEY, $this->page_assets );
	}

	private function get_saved_page_assets( $force_meta_fetch = false ) {
		if ( ! is_array( $this->saved_page_assets ) || $force_meta_fetch ) {
			$this->saved_page_assets = $this->document->get_meta( self::ASSETS_META_KEY );
		}

		return $this->saved_page_assets;
	}

	private function update_page_assets( $new_assets ) {
		if ( ! is_array( $this->page_assets ) ) {
			$this->page_assets = [];
		}

		foreach ( $new_assets as $assets_type => $assets_type_data ) {
			if ( ! isset( $this->page_assets[ $assets_type ] ) ) {
				$this->page_assets[ $assets_type ] = [];
			}

			foreach ( $assets_type_data as $asset_name ) {
				if ( ! in_array( $asset_name, $this->page_assets[ $assets_type ], true ) ) {
					$this->page_assets[ $assets_type ][] = $asset_name;
				}
			}
		}
	}

	private function get_assets( $element_data ) {
		$assets = [];

		if ( method_exists( $element_data, 'get_frontend_header_file' ) ) {
			$assets[ 'styles' ][] = $element_data->get_frontend_header_file();
		}

		return $assets;
	}

	private function get_document_assets() {
		$document_id = $this->document->get_post()->ID;

		// Getting the document instance in order to get the most updated settings.
		$updated_document = Plugin::$instance->documents->get( $document_id, false );

		$document_settings = $updated_document->get_settings();

		$document_controls = $this->document->get_controls();

		$document_assets = $this->get_assets( $document_settings, $document_controls );

		if ( $document_assets ) {
			$this->update_page_assets( $document_assets );
		}
	}

	public function __construct( $document ) {
		parent::__construct( $document );

		// No need to enable assets in preview mode, all assets will be loaded by default by the assets loader.
		if ( Plugin::$instance->preview->is_preview_mode() ) {
			return;
		}

		$page_assets = $this->get_saved_page_assets();

		// If $page_assets is not empty then enabling the assets for loading.
		if ( $page_assets ) {
			Plugin::$instance->assets_loader->enable_assets( $page_assets );
		}
	}
}
