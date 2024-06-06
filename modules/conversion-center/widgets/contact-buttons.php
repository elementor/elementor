<?php

namespace Elementor\Modules\ConversionCenter\Widgets;

use Elementor\Modules\ConversionCenter\Base\Widget_Contact_Button_Base;

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
class Contact_Buttons extends Widget_Contact_Button_Base {

	public function get_name(): string {
		return 'contact-buttons';
	}

	public function get_title(): string {
		return esc_html__( 'Contact Buttons', 'elementor' );
	}

}
