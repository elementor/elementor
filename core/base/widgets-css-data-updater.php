<?php
namespace Elementor\Core\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Widgets_Css_Data_Updater extends Document_Data_Updater {
	public function update_unique_widget( object $element_data ) {
		$this->document->save_widgets_css( $element_data->get_name() );
	}

	public function is_update_needed() {
		return false;
	}
}
