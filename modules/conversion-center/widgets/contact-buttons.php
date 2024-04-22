<?php

namespace Elementor\Modules\ConversionCenter\Widgets;

use Elementor\Controls_Manager;
use Elementor\Modules\ConversionCenter\Classes\Render\Contact_Buttons_Core_Render;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

/**
 * Elementor Contact Buttons widget.
 *
 * TODO: add description
 *
 * @since 3.23.0
 */
class Contact_Buttons extends Widget_Base {
    public function get_name(): string {
		return 'contact-buttons';
	}

	public function get_title(): string {
		return esc_html__( 'Contact Buttons', 'elementor' );
	}

	public function get_icon(): string {
		return 'eicon-commenting-o';
	}

	public function get_categories(): array {
		return [ 'general' ];
	}

	public function get_keywords(): array {
		return [ 'buttons', 'contact', 'widget' ];
	}

	public function get_stack( $with_common_controls = true ): array {
		return parent::get_stack( false );
	}

	protected function register_controls(): void {
		// Chat button Controls
		// Top bar controls
		// Message bubble controls
		// Send button controls

		// Style tab

		// Advanced tab
	}

	protected function render(): void {
		$render_strategy = new Contact_Buttons_Core_Render( $this );

		$render_strategy->render();
	}

}