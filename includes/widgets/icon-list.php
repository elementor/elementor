<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Icon_List extends Widget_Base {

	public function get_name() {
		return 'icon-list';
	}

	public function get_title() {
		return __( 'Icon List', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-bullet-list';
	}

	public function get_categories() {
		return [ 'general-elements' ];
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'section_icon',
			[
				'label' => __( 'Icon List', 'elementor' ),
			]
		);

		$this->add_control(
			'icon_list',
			[
				'label' => '',
				'type' => Controls_Manager::REPEATER,
				'default' => [
					[
						'text' => __( 'List Item #1', 'elementor' ),
						'icon' => 'fa fa-check',
					],
					[
						'text' => __( 'List Item #2', 'elementor' ),
						'icon' => 'fa fa-times',
					],
					[
						'text' => __( 'List Item #3', 'elementor' ),
						'icon' => 'fa fa-dot-circle-o',
					],
				],
				'fields' => [
					[
						'name' => 'text',
						'label' => __( 'Text', 'elementor' ),
						'type' => Controls_Manager::TEXT,
						'label_block' => true,
						'placeholder' => __( 'List Item', 'elementor' ),
						'default' => __( 'List Item', 'elementor' ),
					],
					[
						'name' => 'icon',
						'label' => __( 'Icon', 'elementor' ),
						'type' => Controls_Manager::ICON,
						'label_block' => true,
						'default' => 'fa fa-check',
					],
					[
						'name' => 'link',
						'label' => __( 'Link', 'elementor' ),
						'type' => Controls_Manager::URL,
						'label_block' => true,
						'placeholder' => __( 'http://your-link.com', 'elementor' ),
					],
				],
				'title_field' => '<i class="{{ icon }}"></i> {{{ text }}}',
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_icon_list',
			[
				'label' => __( 'List', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'space_between',
			[
				'label' => __( 'Space Between', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'max' => 50,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-icon-list-item:not(:last-child)' => 'padding-bottom: calc({{SIZE}}{{UNIT}}/2)',
					'{{WRAPPER}} .elementor-icon-list-item:not(:first-child)' => 'margin-top: calc({{SIZE}}{{UNIT}}/2)',
				],
			]
		);

		$this->add_responsive_control(
			'icon_align',
			[
				'label' => __( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'left' => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'fa fa-align-left',
					],
					'center' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'fa fa-align-center',
					],
					'right' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'fa fa-align-right',
					],
				],
				'prefix_class' => 'elementor-align-',
				'selectors' => [
					'{{WRAPPER}} .elementor-icon-list-item, {{WRAPPER}} .elementor-icon-list-item a' => 'justify-content: {{VALUE}};',
				],
				'selectors_dictionary' => [
					'left' => 'flex-start',
					'right' => 'flex-end',
				],
			]
		);

		$this->add_control(
			'divider',
			[
				'label' => __( 'Divider', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __( 'Off', 'elementor' ),
				'label_on' => __( 'On', 'elementor' ),
				'selectors' => [
					'{{WRAPPER}} .elementor-icon-list-item:not(:last-child):after' => 'content: ""',
				],
				'separator' => 'before',
			]
		);

		$this->add_control(
			'divider_style',
			[
				'label' => __( 'Style', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'solid' => __( 'Solid', 'elementor' ),
					'double' => __( 'Double', 'elementor' ),
					'dotted' => __( 'Dotted', 'elementor' ),
					'dashed' => __( 'Dashed', 'elementor' ),
				],
				'default' => 'solid',
				'condition' => [
					'divider' => 'yes',
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-icon-list-item:not(:last-child):after' => 'border-top-style: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'divider_weight',
			[
				'label' => __( 'Weight', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 1,
				],
				'range' => [
					'px' => [
						'min' => 1,
						'max' => 10,
					],
				],
				'condition' => [
					'divider' => 'yes',
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-icon-list-item:not(:last-child):after' => 'border-top-width: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'divider_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '#ddd',
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_3,
				],
				'condition' => [
					'divider' => 'yes',
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-icon-list-item:not(:last-child):after' => 'border-top-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'divider_width',
			[
				'label' => __( 'Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'units' => [ '%' ],
				'default' => [
					'unit' => '%',
				],
				'condition' => [
					'divider' => 'yes',
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-icon-list-item:not(:last-child):after' => 'width: {{SIZE}}{{UNIT}}',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_icon_style',
			[
				'label' => __( 'Icon', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'icon_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-icon-list-icon i' => 'color: {{VALUE}};',
				],
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_1,
				],
			]
		);

		$this->add_control(
			'icon_size',
			[
				'label' => __( 'Size', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 14,
				],
				'range' => [
					'px' => [
						'min' => 6,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-icon-list-icon' => 'width: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-icon-list-icon i' => 'font-size: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_text_style',
			[
				'label' => __( 'Text', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'text_indent',
			[
				'label' => __( 'Text Indent', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => [
					'px' => [
						'max' => 50,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-icon-list-text' => is_rtl() ? 'padding-right: {{SIZE}}{{UNIT}};' : 'padding-left: {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'text_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-icon-list-text' => 'color: {{VALUE}};',
				],
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_2,
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'icon_typography',
				'label' => __( 'Typography', 'elementor' ),
				'selector' => '{{WRAPPER}} .elementor-icon-list-item',
				'scheme' => Scheme_Typography::TYPOGRAPHY_3,
			]
		);

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_settings();
		?>
		<ul class="elementor-icon-list-items">
			<?php foreach ( $settings['icon_list'] as $index => $item ) : ?>
				<li class="elementor-icon-list-item" >
					<?php
					if ( ! empty( $item['link']['url'] ) ) {
						$link_key = 'link_' . $index;

						$this->add_render_attribute( $link_key, 'href', $item['link']['url'] );

						if ( $item['link']['is_external'] ) {
							$this->add_render_attribute( $link_key, 'target', '_blank' );
						}

						if ( $item['link']['nofollow'] ) {
							$this->add_render_attribute( $link_key, 'rel', 'nofollow' );
						}

						echo '<a ' . $this->get_render_attribute_string( $link_key ) .  '>';
					}

					if ( $item['icon'] ) : ?>
						<span class="elementor-icon-list-icon">
							<i class="<?php echo esc_attr( $item['icon'] ); ?>"></i>
						</span>
					<?php endif; ?>
					<span class="elementor-icon-list-text"><?php echo $item['text']; ?></span>
					<?php
					if ( ! empty( $item['link']['url'] ) ) {
						echo '</a>';
					}
					?>
				</li>
				<?php
			endforeach; ?>
		</ul>
		<?php
	}

	protected function _content_template() {
		?>
		<ul class="elementor-icon-list-items">
			<#
			if ( settings.icon_list ) {
				_.each( settings.icon_list, function( item ) { #>
					<li class="elementor-icon-list-item">
						<# if ( item.link && item.link.url ) { #>
							<a href="{{ item.link.url }}">
						<# } #>
						<span class="elementor-icon-list-icon">
							<i class="{{ item.icon }}"></i>
						</span>
						<span class="elementor-icon-list-text">{{{ item.text }}}</span>
						<# if ( item.link && item.link.url ) { #>
							</a>
						<# } #>
					</li>
				<#
				} );
			} #>
		</ul>
		<?php
	}
}
