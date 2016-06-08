<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Widget_Base extends Element_Base {

	public function get_type() {
		return 'widget';
	}

	public function get_icon() {
		return 'font';
	}

	public function get_short_title() {
		return $this->get_title();
	}

	protected function _after_register_controls() {
		parent::_after_register_controls();

		$this->add_control(
			'_section_style',
			[
				'label' => __( 'Element Style', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_ADVANCED,
			]
		);

	    $this->add_control(
	        '_margin',
	        [
	            'label' => __( 'Margin', 'elementor' ),
	            'type' => Controls_Manager::DIMENSIONS,
		        'size_units' => [ 'px', '%' ],
	            'tab' => self::TAB_ADVANCED,
	            'section' => '_section_style',
	            'selectors' => [
	                '{{WRAPPER}} .elementor-widget-container' => 'margin: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
	            ],
	        ]
	    );

	    $this->add_control(
	        '_padding',
	        [
	            'label' => __( 'Padding', 'elementor' ),
	            'type' => Controls_Manager::DIMENSIONS,
		        'size_units' => [ 'px', 'em', '%' ],
	            'tab' => self::TAB_ADVANCED,
	            'section' => '_section_style',
	            'selectors' => [
	                '{{WRAPPER}} .elementor-widget-container' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
	            ],
	        ]
	    );

		$this->add_group_control(
			Group_Control_Background::get_type(),
			[
				'name' => '_background',
				'tab' => self::TAB_ADVANCED,
				'section' => '_section_style',
				'selector' => '{{WRAPPER}} .elementor-widget-container',
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => '_border',
				'tab' => self::TAB_ADVANCED,
				'section' => '_section_style',
				'selector' => '{{WRAPPER}} .elementor-widget-container',
			]
		);

		$this->add_control(
			'_border_radius',
			[
				'label' => __( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'tab' => self::TAB_ADVANCED,
				'section' => '_section_style',
				'selectors' => [
					'{{WRAPPER}} .elementor-widget-container' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'_css_classes',
			[
				'label' => __( 'CSS Classes', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'tab' => self::TAB_ADVANCED,
				'section' => '_section_style',
				'default' => '',
				'prefix_class' => '',
				'title' => __( 'Add your custom class WITHOUT the dot. e.g: my-class', 'elementor' ),
			]
		);

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

	final public function print_template() {
		ob_start();
		$this->content_template();
		$content_template = ob_get_clean();

		if ( empty( $content_template ) ) {
			return;
		}
		?>
		<script type="text/html" id="tmpl-elementor-<?php echo $this->get_type(); ?>-<?php echo esc_attr( $this->get_id() ); ?>-content">
			<?php $this->render_settings(); ?>
			<div class="elementor-widget-container">
				<?php echo $content_template; ?>
			</div>
		</script>
		<?php
	}

	public function render_content( $instance ) {
		if ( Plugin::instance()->editor->is_edit_mode() ) {
			$this->render_settings();
		}
		?>
		<div class="elementor-widget-container">
			<?php
			$this->render( $instance );
			?>
		</div>
		<?php
	}

	public function render_plain_content( $instance = [] ) {
		$this->render_content( $instance );
	}

	protected function render_settings() {
		?>
		<div class="elementor-element-overlay">
			<div class="elementor-element-label"><?php echo $this->get_short_title(); ?></div>
			<div class="elementor-editor-element-settings elementor-editor-<?php echo esc_attr( $this->get_type() ); ?>-settings elementor-editor-<?php echo esc_attr( $this->get_id() ); ?>-settings">
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
		</div>
		<?php
	}

	public function before_render( $instance, $element_id, $element_data = [] ) {
		$wrapper_classes = [
			'elementor-widget',
			'elementor-element',
			'elementor-element-' . $element_id,
			'elementor-widget-' . $this->get_id(),
		];

		foreach ( $this->get_class_controls() as $control ) {
			if ( empty( $instance[ $control['name'] ] ) )
				continue;

			if ( ! $this->is_control_visible( $instance, $control ) )
				continue;

			$wrapper_classes[] = $control['prefix_class'] . $instance[ $control['name'] ];
		}
		?>
		<div class="<?php echo esc_attr( implode( ' ', $wrapper_classes ) ); ?>" data-element_type="<?php echo $this->get_id(); ?>">
		<?php
	}

	public function after_render( $instance, $element_id, $element_data = [] ) {
		?>
		</div>
		<?php
	}
}
