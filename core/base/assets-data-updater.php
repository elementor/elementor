<?php
namespace Elementor\Core\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Assets_Data_Updater extends Document_Data_Updater {
	public function update_element( array $element_data ) {
		$document = $this->get_document();

		$element_assets = $document->get_element_assets( $element_data );

		if ( $element_assets ) {
			$document->update_page_assets( $element_data );
		}
	}

	public function is_update_needed() {
		$document = $this->get_document();

		$page_assets = $document->get_meta( $document::ASSETS_META_KEY );

		if ( isset( $page_assets[ $this->post_id ] ) ) {
			return false;
		}

		return true;
	}
}
