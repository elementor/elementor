<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Slideshow_Gallery extends Widget_Base {
	private $_slideshow_options = [];

	public function get_id() {
		return 'slideshow-gallery';
	}

	public function get_title() {
		return __( 'Slideshow Gallery', 'elementor' );
	}

	public function get_icon() {
		return 'slideshow';
	}

	protected function _register_controls() {
		$this->_slideshow_options = [ 'autoplaySpeed', 'autoplay', 'dots', 'arrows', 'infinite', 'pauseOnHover', 'speed', 'fade' ];

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
			'slideshow',
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
				'label' => __( 'Autoplay Speed (ms)', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => 3000,
				'section' => 'section_image',
			]
		);

		$this->add_control(
			'speed',
			[
				'label' => __( 'Animation Speed (ms)', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => 300,
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

		$this->add_control(
			'fade',
			[
				'label' => __( 'Effects', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'false',
				'section' => 'section_image',
				'options' => [
					'false' => __( 'Slide', 'elementor' ),
					'true' => __( 'Fade', 'elementor' ),
				],
			]
		);
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['slideshow'] ) ) {
			return;
		}

		foreach ( $this->_slideshow_options as $option_name ) {
			$this->add_render_attribute( 'data', 'data-' . $option_name , $instance[ $option_name ] );
		}

		$slides = [];
		foreach ( $instance['slideshow'] as $attachment ) {
			$image = Group_Control_Image_size::get_attachment_image_src( $attachment['id'], 'thumbnail', $instance );
			if ( ! empty( $image ) ) {
				$slides[] = '<div><img src="' . $image . '" alt="slideshow" /></div>';
			}
		}

		if ( empty( $slides ) ) {
			return;
		}
		?>
		<div class="elementor-slideshow-wrapper">
			<div class="elementor-slideshow" <?php echo $this->get_render_attribute_string( 'data' ); ?> data-rtl="<?php echo is_rtl(); ?>">
				<?php echo implode( '', $slides ); ?>
			</div>
		</div>
	<?php
	}

	protected function content_template() {}
}
