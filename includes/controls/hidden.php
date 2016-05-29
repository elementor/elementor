<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Hidden extends Control_Base {

	public function get_type() {
		return 'hidden';
	}

	public function content_template() {
		?>
		<input type="hidden" data-setting="<%= data.name %>" />
		<?php
	}
}
