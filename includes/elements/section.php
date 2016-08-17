<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Element_Section extends Element_Base {

	private static $presets = [];

	public function get_id() {
		return 'section';
	}

	public function get_title() {
		return __( 'Section', 'elementor' );
	}

	public function get_icon() {
		return 'columns';
	}

	public static function get_presets( $columns_count = null, $preset_index = null ) {
		if ( ! self::$presets ) {
			self::init_presets();
		}

		$presets = self::$presets;

		if ( null !== $columns_count ) {
			$presets = $presets[ $columns_count ];
		}

		if ( null !== $preset_index ) {
			$presets = $presets[ $preset_index ];
		}

		return $presets;
	}

	public static function init_presets() {
		$additional_presets = [
			2 => [
				[
					'preset' => [ 33, 66 ],
				],
				[
					'preset' => [ 66, 33 ],
				],
			],
			3 => [
				[
					'preset' => [ 25, 25, 50 ],
				],
				[
					'preset' => [ 50, 25, 25 ],
				],
				[
					'preset' => [ 25, 50, 25 ],
				],
				[
					'preset' => [ 16, 66, 16 ],
				],
			],
		];

		foreach ( range( 1, 10 ) as $columns_count ) {
			self::$presets[ $columns_count ] = [
				[
					'preset' => [],
				],
			];

			$preset_unit = floor( 1 / $columns_count * 100 );

			for ( $i = 0; $i < $columns_count; $i++ ) {
				self::$presets[ $columns_count ][0]['preset'][] = $preset_unit;
			}

			if ( ! empty( $additional_presets[ $columns_count ] ) ) {
				self::$presets[ $columns_count ] = array_merge( self::$presets[ $columns_count ], $additional_presets[ $columns_count ] );
			}

			foreach ( self::$presets[ $columns_count ] as $preset_index => & $preset ) {
				$preset['key'] = $columns_count . $preset_index;
			}
		}
	}

	public function get_data() {
		$data = parent::get_data();

		$data['presets'] = self::get_presets();

		return $data;
	}

	protected function _register_controls() {
		$this->add_control(
			'section_layout',
			[
				'label' => __( 'Layout', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_LAYOUT,
			]
		);

		$this->add_control(
			'layout',
			[
				'label' => __( 'Width', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'boxed',
				'options' => [
					'boxed' => __( 'Boxed', 'elementor' ),
					'full_width' => __( 'Full Width', 'elementor' ),
				],
				'tab' => self::TAB_LAYOUT,
				'section' => 'section_layout',
			]
		);

		$this->add_control(
			'content_width',
			[
				'label' => __( 'Content Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 1140,
				],
				'range' => [
					'px' => [
						'min' => 500,
						'max' => 1600,
					],
				],
				'selectors' => [
					'{{WRAPPER}} > .elementor-container' => 'max-width: {{SIZE}}{{UNIT}};',
				],
				'condition' => [
					'layout' => [ 'boxed' ],
				],
				'tab' => self::TAB_LAYOUT,
				'section' => 'section_layout',
			]
		);

		$this->add_control(
			'gap',
			[
				'label' => __( 'Columns Gap', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => [
					'default' => __( 'Default', 'elementor' ),
					'no' => __( 'No Gap', 'elementor' ),
					'narrow' => __( 'Narrow', 'elementor' ),
					'extended' => __( 'Extended', 'elementor' ),
					'wide' => __( 'Wide', 'elementor' ),
					'wider' => __( 'Wider', 'elementor' ),
				],
				'tab' => self::TAB_LAYOUT,
				'section' => 'section_layout',
			]
		);

		$this->add_control(
			'height',
			[
				'label' => __( 'Height', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => [
					'default' => __( 'Default', 'elementor' ),
					'full' => __( 'Fit To Screen', 'elementor' ),
					'min-height' => __( 'Min Height', 'elementor' ),
				],
				'tab' => self::TAB_LAYOUT,
				'prefix_class' => 'elementor-section-height-',
				'section' => 'section_layout',
				'hide_in_inner' => true,
			]
		);

		$this->add_control(
			'custom_height',
			[
				'label' => __( 'Minimum Height', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 400,
				],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1440,
					],
				],
				'tab' => self::TAB_LAYOUT,
				'selectors' => [
					'{{WRAPPER}} > .elementor-container' => 'min-height: {{SIZE}}{{UNIT}};',
				],
				'condition' => [
					'height' => [ 'min-height' ],
				],
				'section' => 'section_layout',
				'hide_in_inner' => true,
			]
		);

		$this->add_control(
			'column_position',
			[
				'label' => __( 'Column Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'middle',
				'options' => [
					'stretch' => __( 'Stretch', 'elementor' ),
					'top' => __( 'Top', 'elementor' ),
					'middle' => __( 'Middle', 'elementor' ),
					'bottom' => __( 'Bottom', 'elementor' ),
				],
				'tab' => self::TAB_LAYOUT,
				'prefix_class' => 'elementor-section-items-',
				'condition' => [
					'height' => [ 'full', 'min-height' ],
				],
				'section' => 'section_layout',
				'hide_in_inner' => true,
			]
		);

		$this->add_control(
			'content_position',
			[
				'label' => __( 'Content Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'' => __( 'Default', 'elementor' ),
					'top' => __( 'Top', 'elementor' ),
					'middle' => __( 'Middle', 'elementor' ),
					'bottom' => __( 'Bottom', 'elementor' ),
				],
				'tab' => self::TAB_LAYOUT,
				'prefix_class' => 'elementor-section-content-',
				'condition' => [
					'height' => [ 'full', 'min-height' ],
					'column_position' => 'stretch',
				],
				'section' => 'section_layout',
				'hide_in_inner' => true,
			]
		);

		$this->add_control(
			'height_inner',
			[
				'label' => __( 'Height', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => [
					'default' => __( 'Default', 'elementor' ),
					'min-height' => __( 'Min Height', 'elementor' ),
				],
				'tab' => self::TAB_LAYOUT,
				'prefix_class' => 'elementor-section-height-',
				'section' => 'section_layout',
				'hide_in_top' => true,
			]
		);

		$this->add_control(
			'custom_height_inner',
			[
				'label' => __( 'Minimum Height', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 400,
				],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 1440,
					],
				],
				'tab' => self::TAB_LAYOUT,
				'selectors' => [
					'{{WRAPPER}} > .elementor-container' => 'min-height: {{SIZE}}{{UNIT}};',
				],
				'condition' => [
					'height_inner' => [ 'min-height' ],
				],
				'section' => 'section_layout',
				'hide_in_top' => true,
			]
		);

		$this->add_control(
			'column_position_inner',
			[
				'label' => __( 'Column Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'middle',
				'options' => [
					'stretch' => __( 'Stretch', 'elementor' ),
					'top' => __( 'Top', 'elementor' ),
					'middle' => __( 'Middle', 'elementor' ),
					'bottom' => __( 'Bottom', 'elementor' ),
				],
				'tab' => self::TAB_LAYOUT,
				'prefix_class' => 'elementor-section-items-',
				'condition' => [
					'height_inner' => [ 'full', 'min-height' ],
				],
				'section' => 'section_layout',
				'hide_in_top' => true,
			]
		);

		$this->add_control(
			'content_position_inner',
			[
				'label' => __( 'Content Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'' => __( 'Default', 'elementor' ),
					'top' => __( 'Top', 'elementor' ),
					'middle' => __( 'Middle', 'elementor' ),
					'bottom' => __( 'Bottom', 'elementor' ),
				],
				'tab' => self::TAB_LAYOUT,
				'prefix_class' => 'elementor-section-content-',
				'condition' => [
					'height_inner' => [ 'full', 'min-height' ],
					'column_position_inner' => 'stretch',
				],
				'section' => 'section_layout',
				'hide_in_top' => true,
			]
		);

		$this->add_control(
			'structure',
			[
				'label' => __( 'Structure', 'elementor' ),
				'type' => Controls_Manager::STRUCTURE,
				'default' => '10',
				'tab' => self::TAB_LAYOUT,
				'section' => 'section_layout',
			]
		);

		// Section background
		$this->add_control(
			'section_background',
			[
				'label' => __( 'Background', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background',
				'tab' => self::TAB_STYLE,
				'types' => [ 'classic', 'video' ],
				'section' => 'section_background',
			]
		);

		$this->add_control(
			'background_overlay_title',
			[
				'label' => __( 'Background Overlay', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'tab' => self::TAB_STYLE,
				'section' => 'section_background',
				'separator' => 'before',
				'condition' => [
					'background_background' => [ 'classic', 'video' ],
				],
			]
		);

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => 'background_overlay',
				'tab' => self::TAB_STYLE,
				'section' => 'section_background',
				'selector' => '{{WRAPPER}} > .elementor-background-overlay',
				'condition' => [
					'background_background' => [ 'classic', 'video' ],
				],
			]
		);

		$this->add_control(
			'background_overlay_opacity',
			[
				'label' => __( 'Opacity (%)', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => .5,
				],
				'range' => [
					'px' => [
						'max' => 1,
						'step' => 0.01,
					],
				],
				'tab' => self::TAB_STYLE,
				'section' => 'section_background',
				'selectors' => [
					'{{WRAPPER}} > .elementor-background-overlay' => 'opacity: {{SIZE}};',
				],
				'condition' => [
					'background_overlay_background' => [ 'classic' ],
				],
			]
		);

		// Section border
		$this->add_control(
			'section_border',
			[
				'label' => __( 'Border', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'border',
				'tab' => self::TAB_STYLE,
				'section' => 'section_border',
			]
		);

		$this->add_control(
			'border_radius',
			[
				'label' => __( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'tab' => self::TAB_STYLE,
				'section' => 'section_border',
				'selectors' => [
					'{{WRAPPER}}, {{WRAPPER}} > .elementor-background-overlay' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => 'box_shadow',
				'section' => 'section_border',
				'tab' => self::TAB_STYLE,
			]
		);

		// Section Typography
		$this->add_control(
			'section_typo',
			[
				'label' => __( 'Typography', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'color_text',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} > .elementor-container' => 'color: {{VALUE}};',
				],
				'tab' => self::TAB_STYLE,
				'section' => 'section_typo',
			]
		);

		$this->add_control(
			'heading_color',
			[
				'label' => __( 'Heading Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} > .elementor-container .elementor-heading-title' => 'color: {{VALUE}};',
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
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} > .elementor-container a' => 'color: {{VALUE}};',
				],
				'tab' => self::TAB_STYLE,
				'section' => 'section_typo',
			]
		);

		$this->add_control(
			'color_link_hover',
			[
				'label' => __( 'Link Hover Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} > .elementor-container a:hover' => 'color: {{VALUE}};',
				],
				'tab' => self::TAB_STYLE,
				'section' => 'section_typo',
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
					'{{WRAPPER}} > .elementor-container' => 'text-align: {{VALUE}};',
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
				'allowed_dimensions' => 'vertical',
				'placeholder' => [
					'top' => '',
					'right' => 'auto',
					'bottom' => '',
					'left' => 'auto',
				],
				'selectors' => [
					'{{WRAPPER}}' => 'margin-top: {{TOP}}{{UNIT}}; margin-bottom: {{BOTTOM}}{{UNIT}};',
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
					'{{WRAPPER}}' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
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
			'_section_responsive',
			[
				'label' => __( 'Responsive', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_ADVANCED,
			]
		);

		$this->add_control(
			'responsive_description',
			[
				'raw' => __( 'Attention: The display settings (show/hide for mobile, tablet or desktop) will only take effect once you are on the preview or live page, and not while you\'re in editing mode in Elementor.', 'elementor' ),
				'type' => Controls_Manager::RAW_HTML,
				'tab' => self::TAB_ADVANCED,
				'section' => '_section_responsive',
				'classes' => 'elementor-control-descriptor',
			]
		);

		$this->add_control(
			'hide_desktop',
			[
				'label' => __( 'Hide On Desktop', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'tab' => self::TAB_ADVANCED,
				'section' => '_section_responsive',
				'default' => '',
				'prefix_class' => 'elementor-',
				'options' => [
					'' => __( 'Show', 'elementor' ),
					'hidden-desktop' => __( 'Hide', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'hide_tablet',
			[
				'label' => __( 'Hide On Tablet', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'tab' => self::TAB_ADVANCED,
				'section' => '_section_responsive',
				'default' => '',
				'prefix_class' => 'elementor-',
				'options' => [
					'' => __( 'Show', 'elementor' ),
					'hidden-tablet' => __( 'Hide', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'hide_mobile',
			[
				'label' => __( 'Hide On Mobile', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'tab' => self::TAB_ADVANCED,
				'section' => '_section_responsive',
				'default' => '',
				'prefix_class' => 'elementor-',
				'options' => [
					'' => __( 'Show', 'elementor' ),
					'hidden-phone' => __( 'Hide', 'elementor' ),
				],
			]
		);
	}

	protected function render_settings() {
		?>
		<div class="elementor-element-overlay"></div>
		<?php
	}

	protected function content_template() {
		?>
		<% if ( 'video' === settings.background_background ) {
			var videoLink = settings.background_video_link;

			if ( videoLink ) {
				var videoID = elementor.helpers.getYoutubeIDFromURL( settings.background_video_link ); %>

				<div class="elementor-background-video-container elementor-hidden-phone">
					<% if ( videoID ) { %>
						<div class="elementor-background-video" data-video-id="<%= videoID %>"></div>
					<% } else { %>
						<video class="elementor-background-video" src="<%= videoLink %>" autoplay loop muted></video>
					<% } %>
				</div>
			<% }

			if ( settings.background_video_fallback ) { %>
				<div class="elementor-background-video-fallback" style="background-image: url(<%- settings.background_video_fallback.url %>)"></div>
			<% }
		}

		if ( 'classic' === settings.background_overlay_background ) { %>
			<div class="elementor-background-overlay"></div>
		<% } %>
		<div class="elementor-container elementor-column-gap-<%- settings.gap %>">
			<div class="elementor-row"></div>
		</div>
		<?php
	}

	public function before_render( $instance, $element_id, $element_data = [] ) {
		$section_type = ! empty( $element_data['isInner'] ) ? 'inner' : 'top';

		$this->add_render_attribute( 'wrapper', 'class', [
			'elementor-section',
			'elementor-element',
			'elementor-element-' . $element_id,
			'elementor-' . $section_type . '-section',
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
		<section <?php echo $this->get_render_attribute_string( 'wrapper' ); ?>>
			<?php
			if ( 'video' === $instance['background_background'] ) :
				if ( $instance['background_video_link'] ) :
					$video_id = Utils::get_youtube_id_from_url( $instance['background_video_link'] );
					?>
					<div class="elementor-background-video-container elementor-hidden-phone">
						<?php if ( $video_id ) : ?>
							<div class="elementor-background-video" data-video-id="<?php echo $video_id; ?>"></div>
						<?php else : ?>
							<video class="elementor-background-video elementor-html5-video" src="<?php echo $instance['background_video_link'] ?>" autoplay loop muted></video>
						<?php endif; ?>
					</div>
				<?php endif;
			endif;

			if ( 'classic' === $instance['background_overlay_background'] ) : ?>
				<div class="elementor-background-overlay"></div>
			<?php endif; ?>
			<div class="elementor-container elementor-column-gap-<?php echo esc_attr( $instance['gap'] ); ?>">
				<div class="elementor-row">
		<?php
	}

	public function after_render( $instance, $element_id, $element_data = [] ) {
		?>
				</div>
			</div>
		</section>
		<?php
	}
}
