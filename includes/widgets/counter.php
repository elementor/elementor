<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;

/**
 * Elementor counter widget.
 *
 * Elementor widget that displays stats and numbers in an escalating manner.
 *
 * @since 1.0.0
 */
class Widget_Counter extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve counter widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'counter';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve counter widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return esc_html__( 'Counter', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve counter widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-counter';
	}

	/**
	 * Retrieve the list of scripts the counter widget depended on.
	 *
	 * Used to set scripts dependencies required to run the widget.
	 *
	 * @since 1.3.0
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_script_depends() {
		return [ 'jquery-numerator' ];
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
		return [ 'counter' ];
	}

	/**
	 * Register counter widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 3.1.0
	 * @access protected
	 */
	protected function register_controls() {
		$start = is_rtl() ? 'right' : 'left';
		$end = ! is_rtl() ? 'right' : 'left';

		$this->start_controls_section(
			'section_counter',
			[
				'label' => esc_html__( 'Counter', 'elementor' ),
			]
		);

		$this->add_control(
			'starting_number',
			[
				'label' => esc_html__( 'Starting Number', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => 0,
				'dynamic' => [
					'active' => true,
				],
			]
		);

		$this->add_control(
			'ending_number',
			[
				'label' => esc_html__( 'Ending Number', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => 100,
				'dynamic' => [
					'active' => true,
				],
			]
		);

		$this->add_control(
			'prefix',
			[
				'label' => esc_html__( 'Number Prefix', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'ai' => [
					'active' => false,
				],
				'default' => '',
			]
		);

		$this->add_control(
			'suffix',
			[
				'label' => esc_html__( 'Number Suffix', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => [
					'active' => true,
				],
				'ai' => [
					'active' => false,
				],
				'default' => '',
			]
		);

		$this->add_control(
			'duration',
			[
				'label' => esc_html__( 'Animation Duration', 'elementor' ) . ' (ms)',
				'type' => Controls_Manager::NUMBER,
				'default' => 2000,
				'min' => 100,
				'step' => 100,
			]
		);

		$this->add_control(
			'thousand_separator',
			[
				'label' => esc_html__( 'Thousand Separator', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'label_on' => esc_html__( 'Show', 'elementor' ),
				'label_off' => esc_html__( 'Hide', 'elementor' ),
			]
		);

		$this->add_control(
			'thousand_separator_char',
			[
				'label' => esc_html__( 'Separator', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'condition' => [
					'thousand_separator' => 'yes',
				],
				'options' => [
					'' => 'Default',
					'.' => 'Dot',
					' ' => 'Space',
					'_' => 'Underline',
					"'" => 'Apostrophe',
				],
			]
		);

		$this->add_control(
			'title',
			[
				'label' => esc_html__( 'Title', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'label_block' => true,
				'separator' => 'before',
				'dynamic' => [
					'active' => true,
				],
				'default' => esc_html__( 'Cool Number', 'elementor' ),
			]
		);

		$this->add_control(
			'title_tag',
			[
				'label' => esc_html__( 'Title HTML Tag', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'h1' => 'H1',
					'h2' => 'H2',
					'h3' => 'H3',
					'h4' => 'H4',
					'h5' => 'H5',
					'h6' => 'H6',
					'div' => 'div',
					'span' => 'span',
					'p' => 'p',
				],
				'default' => 'div',
				'condition' => [
					'title!' => '',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_number',
			[
				'label' => esc_html__( 'Number', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_responsive_control(
			'counter_position',
			[
				'label' => esc_html__( 'Position', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'start' => [
						'title' => esc_html__( 'Start', 'elementor' ),
						'icon' => "eicon-h-align-$start",
					],
					'center' => [
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-h-align-center',
					],
					'end' => [
						'title' => esc_html__( 'End', 'elementor' ),
						'icon' => "eicon-h-align-$end",
					],
					'stretch' => [
						'title' => esc_html__( 'Stretch', 'elementor' ),
						'icon' => 'eicon-grow',
					],
				],
				'selectors_dictionary' => [
					'start' => 'text-align: {{VALUE}}; --prefix-grow: 0; --suffix-grow: 1; --number-grow: 0;',
					'center' => 'text-align: {{VALUE}}; --prefix-grow: 1; --suffix-grow: 1; --number-grow: 0;',
					'end' => 'text-align: {{VALUE}}; --prefix-grow: 1; --suffix-grow: 0; --number-grow: 0;',
					'stretch' => '--prefix-grow: 0; --suffix-grow: 0; --number-grow: 1;',
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-counter-number-wrapper' => '{{VALUE}}',
				],
			]
		);

		$this->add_responsive_control(
			'counter_gap',
			[
				'label' => esc_html__( 'Gap', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'selectors' => [
					'{{WRAPPER}} .elementor-counter-number-wrapper' => 'gap: {{SIZE}}{{UNIT}};',
				],
				'conditions' => [
					'relation' => 'and',
					'terms' => [
						[
							'name' => 'counter_position',
							'operator' => '!==',
							'value' => 'stretch',
						],
						[
							'relation' => 'or',
							'terms' => [
								[
									'name' => 'prefix',
									'operator' => '!==',
									'value' => '',
								],
								[
									'name' => 'suffix',
									'operator' => '!==',
									'value' => '',
								],
							],
						],
					],
				],
			]
		);

		$this->add_responsive_control(
			'counter_align',
			[
				'label' => esc_html__( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'start' => [
						'title' => esc_html__( 'Start', 'elementor' ),
						'icon' => "eicon-text-align-$start",
					],
					'center' => [
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-text-align-center',
					],
					'end' => [
						'title' => esc_html__( 'End', 'elementor' ),
						'icon' => "eicon-text-align-$end",
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-counter-number' => 'text-align: {{VALUE}};',
				],
				'condition' => [
					'counter_position' => 'stretch',
				],
			]
		);

		$this->add_control(
			'number_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'global' => [
					'default' => Global_Colors::COLOR_PRIMARY,
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-counter-number-wrapper' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'typography_number',
				'global' => [
					'default' => Global_Typography::TYPOGRAPHY_PRIMARY,
				],
				'selector' => '{{WRAPPER}} .elementor-counter-number-wrapper',
			]
		);

		$this->add_group_control(
			Group_Control_Text_Stroke::get_type(),
			[
				'name' => 'number_stroke',
				'selector' => '{{WRAPPER}} .elementor-counter-number-wrapper',
			]
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name' => 'number_shadow',
				'selector' => '{{WRAPPER}} .elementor-counter-number-wrapper',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_title',
			[
				'label' => esc_html__( 'Title', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => [
					'title!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'title_position',
			[
				'label' => esc_html__( 'Position', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'before' => [
						'title' => esc_html__( 'Before', 'elementor' ),
						'icon' => 'eicon-v-align-top',
					],
					'after' => [
						'title' => esc_html__( 'After', 'elementor' ),
						'icon' => 'eicon-v-align-bottom',
					],
				],
				'selectors_dictionary' => [
					'before' => 'column',
					'after' => 'column-reverse',
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-counter' => 'flex-direction: {{VALUE}};',
				],
				'condition' => [
					'title!' => '',
				],
			]
		);

		$this->add_responsive_control(
			'title_gap',
			[
				'label' => esc_html__( 'Gap', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => [ 'px', 'em', 'rem', 'custom' ],
				'selectors' => [
					'{{WRAPPER}} .elementor-counter' => 'gap: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_responsive_control(
			'title_align',
			[
				'label' => esc_html__( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'start' => [
						'title' => esc_html__( 'Start', 'elementor' ),
						'icon' => "eicon-text-align-$start",
					],
					'center' => [
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-text-align-center',
					],
					'end' => [
						'title' => esc_html__( 'End', 'elementor' ),
						'icon' => "eicon-text-align-$end",
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-counter-title' => 'text-align: {{VALUE}};',
				],
				'condition' => [
					'title!' => '',
				],
			]
		);

		$this->add_control(
			'title_color',
			[
				'label' => esc_html__( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'global' => [
					'default' => Global_Colors::COLOR_SECONDARY,
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-counter-title' => 'color: {{VALUE}};',
				],
				'condition' => [
					'title!' => '',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'typography_title',
				'global' => [
					'default' => Global_Typography::TYPOGRAPHY_SECONDARY,
				],
				'selector' => '{{WRAPPER}} .elementor-counter-title',
				'condition' => [
					'title!' => '',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Text_Stroke::get_type(),
			[
				'name' => 'title_stroke',
				'selector' => '{{WRAPPER}} .elementor-counter-title',
				'condition' => [
					'title!' => '',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			[
				'name' => 'title_shadow',
				'selector' => '{{WRAPPER}} .elementor-counter-title',
				'condition' => [
					'title!' => '',
				],
			]
		);

		$this->end_controls_section();
	}

	/**
	 * Render counter widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 2.9.0
	 * @access protected
	 */
	protected function content_template() {
		?>
		<#
		view.addRenderAttribute( 'elementor-counter', 'class', 'elementor-counter' );

		view.addRenderAttribute( 'counter-number', 'class', 'elementor-counter-number-wrapper' );

		view.addRenderAttribute(
			'counter',
			{
				'class': 'elementor-counter-number',
				'data-duration': settings.duration,
				'data-to-value': settings.ending_number,
				'data-from-value': settings.starting_number,
			}
		);

		if ( settings.thousand_separator ) {
			const delimiter = settings.thousand_separator_char ? settings.thousand_separator_char : ',';
			view.addRenderAttribute( 'counter', 'data-delimiter', delimiter );
		}

		view.addRenderAttribute( 'prefix', 'class', 'elementor-counter-number-prefix' );

		view.addRenderAttribute( 'suffix', 'class', 'elementor-counter-number-suffix' );

		view.addRenderAttribute( 'counter-title', 'class', 'elementor-counter-title' );

		view.addInlineEditingAttributes( 'counter-title' );

		const titleTag = elementor.helpers.validateHTMLTag( settings.title_tag );
		#>
		<div {{{ view.getRenderAttributeString( 'elementor-counter' ) }}}>
			<# if ( settings.title ) {
				#><{{ titleTag }} {{{ view.getRenderAttributeString( 'counter-title' ) }}}>{{{ settings.title }}}</{{ titleTag }}><#
			} #>
			<div {{{ view.getRenderAttributeString( 'counter-number' ) }}}>
				<span {{{ view.getRenderAttributeString( 'prefix' ) }}}>{{{ settings.prefix }}}</span>
				<span {{{ view.getRenderAttributeString( 'counter' ) }}}>{{{ settings.starting_number }}}</span>
				<span {{{ view.getRenderAttributeString( 'suffix' ) }}}>{{{ settings.suffix }}}</span>
			</div>
		</div>
		<?php
	}

	/**
	 * Render counter widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();

		$this->add_render_attribute( 'elementor-counter', 'class', 'elementor-counter' );

		$this->add_render_attribute( 'counter-number', 'class', 'elementor-counter-number-wrapper' );

		$this->add_render_attribute(
			'counter',
			[
				'class' => 'elementor-counter-number',
				'data-duration' => $settings['duration'],
				'data-to-value' => $settings['ending_number'],
				'data-from-value' => $settings['starting_number'],
			]
		);

		if ( ! empty( $settings['thousand_separator'] ) ) {
			$delimiter = empty( $settings['thousand_separator_char'] ) ? ',' : $settings['thousand_separator_char'];
			$this->add_render_attribute( 'counter', 'data-delimiter', $delimiter );
		}

		$this->add_render_attribute( 'prefix', 'class', 'elementor-counter-number-prefix' );

		$this->add_render_attribute( 'suffix', 'class', 'elementor-counter-number-suffix' );

		$this->add_render_attribute( 'counter-title', 'class', 'elementor-counter-title' );

		$this->add_inline_editing_attributes( 'counter-title' );

		$title_tag = Utils::validate_html_tag( $settings['title_tag'] );
		?>
		<div <?php $this->print_render_attribute_string( 'elementor-counter' ); ?>>
			<?php
			if ( $settings['title'] ) :
				?><<?php Utils::print_validated_html_tag( $title_tag ); ?> <?php $this->print_render_attribute_string( 'counter-title' ); ?>><?php $this->print_unescaped_setting( 'title' ); ?></<?php Utils::print_validated_html_tag( $title_tag ); ?>><?php
			endif;
			?>
			<div <?php $this->print_render_attribute_string( 'counter-number' ); ?>>
				<span <?php $this->print_render_attribute_string( 'prefix' ); ?>><?php $this->print_unescaped_setting( 'prefix' ); ?></span>
				<span <?php $this->print_render_attribute_string( 'counter' ); ?>><?php $this->print_unescaped_setting( 'starting_number' ); ?></span>
				<span <?php $this->print_render_attribute_string( 'suffix' ); ?>><?php $this->print_unescaped_setting( 'suffix' ); ?></span>
			</div>
		</div>
		<?php
	}
}
