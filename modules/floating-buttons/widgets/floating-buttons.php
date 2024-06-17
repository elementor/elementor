<?php

namespace Elementor\Modules\FloatingButtons\Widgets;

use Elementor\Modules\FloatingButtons\Base\Widget_Floating_Button_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor Contact Buttons widget.
 *
 * Elementor widget that displays contact buttons and a chat-like prompt message.
 *
 * @since 3.23.0
 */
class Floating_Buttons extends Widget_Floating_Button_Base {

	public function get_name(): string {
		return 'contact-buttons';
	}

	public function get_title(): string {
		return esc_html__( 'Single chat', 'elementor' );
	}

}
