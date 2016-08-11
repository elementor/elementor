<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Divider extends Control_Base {

	public function get_type() {
		return 'divider';
	}

	public function content_template() {
		?>
		<hr />
		<?php
	}
}
