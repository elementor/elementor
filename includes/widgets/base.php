<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Widget_Base extends Element_Base {

	public static function get_name() {
		return 'widget';
	}

	public static function get_type() {
		return 'widget';
	}

	public function get_icon() {
		return 'apps';
	}

	public static function get_short_title() {
		return static::get_title();
	}

	public final function print_template() {
		ob_start();

		static::_content_template();

		$content_template = ob_get_clean();

		if ( empty( $content_template ) ) {
			return;
		}
		?>
		<script type="text/html" id="tmpl-elementor-<?php echo static::get_type(); ?>-<?php echo esc_attr( static::get_name() ); ?>-content">
			<?php self::_render_settings(); ?>
			<div class="elementor-widget-container">
				<?php echo $content_template; ?>
			</div>
		</script>
		<?php
	}

	protected function _render_settings() {
		?>
		<div class="elementor-editor-element-settings elementor-editor-<?php echo esc_attr( self::get_type() ); ?>-settings elementor-editor-<?php echo esc_attr( self::get_name() ); ?>-settings">
			<ul class="elementor-editor-element-settings-list">
				<li class="elementor-editor-element-setting elementor-editor-element-edit">
					<a href="#" title="<?php _e( 'Edit', 'elementor' ); ?>">
						<span class="elementor-screen-only"><?php _e( 'Edit', 'elementor' ); ?></span>
						<i class="fa fa-pencil"></i>
					</a>
				</li>
				<li class="elementor-editor-element-setting elementor-editor-element-duplicate">
					<a href="#" title="<?php _e( 'Duplicate', 'elementor' ); ?>">
						<span class="elementor-screen-only"><?php _e( 'Duplicate', 'elementor' ); ?></span>
						<i class="fa fa-files-o"></i>
					</a>
				</li>
				<li class="elementor-editor-element-setting elementor-editor-element-remove">
					<a href="#" title="<?php _e( 'Remove', 'elementor' ); ?>">
						<span class="elementor-screen-only"><?php _e( 'Remove', 'elementor' ); ?></span>
						<i class="fa fa-times"></i>
					</a>
				</li>
			</ul>
		</div>
		<?php
	}

	protected static function _after_register_controls() {
		parent::_after_register_controls();

		self::add_control(
			'_section_style',
			[
				'label' => __( 'Element Style', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

	    self::add_responsive_control(
	        '_margin',
	        [
	            'label' => __( 'Margin', 'elementor' ),
	            'type' => Controls_Manager::DIMENSIONS,
		        'size_units' => [ 'px', '%' ],
	            'tab' => Controls_Manager::TAB_ADVANCED,
	            'section' => '_section_style',
	            'selectors' => [
	                '{{WRAPPER}} .elementor-widget-container' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
	            ],
	        ]
	    );

	    self::add_responsive_control(
	        '_padding',
	        [
	            'label' => __( 'Padding', 'elementor' ),
	            'type' => Controls_Manager::DIMENSIONS,
		        'size_units' => [ 'px', 'em', '%' ],
	            'tab' => Controls_Manager::TAB_ADVANCED,
	            'section' => '_section_style',
	            'selectors' => [
	                '{{WRAPPER}} .elementor-widget-container' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
	            ],
	        ]
	    );

		self::add_control(
			'_animation',
			[
				'label' => __( 'Entrance Animation', 'elementor' ),
				'type' => Controls_Manager::ANIMATION,
				'default' => '',
				'prefix_class' => 'animated ',
				'tab' => Controls_Manager::TAB_ADVANCED,
				'label_block' => true,
				'section' => '_section_style',
			]
		);

		self::add_control(
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
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_style',
				'condition' => [
					'_animation!' => '',
				],
			]
		);

		self::add_control(
			'_css_classes',
			[
				'label' => __( 'CSS Classes', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_style',
				'default' => '',
				'prefix_class' => '',
				'label_block' => true,
				'title' => __( 'Add your custom class WITHOUT the dot. e.g: my-class', 'elementor' ),
			]
		);

		self::add_control(
			'_section_background',
			[
				'label' => __( 'Background & Border', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		self::add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => '_background',
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_background',
				'selector' => '{{WRAPPER}} .elementor-widget-container',
			]
		);

		self::add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => '_border',
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_background',
				'selector' => '{{WRAPPER}} .elementor-widget-container',
			]
		);

		self::add_control(
			'_border_radius',
			[
				'label' => __( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_background',
				'selectors' => [
					'{{WRAPPER}} .elementor-widget-container' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		self::add_group_control(
			Group_Control_Box_Shadow::get_type(),
			[
				'name' => '_box_shadow',
				'section' => '_section_background',
				'tab' => Controls_Manager::TAB_ADVANCED,
				'selector' => '{{WRAPPER}} .elementor-widget-container',
			]
		);

		self::add_control(
			'_section_responsive',
			[
				'label' => __( 'Responsive', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => Controls_Manager::TAB_ADVANCED,
			]
		);

		self::add_control(
			'responsive_description',
			[
				'raw' => __( 'Attention: The display settings (show/hide for mobile, tablet or desktop) will only take effect once you are on the preview or live page, and not while you\'re in editing mode in Elementor.', 'elementor' ),
				'type' => Controls_Manager::RAW_HTML,
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_responsive',
				'classes' => 'elementor-control-descriptor',
			]
		);

		self::add_control(
			'hide_desktop',
			[
				'label' => __( 'Hide On Desktop', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_responsive',
				'default' => '',
				'prefix_class' => 'elementor-',
				'options' => [
					'' => __( 'Show', 'elementor' ),
					'hidden-desktop' => __( 'Hide', 'elementor' ),
				],
			]
		);

		self::add_control(
			'hide_tablet',
			[
				'label' => __( 'Hide On Tablet', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'tab' => Controls_Manager::TAB_ADVANCED,
				'section' => '_section_responsive',
				'default' => '',
				'prefix_class' => 'elementor-',
				'options' => [
					'' => __( 'Show', 'elementor' ),
					'hidden-tablet' => __( 'Hide', 'elementor' ),
				],
			]
		);

		self::add_control(
			'hide_mobile',
			[
				'label' => __( 'Hide On Mobile', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'tab' => Controls_Manager::TAB_ADVANCED,
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

	protected function parse_text_editor( $content ) {
		$content = apply_filters( 'widget_text', $content, $this );

		$content = shortcode_unautop( $content );
		$content = do_shortcode( $content );

		if ( $GLOBALS['wp_embed'] instanceof \WP_Embed ) {
			$content = $GLOBALS['wp_embed']->autoembed( $content );
		}

		return $content;
	}

	public function render_content() {
		if ( Plugin::instance()->editor->is_edit_mode() ) {
			self::_render_settings();
		}
		?>
		<div class="elementor-widget-container">
			<?php
			$this->render();
			?>
		</div>
		<?php
	}

	public function render_plain_content() {
		$this->render_content();
	}

	public function before_render() {
		$this->add_render_attribute( 'wrapper', 'class', [
			'elementor-widget',
			'elementor-element',
			'elementor-element-' . $this->get_id(),
			'elementor-widget-' . $this->get_name(),
		] );

		$settings = $this->get_settings();

		foreach ( self::get_class_controls() as $control ) {
			if ( empty( $settings[ $control['name'] ] ) )
				continue;

			if ( ! $this->is_control_visible( $control ) )
				continue;

			$this->add_render_attribute( 'wrapper', 'class', $control['prefix_class'] . $settings[ $control['name'] ] );
		}

		if ( ! empty( $settings['_animation'] ) ) {
			$this->add_render_attribute( 'wrapper', 'data-animation', $settings['_animation'] );
		}

		$this->add_render_attribute( 'wrapper', 'data-element_type', static::get_name() );
		?>
		<div <?php echo $this->get_render_attribute_string( 'wrapper' ); ?>>
		<?php
	}

	public function after_render() {
		?>
		</div>
		<?php
	}

	public function print_element() {
		$this->before_render();
		$this->render_content();
		$this->after_render();
	}

	public function get_raw_data( $with_html_content = false ) {
		$data = parent::get_raw_data( $with_html_content );

		unset( $data['isInner'] );

		$data['widgetType'] = $this->get_data( 'widgetType' );

		if ( $with_html_content ) {
			ob_start();

			$this->render_content();

			$data['htmlCache'] = ob_get_clean();
		}

		return $data;
	}

	protected function get_default_data() {
		$data = parent::get_default_data();

		$data['widgetType'] = '';

		return $data;
	}

	protected function _get_child_class( array $element_data ) {
		return Element_Section::get_class_name();
	}
}
