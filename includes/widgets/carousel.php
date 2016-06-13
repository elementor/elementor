<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Carousel extends Widget_Base {
	private $_carusel_options = [];

	public function get_id() {
		return 'carousel';
	}

	public function get_title() {
		return __( 'Carousel', 'elementor' );
	}

	public function get_icon() {
		return 'insert-image';
	}

	protected function _register_controls() {
		$this->_carusel_options = [ 'slidesToShow', 'slidesToScroll', 'autoplaySpeed', 'autoplay', 'dots', 'arrows', 'infinite', 'pauseOnHover' ];

		$this->add_control(
			'section_image',
			[
				'label' => __( 'Image', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
				'section' => 'section_image',
			]
		);

		$this->add_control(
			'carousel',
			[
				'label' => __( 'Choose Image', 'elementor' ),
				'type' => Controls_Manager::GALLERY,
				'default' => [],
				'section' => 'section_image',
			]
		);

		$this->add_group_control(
			Group_Control_Image_size::get_type(),
			[
				'name' => 'thumbnail',
			]
		);

		$this->add_control(
			'slidesToShow',
			[
				'label' => __( 'Slides to show', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => '3',
				'section' => 'section_image',
			]
		);

		$this->add_control(
			'slidesToScroll',
			[
				'label' => __( 'Slides to scroll', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => '3',
				'section' => 'section_image',
			]
		);

		$this->add_control(
			'autoplay',
			[
				'label' => __( 'Autoplay', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
				'section' => 'section_image',
				'options' => [
					'true' => __( 'Yes', 'elementor' ),
					'false' => __( 'No', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'autoplaySpeed',
			[
				'label' => __( 'Autoplay Speed', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => 3000,
				'section' => 'section_image',
			]
		);

		$this->add_control(
			'dots',
			[
				'label' => __( 'Dots', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'false',
				'section' => 'section_image',
				'options' => [
					'true' => __( 'Yes', 'elementor' ),
					'false' => __( 'No', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'arrows',
			[
				'label' => __( 'Arrows', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
				'section' => 'section_image',
				'options' => [
					'true' => __( 'Yes', 'elementor' ),
					'false' => __( 'No', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'infinite',
			[
				'label' => __( 'Infinite Loop', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
				'section' => 'section_image',
				'options' => [
					'true' => __( 'Yes', 'elementor' ),
					'false' => __( 'No', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'pauseOnHover',
			[
				'label' => __( 'Pause On Hover', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
				'section' => 'section_image',
				'options' => [
					'true' => __( 'Yes', 'elementor' ),
					'false' => __( 'No', 'elementor' ),
				],
			]
		);
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['carousel'] ) )
			return;

		foreach ( $this->_carusel_options as $option_name ) {
			$this->add_render_attribute( 'data', 'data-' . $option_name , $instance[ $option_name ] );
		}
		?>
		<div class="elementor-carousel-wrapper">
			<div class="elementor-carousel" <?php echo $this->get_render_attribute_string( 'data' ); ?> data-rtl="<?php echo is_rtl(); ?>">
				<?php
				$slides = '';
				$attachment_ids = explode( ',', $instance['carousel'] );

				foreach ( $attachment_ids as $attachment_id ) :
					$image = wp_get_attachment_image_src( $attachment_id, $instance['thumbnail_size'] );
					$slides .= '<div><img src="' . $image[0] . '" /></div>';
				endforeach;

				echo $slides; ?>
			</div>
		</div>
	<?php
	}

	protected function content_template() {}
}
