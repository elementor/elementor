<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;

/**
 * Elementor text editor widget.
 *
 * Elementor widget that displays a WYSIWYG text editor, just like the WordPress
 * editor.
 *
 * @since 1.0.0
 */
class Widget_Text_Editor extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve text editor widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'text-editor';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve text editor widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return esc_html__( 'Text Editor', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve text editor widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-text';
	}

	/**
	 * Get widget categories.
	 *
	 * Retrieve the list of categories the text editor widget belongs to.
	 *
	 * Used to determine where to display the widget in the editor.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @return array Widget categories.
	 */
	public function get_categories() {
		return array( 'basic' );
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @since 2.1.0
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return array( 'text', 'editor' );
	}

	/**
	 * Get style dependencies.
	 *
	 * Retrieve the list of style dependencies the widget requires.
	 *
	 * @since 3.24.0
	 * @access public
	 *
	 * @return array Widget style dependencies.
	 */
	public function get_style_depends(): array {
		return array( 'widget-text-editor' );
	}

	public function has_widget_inner_wrapper(): bool {
		return ! Plugin::$instance->experiments->is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register text editor widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 3.1.0
	 * @access protected
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'section_editor',
			array(
				'label' => esc_html__( 'Text Editor', 'elementor' ),
			)
		);

		$this->add_control(
			'editor',
			array(
				'label' => '',
				'type' => Controls_Manager::WYSIWYG,
				'default' => '<p>' . esc_html__( 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'elementor' ) . '</p>',
			)
		);

		$this->add_control(
			'drop_cap', array(
				'label' => esc_html__( 'Drop Cap', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => esc_html__( 'Off', 'elementor' ),
				'label_on' => esc_html__( 'On', 'elementor' ),
				'prefix_class' => 'elementor-drop-cap-',
				'frontend_available' => true,
			)
		);

		$this->add_responsive_control(
			'text_columns',
			array(
				'label' => esc_html__( 'Columns', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'separator' => 'before',
				'options' => array(
					'' => esc_html__( 'Default', 'elementor' ),
					'1' => esc_html__( '1', 'elementor' ),
					'2' => esc_html__( '2', 'elementor' ),
					'3' => esc_html__( '3', 'elementor' ),
					'4' => esc_html__( '4', 'elementor' ),
					'5' => esc_html__( '5', 'elementor' ),
					'6' => esc_html__( '6', 'elementor' ),
					'7' => esc_html__( '7', 'elementor' ),
					'8' => esc_html__( '8', 'elementor' ),
					'9' => esc_html__( '9', 'elementor' ),
					'10' => esc_html__( '10', 'elementor' ),
				),
				'selectors' => array(
					'{{WRAPPER}}' => 'columns: {{VALUE}};',
				),
			)
		);

		$this->add_responsive_control(
			'column_gap',
			array(
				'label' => esc_html__( 'Columns Gap', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'range' => array(
					'px' => array(
						'max' => 100,
					),
					'%' => array(
						'max' => 10,
						'step' => 0.1,
					),
					'vw' => array(
						'max' => 10,
						'step' => 0.1,
					),
					'em' => array(
						'max' => 10,
					),
					'rem' => array(
						'max' => 10,
					),
				),
				'selectors' => array(
					'{{WRAPPER}}' => 'column-gap: {{SIZE}}{{UNIT}};',
				),
				'conditions' => array(
					'relation' => 'or',
					'terms' => array(
						array(
							'name' => 'text_columns',
							'operator' => '>',
							'value' => 1,
						),
						array(
							'name' => 'text_columns',
							'operator' => '===',
							'value' => '',
						),
					),
				),
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style',
			array(
				'label' => esc_html__( 'Text Editor', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_responsive_control(
			'align',
			array(
				'label' => esc_html__( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => array(
					'left' => array(
						'title' => esc_html__( 'Left', 'elementor' ),
						'icon' => 'eicon-text-align-left',
					),
					'center' => array(
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-text-align-center',
					),
					'right' => array(
						'title' => esc_html__( 'Right', 'elementor' ),
						'icon' => 'eicon-text-align-right',
					),
					'justify' => array(
						'title' => esc_html__( 'Justified', 'elementor' ),
						'icon' => 'eicon-text-align-justify',
					),
				),
				'selectors' => array(
					'{{WRAPPER}}' => 'text-align: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'text_color',
			array(
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}}' => 'color: {{VALUE}};',
				),
				'global' => array(
					'default' => Global_Colors::COLOR_TEXT,
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name' => 'typography',
				'global' => array(
					'default' => Global_Typography::TYPOGRAPHY_TEXT,
				),
			)
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			array(
				'name' => 'text_shadow',
				'selector' => '{{WRAPPER}}',
			)
		);

		$this->add_responsive_control(
			'paragraph_spacing',
			array(
				'label' => esc_html__( 'Paragraph Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'vh', 'custom' ),
				'range' => array(
					'px' => array(
						'max' => 100,
					),
					'em' => array(
						'min' => 0.1,
						'max' => 20,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} p' => 'margin-bottom: {{SIZE}}{{UNIT}}',
				),
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_drop_cap',
			array(
				'label' => esc_html__( 'Drop Cap', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'drop_cap' => 'yes',
				),
			)
		);

		$this->add_control(
			'drop_cap_view',
			array(
				'label' => esc_html__( 'View', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => array(
					'default' => esc_html__( 'Default', 'elementor' ),
					'stacked' => esc_html__( 'Stacked', 'elementor' ),
					'framed' => esc_html__( 'Framed', 'elementor' ),
				),
				'default' => 'default',
				'prefix_class' => 'elementor-drop-cap-view-',
			)
		);

		$this->add_control(
			'drop_cap_primary_color',
			array(
				'label' => esc_html__( 'Primary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}}.elementor-drop-cap-view-stacked .elementor-drop-cap' => 'background-color: {{VALUE}};',
					'{{WRAPPER}}.elementor-drop-cap-view-framed .elementor-drop-cap, {{WRAPPER}}.elementor-drop-cap-view-default .elementor-drop-cap' => 'color: {{VALUE}}; border-color: {{VALUE}};',
				),
				'global' => array(
					'default' => Global_Colors::COLOR_PRIMARY,
				),
			)
		);

		$this->add_control(
			'drop_cap_secondary_color',
			array(
				'label' => esc_html__( 'Secondary Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => array(
					'{{WRAPPER}}.elementor-drop-cap-view-framed .elementor-drop-cap' => 'background-color: {{VALUE}};',
					'{{WRAPPER}}.elementor-drop-cap-view-stacked .elementor-drop-cap' => 'color: {{VALUE}};',
				),
				'condition' => array(
					'drop_cap_view!' => 'default',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			array(
				'name' => 'drop_cap_shadow',
				'selector' => '{{WRAPPER}} .elementor-drop-cap',
			)
		);

		$this->add_control(
			'drop_cap_size',
			array(
				'label' => esc_html__( 'Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'default' => array(
					'size' => 5,
				),
				'range' => array(
					'px' => array(
						'max' => 30,
					),
					'em' => array(
						'max' => 3,
					),
					'rem' => array(
						'max' => 3,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-drop-cap' => 'padding: {{SIZE}}{{UNIT}};',
				),
				'condition' => array(
					'drop_cap_view!' => 'default',
				),
			)
		);

		$this->add_control(
			'drop_cap_space',
			array(
				'label' => esc_html__( 'Space', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'default' => array(
					'size' => 10,
				),
				'range' => array(
					'px' => array(
						'max' => 50,
					),
					'em' => array(
						'max' => 5,
					),
					'rem' => array(
						'max' => 5,
					),
				),
				'selectors' => array(
					'body:not(.rtl) {{WRAPPER}} .elementor-drop-cap' => 'margin-right: {{SIZE}}{{UNIT}};',
					'body.rtl {{WRAPPER}} .elementor-drop-cap' => 'margin-left: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_control(
			'drop_cap_border_radius',
			array(
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'default' => array(
					'unit' => '%',
				),
				'range' => array(
					'%' => array(
						'max' => 50,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-drop-cap' => 'border-radius: {{SIZE}}{{UNIT}};',
				),
				'condition' => array(
					'drop_cap_view!' => 'default',
				),
			)
		);

		$this->add_control(
			'drop_cap_border_width', array(
				'label' => esc_html__( 'Border Width', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'selectors' => array(
					'{{WRAPPER}} .elementor-drop-cap' => 'border-width: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
				'condition' => array(
					'drop_cap_view' => 'framed',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name' => 'drop_cap_typography',
				'selector' => '{{WRAPPER}} .elementor-drop-cap-letter',
				'exclude' => array(
					'letter_spacing',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render text editor widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {
		$should_render_inline_editing = Plugin::$instance->editor->is_edit_mode();

		$editor_content = $this->get_settings_for_display( 'editor' );
		$editor_content = $this->parse_text_editor( $editor_content );

		if ( empty( $editor_content ) ) {
			return;
		}

		if ( $should_render_inline_editing ) {
			$this->add_render_attribute( 'editor', 'class', array( 'elementor-text-editor', 'elementor-clearfix' ) );
		}

		$this->add_inline_editing_attributes( 'editor', 'advanced' );
		?>
		<?php if ( $should_render_inline_editing ) { ?>
			<div <?php $this->print_render_attribute_string( 'editor' ); ?>>
		<?php } ?>
		<?php // PHPCS - the main text of a widget should not be escaped.
				echo $editor_content; // phpcs:ignore WordPress.Security.EscapeOutput ?>
		<?php if ( $should_render_inline_editing ) { ?>
			</div>
		<?php } ?>
		<?php
	}

	/**
	 * Render text editor widget as plain content.
	 *
	 * Override the default behavior by printing the content without rendering it.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function render_plain_content() {
		// In plain mode, render without shortcode
		$this->print_unescaped_setting( 'editor' );
	}

	/**
	 * Render text editor widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 2.9.0
	 * @access protected
	 */
	protected function content_template() {
		?>
		<#
		if ( '' === settings.editor ) {
			return;
		}

		const shouldRenderInlineEditing = elementorFrontend.isEditMode();

		if ( shouldRenderInlineEditing ) {
			view.addRenderAttribute( 'editor', 'class', [ 'elementor-text-editor', 'elementor-clearfix' ] );
		}

		view.addInlineEditingAttributes( 'editor', 'advanced' );

		if ( shouldRenderInlineEditing ) { #>
			<div {{{ view.getRenderAttributeString( 'editor' ) }}}>
		<# } #>

			{{{ settings.editor }}}

		<# if ( shouldRenderInlineEditing ) { #>
			</div>
		<# } #>
		<?php
	}
}
