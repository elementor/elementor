<?php

namespace Elementor\Modules\ConversionCenter\Widgets;

use Elementor\Controls_Manager;
use Elementor\Modules\ConversionCenter\Classes\Render\Contact_Buttons_Core_Render;
use Elementor\Widget_Base;
use Elementor\Utils;

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
		$this->add_chat_button_section();

		$this->add_top_bar_section();
		
		$this->add_message_bubble_section();
		
		$this->add_send_button_section();

		// Style tab

		// Advanced tab
	}

	private function add_chat_button_section(): void {
		$this->start_controls_section(
			'chat_button_section',
			[
				'label' => esc_html__( 'Chat Button', 'elementor' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'chat_button_platform',
			[
				'label'     => esc_html__( 'Platform', 'elementor' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'whatsapp',
				'options'   => [
					'email' => esc_html__( 'Email', 'elementor' ),
					'sms' => esc_html__( 'SMS', 'elementor' ),
					'whatsapp' => esc_html__( 'Whatsapp', 'elementor' ),
					'skype' => esc_html__( 'Skype', 'elementor' ),
					'messenger' => esc_html__( 'Messenger', 'elementor' ),
					'viber' => esc_html__( 'Viber', 'elementor' ),
					'url' => esc_html__( 'Url', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'chat_button_show_dot',
			[
				'label'        => esc_html__( 'Display Notification Dot', 'elementor' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'elementor' ),
				'label_off'    => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			]
		);

		$this->end_controls_section();
	}

	private function add_top_bar_section(): void {
		$this->start_controls_section(
			'top_bar_section',
			[
				'label' => esc_html__( 'Top Bar', 'elementor' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'top_bar_name',
			[
				'label' => esc_html__( 'Name', 'elementor' ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'default' => esc_html__( 'Rob Jones', 'elementor' ),
				'placeholder' => esc_html__( 'Type your name here', 'elementor' ),
			]
		);

		$this->add_control(
			'top_bar_title',
			[
				'label' => esc_html__( 'Title', 'elementor' ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'default' => esc_html__( 'Store Manager', 'elementor' ),
				'placeholder' => esc_html__( 'Type your title here', 'elementor' ),
			]
		);

		$this->add_control(
			'top_bar_image',
			[
				'label'   => esc_html__( 'Profile Image', 'elementor' ),
				'type'    => Controls_Manager::MEDIA,
				'default' => [
					'url' => Utils::get_placeholder_image_src(),
				],
			]
		);

		$this->add_control(
			'top_bar_show_dot',
			[
				'label'        => esc_html__( 'Display Active Dot', 'elementor' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'elementor' ),
				'label_off'    => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			]
		);

		$this->end_controls_section();

	}

	private function add_message_bubble_section(): void {
		$this->start_controls_section(
			'message_bubble_section',
			[
				'label' => esc_html__( 'Message Bubble', 'elementor' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'message_bubble_name',
			[
				'label' => esc_html__( 'Name', 'elementor' ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'default' => esc_html__( 'Rob', 'elementor' ),
				'placeholder' => esc_html__( 'Type your name here', 'elementor' ),
			]
		);

		$this->add_control(
			'message_bubble_body',
			[
				'label'       => esc_html__( 'Message', 'elementor' ),
				'type'        => Controls_Manager::TEXTAREA,
				'dynamic'     => [
					'active' => true,
				],
				'label_block' => true,
				'default' => esc_html__( 'Hey, how can I help you today?', 'elementor' ),
				'placeholder' => esc_html__( 'Message', 'elementor' ),
			],
		);

		$this->add_control(
			'chat_button_time_format',
			[
				'label'     => esc_html__( 'Time format', 'elementor' ),
				'type'      => Controls_Manager::SELECT,
				'default'   => 'whatsapp',
				'options'   => [
					// TODO: this needs to be dynamic from user end
					'12h' => esc_html__( '2:20pm', 'elementor' ),
					'24h' => esc_html__( '14:20', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'chat_button_show_animation',
			[
				'label'        => esc_html__( 'Display Typing Animation', 'elementor' ),
				'type'         => Controls_Manager::SWITCHER,
				'label_on'     => esc_html__( 'Yes', 'elementor' ),
				'label_off'    => esc_html__( 'No', 'elementor' ),
				'return_value' => 'yes',
				'default'      => 'yes',
			]
		);

		$this->end_controls_section();
	}

	private function add_send_button_section(): void {
		$this->start_controls_section(
			'send_button_section',
			[
				'label' => esc_html__( 'Send Button', 'elementor' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'send_button_text',
			[
				'label' => esc_html__( 'Text', 'elementor' ),
				'type' => \Elementor\Controls_Manager::TEXT,
				'default' => esc_html__( 'Click to start chat', 'elementor' ),
				'placeholder' => esc_html__( 'Type your text here', 'elementor' ),
			]
		);

		$this->add_control(
			'send_button_whatsapp_number',
			[
				'label'       => esc_html__( 'Account phone number', 'elementor' ),
				'type'        => Controls_Manager::TEXT,
				'dynamic'     => [
					'active' => true,
				],
				'label_block' => true,
				'placeholder' => esc_html__( '+', 'elementor' ),
				'condition'   => [
					'chat_button_platform' => 'whatsapp'
				],
			],
		);

		$this->add_control(
			'send_button_skype_username',
			[
				'label'       => esc_html__( 'Username', 'elementor' ),
				'type'        => Controls_Manager::TEXT,
				'dynamic'     => [
					'active' => true,
				],
				'label_block' => true,
				'condition'   => [
					'chat_button_platform' => 'skype'
				],
			],
		);

		$this->add_control(
			'send_button_url',
			[
				'label'       => esc_html__( 'Link', 'elementor' ),
				'type'        => Controls_Manager::TEXT,
				'dynamic'     => [
					'active' => true,
				],
				'autocomplete' => true,
				'label_block' => true,
				'condition'   => [
					'chat_button_platform' => 'url'
				],
			],
		);

		$this->end_controls_section();
	}

	protected function render(): void {
		$render_strategy = new Contact_Buttons_Core_Render( $this );

		$render_strategy->render();
	}

}