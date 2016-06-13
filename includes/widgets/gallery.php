<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Gallery extends Widget_Base {

	public function get_id() {
		return 'gallery';
	}

	public function get_title() {
		return __( 'Gallery', 'elementor' );
	}

	public function get_icon() {
		return 'photo-library';
	}

	private function _get_image_sizes() {
		$wp_image_sizes = get_intermediate_image_sizes();

		$image_sizes = [];
		foreach ( $wp_image_sizes as $image_size ) {
			$image_sizes[ $image_size ] = ucwords( str_replace( '_', ' ', $image_size ) );
		}

		return $image_sizes;
	}

	protected function _register_controls() {
		$this->add_control(
			'section_gallery_name',
			[
				'label' => __( 'Image Gallery', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
				'section' => 'section_gallery_name',
			]
		);

		$this->add_control(
			'wp_gallery',
			[
				'label' => __( 'Add Images', 'elementor' ),
				'type' => Controls_Manager::GALLERY,
				'section' => 'section_gallery_name',
			]
		);

		$this->add_control(
			'gallery_link',
			[
				'label' => __( 'Link to', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'file',
				'section' => 'section_gallery_name',
				'options' => [
					'attachment' => __( 'Attachment Page', 'elementor' ),
					'file' => __( 'Media File', 'elementor' ),
					'none' => __( 'None', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'gallery_rand',
			[
				'label' => __( 'Random', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_gallery_name',
				'default' => 'no',
				'options' => [
					'no' => __( 'No', 'elementor' ),
					'rand' => __( 'Yes', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'gallery_size',
			[
				'label' => __( 'Size', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'thumbnail',
				'section' => 'section_gallery_name',
				'options' => $this->_get_image_sizes(),
			]
		);

		$this->add_control(
			'section_gallery_images',
			[
				'label' => __( 'Images', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'gallery_columns',
			[
				'label' => __( 'Columns', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 3,
				'options' => array_combine( range( 1, 9 ),range( 1, 9 ) ),
				'section' => 'section_gallery_images',
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'columns_padding',
			[
				'label' => __( 'Columns Padding', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 10,
				],
				'range' => [
					'px' => [
						'max' => 50,
					],
				],
				'section' => 'section_gallery_images',
				'tab' => self::TAB_STYLE,
				'selectors' => [
					'{{WRAPPER}} .gallery-item' => 'padding: 0 {{SIZE}}{{UNIT}} {{SIZE}}{{UNIT}} 0;',
				],
			]
		);

		$this->add_control(
			'section_border',
			[
				'label' => __( 'Border', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
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
					'{{WRAPPER}} img' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'section_caption',
			[
				'label' => __( 'Caption', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'align',
			[
				'label' => __( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'tab' => self::TAB_STYLE,
				'section' => 'section_caption',
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
				'default' => 'center',
				'selectors' => [
					'{{WRAPPER}} .gallery-item .gallery-caption' => 'text-align: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'text_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'section' => 'section_caption',
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .gallery-item .gallery-caption' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'typography',
				'label' => __( 'Typography', 'elementor' ),
				'scheme' => Scheme_Typography::TYPOGRAPHY_4,
				'tab' => self::TAB_STYLE,
				'section' => 'section_caption',
				'selector' => '{{WRAPPER}} .gallery-item .gallery-caption',
			]
		);
	}

	protected function render( $instance = [] ) {
		$shortcode = '';
		if ( '' !== $instance['wp_gallery'] ) {
			$this->add_render_attribute( 'shortcode', 'ids', $instance['wp_gallery'] );

			if ( '' !== $instance['gallery_columns'] ) {
				$this->add_render_attribute( 'shortcode', 'columns', $instance['gallery_columns'] );
			}

			if ( '' !== $instance['gallery_size'] ) {
				$this->add_render_attribute( 'shortcode', 'size', $instance['gallery_size'] );
			}

			if ( '' !== $instance['gallery_link'] ) {
				$this->add_render_attribute( 'shortcode', 'link', $instance['gallery_link'] );
			}

			if ( 'no' !== $instance['gallery_rand'] ) {
				$this->add_render_attribute( 'shortcode', 'orderby', $instance['gallery_rand'] );
			}

			$shortcode .= '[gallery ' . $this->get_render_attribute_string( 'shortcode' ) . ']';
		}
		?>
		<?php if ( ! empty( $shortcode ) ) : ?>
			<div class="elementor-wp-gallery">
				<?php echo do_shortcode( $shortcode ); ?>
			</div>
		<?php endif;
	}

	protected function content_template() {}
}
