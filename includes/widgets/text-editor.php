<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Text_Editor extends Widget_Base {

	public static function get_name() {
		return 'text-editor';
	}

	public static function get_title() {
		return __( 'Text Editor', 'elementor' );
	}

	public static function get_icon() {
		return 'align-left';
	}

	protected static function _register_controls() {
		self::add_control(
			'section_editor',
			[
				'label' => __( 'Text Editor', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		self::add_control(
			'editor',
			[
				'label' => '',
				'type' => Controls_Manager::WYSIWYG,
				'default' => __( 'I am text block. Click edit button to change this text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'elementor' ),
				'section' => 'section_editor',
			]
		);

		self::add_control(
			'section_style',
			[
				'label' => __( 'Text Editor', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		self::add_responsive_control(
			'align',
			[
				'label' => __( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'tab' => Controls_Manager::TAB_STYLE,
				'section' => 'section_style',
				'options' => [
					'left' => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'align-left',
					],
					'center' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'align-center',
					],
					'right' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'align-right',
					],
					'justify' => [
						'title' => __( 'Justified', 'elementor' ),
						'icon' => 'align-justify',
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-text-editor' => 'text-align: {{VALUE}};',
				],
			]
		);

	    self::add_control(
	        'text_color',
	        [
	            'label' => __( 'Text Color', 'elementor' ),
	            'type' => Controls_Manager::COLOR,
	            'tab' => Controls_Manager::TAB_STYLE,
	            'section' => 'section_style',
	            'default' => '',
	            'selectors' => [
	                '{{WRAPPER}}' => 'color: {{VALUE}};',
	            ],
	            'scheme' => [
		            'type' => Scheme_Color::get_type(),
		            'value' => Scheme_Color::COLOR_3,
	            ],
	        ]
	    );

		self::add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'typography',
				'section' => 'section_style',
				'tab' => Controls_Manager::TAB_STYLE,
				'scheme' => Scheme_Typography::TYPOGRAPHY_3,
			]
		);
	}

	protected function render() {
		$editor_content = $this->get_settings( 'editor' );

		$editor_content = $this->parse_text_editor( $editor_content );
		?>
		<div class="elementor-text-editor"><?php echo $editor_content; ?></div>
		<?php
	}

	public function render_plain_content() {
		// In plain mode, render without shortcode
		echo $this->get_settings( 'editor' );
	}

	protected static function _content_template() {
		?>
		<div class="elementor-text-editor">{{{ settings.editor }}}</div>
		<?php
	}
}
