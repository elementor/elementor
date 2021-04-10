<?php
namespace Elementor\Core\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Assets_Data_Updater extends Document_Data_Updater {
	public function update_element( object $element_data ) {
		$element_assets = $this->document->get_element_assets( $element_data );

		if ( $element_assets ) {
			$this->document->update_page_assets( $element_assets );
		}
	}

	public function is_update_needed() {
		$page_assets = $this->document->get_page_assets();

		// When $page_assets is array it means that the assets registration has already been made at least once.
		if ( is_array( $page_assets ) ) {
			return false;
		}

		return true;
	}
}
