<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Page extends Controls_Stack {

	/**
	 * @var \WP_Post
	 */
	private $post;

	public function __construct( array $data = [] ) {
		$this->post = get_post( $data['post_id'] );

		$data['settings'] = $this->init_settings();

		parent::__construct( $data );
	}

	public function get_name() {
		return 'page-settings';
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'section_page_settings',
			[
				'label' => __( 'Page Settings', 'elementor' ),
				'tab' => Controls_Manager::TAB_SETTINGS,
			]
		);

		$this->add_control(
			'post_title',
			[
				'label' => __( 'Title', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'label_block' => true,
				'separator' => 'none',
			]
		);

		$this->add_control(
			'show_title',
			[
				'label' => __( 'Show Title', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __( 'No', 'elementor' ),
				'label_on' => __( 'Yes', 'elementor' ),
			]
		);

		if ( Manager::is_cpt_custom_templates_supported() ) {
			require_once ABSPATH . '/wp-admin/includes/template.php';

			$options = [
				'' => __( 'None', 'elementor' ),
			];

			$options += array_flip( get_page_templates( null, $this->post->post_type ) );

			$this->add_control(
				'template',
				[
					'label' => __( 'Template', 'elementor' ),
					'type' => Controls_Manager::SELECT,
					'options' => $options,
				]
			);
		}

		$post_type_object = get_post_type_object( $this->post->post_type );

		$can_publish = current_user_can( $post_type_object->cap->publish_posts );

		if ( 'publish' === $this->post->post_status || 'private' === $this->post->post_status || $can_publish ) {
			$this->add_control(
				'post_status',
				[
					'label' => __( 'Post Status', 'elementor' ),
					'type' => Controls_Manager::SELECT,
					'options' => get_post_statuses(),
				]
			);
		}

		$this->end_controls_section();

		$this->start_controls_section(
			'section_page_style',
			[
				'label' => __( 'Page Style', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'margin',
			[
				'label' => __( 'Margin' ),
				'type' => Controls_Manager::DIMENSIONS,
			]
		);

		$this->add_responsive_control(
			'padding',
			[
				'label' => __( 'Padding' ),
				'type' => Controls_Manager::DIMENSIONS,
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background',
				'label' => __( 'Background', 'elementor' ),
				'types' => [ 'none', 'classic', 'gradient' ],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'border',
				'label' => __( 'Border', 'elementor' ),
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'box_shadow',
				'label' => __( 'Box Shadow', 'elementor' ),
			]
		);

		$this->end_controls_section();
	}

	private function init_settings() {
		$settings = [
			'post_id' => $this->post->ID,
			'post_title' => $this->post->post_title,
			'post_status' => $this->post->post_status,
			'template' => get_post_meta( $this->post->ID, '_wp_page_template', true ),
			'show_title' => true,
		];

		$saved_settings = get_post_meta( $this->post->ID, Manager::META_KEY, true );

		if ( $saved_settings ) {
			$settings = array_merge( $settings, $saved_settings );
		}

		return $settings;
	}
}
