<?php
namespace Elementor\Core\Files\CSS;

use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


class Template extends Post_CSS {

	protected function parse_content() {
		$stack_cache_has_been_cleared = Plugin::$instance->controls_manager->stack_cache_has_been_cleared();
		$has_document = Plugin::$instance->documents->get_current();
		if ( ! $stack_cache_has_been_cleared && $has_document ) {
			Plugin::$instance->controls_manager->clear_stack_cache();
		}

		$initial_responsive_controls_duplication_mode = Plugin::$instance->breakpoints->get_responsive_control_duplication_mode();
		$current_duplication_mode = $this->get_responsive_control_duplication_mode();
		Plugin::$instance->breakpoints->set_responsive_control_duplication_mode( $current_duplication_mode );

		$this->render_css();

		$name = $this->get_name();

		/**
		 * Parse CSS file.
		 *
		 * Fires when CSS file is parsed on Elementor.
		 *
		 * The dynamic portion of the hook name, `$name`, refers to the CSS file name.
		 *
		 * @since 2.0.0
		 *
		 * @param Base $this The current CSS file.
		 */
		do_action( "elementor/css-file/{$name}/parse", $this );

		Plugin::$instance->breakpoints->set_responsive_control_duplication_mode( $initial_responsive_controls_duplication_mode );

		return $this->get_stylesheet()->__toString();
	}

}
