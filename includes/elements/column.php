<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Element_Column extends Element_Base {

	public function get_id() {
		return 'column';
	}

	public function get_title() {
		return __( 'Column', 'elementor' );
	}

	public function get_icon() {
		return 'columns';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_style',
			[
				'label' => __( 'Background & Border', 'elementor' ),
				'tab' => self::TAB_STYLE,
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style',
				'selector' => '{{WRAPPER}} > .elementor-element-populated',
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'border',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style',
				'selector' => '{{WRAPPER}} > .elementor-element-populated',
			]
		);

		$this->add_control(
			'border_radius',
			[
				'label' => __( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'tab' => self::TAB_STYLE,
				'section' => 'section_style',
				'selectors' => [
					'{{WRAPPER}} > .elementor-element-populated' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'box_shadow',
				'section' => 'section_style',
				'tab' => self::TAB_STYLE,
				'selector' => '{{WRAPPER}} > .elementor-element-populated',
			]
		);

		// Section Typography
		$this->add_control(
			'section_typo',
			[
				'label' => __( 'Typography', 'elementor' ),
				'tab' => self::TAB_STYLE,
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'color_text',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'section' => 'section_typo',
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} > .elementor-element-populated' => 'color: {{VALUE}};',
				],
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'heading_color',
			[
				'label' => __( 'Heading Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-element-populated .elementor-heading-title' => 'color: {{VALUE}};',
				],
				'tab' => self::TAB_STYLE,
				'section' => 'section_typo',
			]
		);

		$this->add_control(
			'color_link',
			[
				'label' => __( 'Link Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'section' => 'section_typo',
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-element-populated a' => 'color: {{VALUE}};',
				],
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'color_link_hover',
			[
				'label' => __( 'Link Hover Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'section' => 'section_typo',
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-element-populated a:hover' => 'color: {{VALUE}};',
				],
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'text_align',
			[
				'label' => __( 'Text Align', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'tab' => self::TAB_STYLE,
				'section' => 'section_typo',
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
				],
				'selectors' => [
					'{{WRAPPER}} > .elementor-element-populated' => 'text-align: {{VALUE}};',
				],
			]
		);

		// Section Advanced
		$this->add_control(
			'section_advanced',
			[
				'label' => __( 'Advanced', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_ADVANCED,
			]
		);

		$this->add_control(
			'margin',
			[
				'label' => __( 'Margin', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'section' => 'section_advanced',
				'tab' => self::TAB_ADVANCED,
				'selectors' => [
					'{{WRAPPER}} > .elementor-element-populated' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'padding',
			[
				'label' => __( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', 'em', '%' ],
				'section' => 'section_advanced',
				'tab' => self::TAB_ADVANCED,
				'selectors' => [
					'{{WRAPPER}} > .elementor-element-populated' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'animation',
			[
				'label' => __( 'Entrance Animation', 'elementor' ),
				'type' => Controls_Manager::ANIMATION,
				'default' => '',
				'prefix_class' => 'animated ',
				'tab' => self::TAB_ADVANCED,
				'label_block' => true,
				'section' => 'section_advanced',
			]
		);

		$this->add_control(
			'animation_duration',
			[
				'label' => __( 'Animation Duration', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'slow' => __( 'Slow', 'elementor' ),
					'' => __( 'Normal', 'elementor' ),
					'fast' => __( 'Fast', 'elementor' ),
				],
				'prefix_class' => 'animated-',
				'tab' => self::TAB_ADVANCED,
				'section' => 'section_advanced',
				'condition' => [
					'animation!' => '',
				],
			]
		);

		$this->add_control(
			'css_classes',
			[
				'label' => __( 'CSS Classes', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'section' => 'section_advanced',
				'tab' => self::TAB_ADVANCED,
				'default' => '',
				'prefix_class' => '',
				'label_block' => true,
				'title' => __( 'Add your custom class WITHOUT the dot. e.g: my-class', 'elementor' ),
			]
		);

		// Section Responsive
		$this->add_control(
			'section_responsive',
			[
				'label' => __( 'Responsive', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_ADVANCED,
			]
		);

		$responsive_points = [
			'screen_sm' => [
				'title' => __( 'Mobile Landscape', 'elementor' ),
				'class_prefix' => 'elementor-sm-',
			],
			'screen_xs' => [
				'title' => __( 'Mobile Portrait', 'elementor' ),
				'class_prefix' => 'elementor-xs-',
			],
		];

		foreach ( $responsive_points as $point_name => $point_data ) {
			$this->add_control(
				$point_name,
				[
					'label' => $point_data['title'],
					'type' => Controls_Manager::SELECT,
					'section' => 'section_responsive',
					'default' => 'default',
					'options' => [
						'default' => __( 'Default', 'elementor' ),
						'custom' => __( 'Custom', 'elementor' ),
					],
					'tab' => self::TAB_ADVANCED,
				]
			);

			$this->add_control(
				$point_name . '_width',
				[
					'label' => __( 'Column Width', 'elementor' ),
					'type' => Controls_Manager::SELECT,
					'section' => 'section_responsive',
					'options' => [
						'10' => '10%',
						'11' => '11%',
						'12' => '12%',
						'14' => '14%',
						'16' => '16%',
						'20' => '20%',
						'25' => '25%',
						'30' => '30%',
						'33' => '33%',
						'40' => '40%',
						'50' => '50%',
						'60' => '60%',
						'66' => '66%',
						'70' => '70%',
						'75' => '75%',
						'80' => '80%',
						'83' => '83%',
						'90' => '90%',
						'100' => '100%',
					],
					'default' => '100',
					'tab' => self::TAB_ADVANCED,
					'condition' => [
						$point_name => [ 'custom' ],
					],
					'prefix_class' => $point_data['class_prefix'],
				]
			);
		}
	}

	protected function render_settings() {
		?>
		<div class="elementor-element-overlay">
			<div class="column-title"></div>
			<div class="elementor-editor-element-settings elementor-editor-column-settings">
				<ul class="elementor-editor-element-settings-list elementor-editor-column-settings-list">
					<li class="elementor-editor-element-setting elementor-editor-element-trigger">
						<a href="#" title="<?php _e( 'Drag Column', 'elementor' ); ?>"><?php _e( 'Column', 'elementor' ); ?></a>
					</li>
					<?php /* Temp removing for better UI
					<li class="elementor-editor-element-setting elementor-editor-element-edit">
						<a href="#" title="<?php _e( 'Edit Column', 'elementor' ); ?>">
							<span class="elementor-screen-only"><?php _e( 'Edit', 'elementor' ); ?></span>
							<i class="fa fa-pencil"></i>
						</a>
					</li>
					*/ ?>
					<li class="elementor-editor-element-setting elementor-editor-element-duplicate">
						<a href="#" title="<?php _e( 'Duplicate Column', 'elementor' ); ?>">
							<span class="elementor-screen-only"><?php _e( 'Duplicate', 'elementor' ); ?></span>
							<i class="fa fa-files-o"></i>
						</a>
					</li>
					<li class="elementor-editor-element-setting elementor-editor-element-add">
						<a href="#" title="<?php _e( 'Add New Column', 'elementor' ); ?>">
							<span class="elementor-screen-only"><?php _e( 'Add', 'elementor' ); ?></span>
							<i class="fa fa-plus"></i>
						</a>
					</li>
					<li class="elementor-editor-element-setting elementor-editor-element-remove">
						<a href="#" title="<?php _e( 'Remove Column', 'elementor' ); ?>">
							<span class="elementor-screen-only"><?php _e( 'Remove', 'elementor' ); ?></span>
							<i class="fa fa-times"></i>
						</a>
					</li>
				</ul>
				<ul class="elementor-editor-element-settings-list  elementor-editor-section-settings-list">
					<li class="elementor-editor-element-setting elementor-editor-element-trigger">
						<a href="#" title="<?php _e( 'Drag Section', 'elementor' ); ?>"><?php _e( 'Section', 'elementor' ); ?></a>
					</li>
					<?php /* Temp removing for better UI
					<li class="elementor-editor-element-setting elementor-editor-element-edit">
						<a href="#" title="<?php _e( 'Edit', 'elementor' ); ?>">
							<span class="elementor-screen-only"><?php _e( 'Edit Section', 'elementor' ); ?></span>
							<i class="fa fa-pencil"></i>
						</a>
					</li>
					*/ ?>
					<li class="elementor-editor-element-setting elementor-editor-element-duplicate">
						<a href="#" title="<?php _e( 'Duplicate', 'elementor' ); ?>">
							<span class="elementor-screen-only"><?php _e( 'Duplicate Section', 'elementor' ); ?></span>
							<i class="fa fa-files-o"></i>
						</a>
					</li>
					<li class="elementor-editor-element-setting elementor-editor-element-save">
						<a href="#" title="<?php _e( 'Save', 'elementor' ); ?>">
							<span class="elementor-screen-only"><?php _e( 'Save to Library', 'elementor' ); ?></span>
							<i class="fa fa-floppy-o"></i>
						</a>
					</li>
					<li class="elementor-editor-element-setting elementor-editor-element-remove">
						<a href="#" title="<?php _e( 'Remove', 'elementor' ); ?>">
							<span class="elementor-screen-only"><?php _e( 'Remove Section', 'elementor' ); ?></span>
							<i class="fa fa-times"></i>
						</a>
					</li>
				</ul>
			</div>
		</div>
		<?php
	}

	protected function content_template() {
		?>
		<div class="elementor-column-wrap">
			<div class="elementor-widget-wrap"></div>
		</div>
		<?php
	}

	public function before_render( $instance, $element_id, $element_data = [] ) {
		$column_type = ! empty( $element_data['isInner'] ) ? 'inner' : 'top';

		$this->add_render_attribute( 'wrapper', 'class', [
			'elementor-column',
			'elementor-element',
			'elementor-element-' . $element_id,
			'elementor-col-' . $instance['_column_size'],
			'elementor-' . $column_type . '-column',
		] );

		foreach ( $this->get_class_controls() as $control ) {
			if ( empty( $instance[ $control['name'] ] ) )
				continue;

			if ( ! $this->is_control_visible( $instance, $control ) )
				continue;

			$this->add_render_attribute( 'wrapper', 'class', $control['prefix_class'] . $instance[ $control['name'] ] );
		}

		if ( ! empty( $instance['animation'] ) ) {
			$this->add_render_attribute( 'wrapper', 'data-animation', $instance['animation'] );
		}

		$this->add_render_attribute( 'wrapper', 'data-element_type', $this->get_id() );
		?>
		<div <?php echo $this->get_render_attribute_string( 'wrapper' ); ?>>
			<div class="elementor-column-wrap<?php if ( ! empty( $element_data['elements'] ) ) echo ' elementor-element-populated'; ?>">
				<div class="elementor-widget-wrap">
		<?php
	}

	public function after_render( $instance, $element_id, $element_data = [] ) {
		?>
				</div>
			</div>
		</div>
		<?php
	}
}
