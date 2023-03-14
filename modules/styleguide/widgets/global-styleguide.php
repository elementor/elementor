<?php
namespace Elementor\Modules\Styleguide\Widgets;

use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Styleguide extends Widget_Base {

	public function get_name() {
		return 'global-styleguide';
	}

	public function get_title() {
		return esc_html__( 'Global Styleguide', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-globe';
	}

	public function get_keywords() {
		return [ 'global-styleguide', 'design' ];
	}

	public function show_in_panel() {
		return false;
	}

	protected function render() {
		?>
			<div class="elementor-global-styleguide-widget">.</div>
		<?php
	}
}
