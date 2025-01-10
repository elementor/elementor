<?php
namespace Elementor;

use Elementor\Core\Kits\Documents\Tabs\Global_Typography;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor image gallery widget.
 *
 * Elementor widget that displays a set of images in an aligned grid.
 *
 * @since 1.0.0
 */
class Widget_Image_Gallery extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve image gallery widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'image-gallery';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve image gallery widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return esc_html__( 'Basic Gallery', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve image gallery widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-gallery-grid';
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
		return array( 'image', 'photo', 'visual', 'gallery' );
	}

	protected function is_dynamic_content(): bool {
		return false;
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
		return array( 'widget-image-gallery' );
	}

	/**
	 * Get widget upsale data.
	 *
	 * Retrieve the widget promotion data.
	 *
	 * @since 3.18.0
	 * @access protected
	 *
	 * @return array Widget promotion data.
	 */
	protected function get_upsale_data() {
		return array(
			'condition' => ! Utils::has_pro(),
			'image' => esc_url( ELEMENTOR_ASSETS_URL . 'images/go-pro.svg' ),
			'image_alt' => esc_attr__( 'Upgrade', 'elementor' ),
			'description' => esc_html__( 'Use interesting masonry layouts and other overlay features with Elementor\'s Pro Gallery widget.', 'elementor' ),
			'upgrade_url' => esc_url( 'https://go.elementor.com/go-pro-basic-gallery-widget/' ),
			'upgrade_text' => esc_html__( 'Upgrade Now', 'elementor' ),
		);
	}

	public function has_widget_inner_wrapper(): bool {
		return ! Plugin::$instance->experiments->is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register image gallery widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 3.1.0
	 * @access protected
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'section_gallery',
			array(
				'label' => esc_html__( 'Basic Gallery', 'elementor' ),
			)
		);

		$this->add_control(
			'wp_gallery',
			array(
				'label' => esc_html__( 'Add Images', 'elementor' ),
				'type' => Controls_Manager::GALLERY,
				'show_label' => false,
				'dynamic' => array(
					'active' => true,
				),
			)
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			array(
				'name' => 'thumbnail', // Usage: `{name}_size` and `{name}_custom_dimension`, in this case `thumbnail_size` and `thumbnail_custom_dimension`.
				'exclude' => array( 'custom' ),
			)
		);

		$gallery_columns = range( 1, 10 );
		$gallery_columns = array_combine( $gallery_columns, $gallery_columns );

		$this->add_control(
			'gallery_columns',
			array(
				'label' => esc_html__( 'Columns', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 4,
				'options' => $gallery_columns,
			)
		);

		$this->add_control(
			'gallery_display_caption',
			array(
				'label' => esc_html__( 'Caption', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => array(
					'none' => esc_html__( 'None', 'elementor' ),
					'' => esc_html__( 'Attachment Caption', 'elementor' ),
				),
				'selectors' => array(
					'{{WRAPPER}} .gallery-item .gallery-caption' => 'display: {{VALUE}};',
				),
			)
		);

		$this->add_control(
			'gallery_link',
			array(
				'label' => esc_html__( 'Link', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'file',
				'options' => array(
					'file' => esc_html__( 'Media File', 'elementor' ),
					'attachment' => esc_html__( 'Attachment Page', 'elementor' ),
					'none' => esc_html__( 'None', 'elementor' ),
				),
			)
		);

		$this->add_control(
			'open_lightbox',
			array(
				'label' => esc_html__( 'Lightbox', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'description' => sprintf(
					/* translators: 1: Link open tag, 2: Link close tag. */
					esc_html__( 'Manage your site’s lightbox settings in the %1$sLightbox panel%2$s.', 'elementor' ),
					'<a href="javascript: $e.run( \'panel/global/open\' ).then( () => $e.route( \'panel/global/settings-lightbox\' ) )">',
					'</a>'
				),
				'default' => 'default',
				'options' => array(
					'default' => esc_html__( 'Default', 'elementor' ),
					'yes' => esc_html__( 'Yes', 'elementor' ),
					'no' => esc_html__( 'No', 'elementor' ),
				),
				'condition' => array(
					'gallery_link' => 'file',
				),
				'assets' => array(
					'styles' => array(
						array(
							'name' => 'e-swiper',
							'conditions' => array(
								'terms' => array(
									array(
										'name' => 'gallery_link',
										'operator' => '===',
										'value' => 'file',
									),
									array(
										'name' => 'open_lightbox',
										'operator' => '!==',
										'value' => 'no',
									),
								),
							),
						),
					),
					'scripts' => array(
						array(
							'name' => 'swiper',
							'conditions' => array(
								'terms' => array(
									array(
										'name' => 'gallery_link',
										'operator' => '===',
										'value' => 'file',
									),
									array(
										'name' => 'open_lightbox',
										'operator' => '!==',
										'value' => 'no',
									),
								),
							),
						),
					),
				),
			)
		);

		$this->add_control(
			'gallery_rand',
			array(
				'label' => esc_html__( 'Order By', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => array(
					'' => esc_html__( 'Default', 'elementor' ),
					'rand' => esc_html__( 'Random', 'elementor' ),
				),
				'default' => '',
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_gallery_images',
			array(
				'label' => esc_html__( 'Images', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'image_spacing',
			array(
				'label' => esc_html__( 'Gap', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => array(
					'' => esc_html__( 'Default', 'elementor' ),
					'custom' => esc_html__( 'Custom', 'elementor' ),
				),
				'prefix_class' => 'gallery-spacing-',
				'default' => '',
			)
		);

		$columns_margin = is_rtl() ? '0 0 -{{SIZE}}{{UNIT}} -{{SIZE}}{{UNIT}};' : '0 -{{SIZE}}{{UNIT}} -{{SIZE}}{{UNIT}} 0;';
		$columns_padding = is_rtl() ? '0 0 {{SIZE}}{{UNIT}} {{SIZE}}{{UNIT}};' : '0 {{SIZE}}{{UNIT}} {{SIZE}}{{UNIT}} 0;';

		$this->add_control(
			'image_spacing_custom',
			array(
				'label' => esc_html__( 'Custom Gap', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range' => array(
					'px' => array(
						'max' => 100,
					),
					'em' => array(
						'max' => 10,
					),
					'rem' => array(
						'max' => 10,
					),
				),
				'default' => array(
					'size' => 15,
				),
				'selectors' => array(
					'{{WRAPPER}} .gallery-item' => 'padding:' . $columns_padding,
					'{{WRAPPER}} .gallery' => 'margin: ' . $columns_margin,
				),
				'condition' => array(
					'image_spacing' => 'custom',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name' => 'image_border',
				'selector' => '{{WRAPPER}} .gallery-item img',
				'separator' => 'before',
			)
		);

		$this->add_responsive_control(
			'image_border_radius',
			array(
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors' => array(
					'{{WRAPPER}} .gallery-item img' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				),
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_caption',
			array(
				'label' => esc_html__( 'Caption', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'gallery_display_caption' => '',
				),
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
				'default' => 'center',
				'selectors' => array(
					'{{WRAPPER}} .gallery-item .gallery-caption' => 'text-align: {{VALUE}};',
				),
				'condition' => array(
					'gallery_display_caption' => '',
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
					'{{WRAPPER}} .gallery-item .gallery-caption' => 'color: {{VALUE}};',
				),
				'condition' => array(
					'gallery_display_caption' => '',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name' => 'typography',
				'global' => array(
					'default' => Global_Typography::TYPOGRAPHY_ACCENT,
				),
				'selector' => '{{WRAPPER}} .gallery-item .gallery-caption',
				'condition' => array(
					'gallery_display_caption' => '',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			array(
				'name' => 'caption_shadow',
				'selector' => '{{WRAPPER}} .gallery-item .gallery-caption',
				'condition' => array(
					'gallery_display_caption' => '',
				),
			)
		);

		$this->add_responsive_control(
			'caption_space',
			array(
				'label' => esc_html__( 'Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'selectors' => array(
					'{{WRAPPER}} .gallery-item .gallery-caption' => 'margin-block-start: {{SIZE}}{{UNIT}};',
				),
				'condition' => array(
					'gallery_display_caption' => '',
				),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render image gallery widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();

		if ( ! $settings['wp_gallery'] ) {
			return;
		}

		$ids = wp_list_pluck( $settings['wp_gallery'], 'id' );

		$this->add_render_attribute( 'shortcode', 'ids', implode( ',', $ids ) );
		$this->add_render_attribute( 'shortcode', 'size', $settings['thumbnail_size'] );

		if ( $settings['gallery_columns'] ) {
			$this->add_render_attribute( 'shortcode', 'columns', $settings['gallery_columns'] );
		}

		if ( $settings['gallery_link'] ) {
			$this->add_render_attribute( 'shortcode', 'link', $settings['gallery_link'] );
		}

		if ( ! empty( $settings['gallery_rand'] ) ) {
			$this->add_render_attribute( 'shortcode', 'orderby', $settings['gallery_rand'] );
		}
		?>
		<div class="elementor-image-gallery">
			<?php
			add_filter( 'wp_get_attachment_link', array( $this, 'add_lightbox_data_to_image_link' ), 10, 2 );

			echo do_shortcode( '[gallery ' . $this->get_render_attribute_string( 'shortcode' ) . ']' );

			remove_filter( 'wp_get_attachment_link', array( $this, 'add_lightbox_data_to_image_link' ) );
			?>
		</div>
		<?php
	}
}
