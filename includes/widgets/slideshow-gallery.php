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
		$this->_slideshow_options = [ 'autoplaySpeed', 'autoplay', 'dots', 'arrows', 'rtl', 'pauseOnHover', 'speed', 'fade', 'stretch' ];

		$this->add_control(
			'section_image',
			[
				'label' => __( 'Slideshow Gallery', 'elementor' ),
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
				'label' => __( 'Add Images', 'elementor' ),
				'type' => Controls_Manager::GALLERY,
				'default' => [],
				'section' => 'section_image',
			]
		);

		$this->add_group_control(
			Group_Control_Image_size::get_type(),
			[
				'name' => 'full',
				'section' => 'section_image',
			]
		);

		$this->add_control(
			'fade',
			[
				'label' => __( 'Effect', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'false',
				'section' => 'section_image',
				'options' => [
					'false' => __( 'Slide', 'elementor' ),
					'true' => __( 'Fade', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'stretch',
			[
				'label' => __( 'Stretch Image', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'no',
				'section' => 'section_image',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'section_additional_options',
			[
				'label' => __( 'Additional Options', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'arrows',
			[
				'label' => __( 'Arrows', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
				'section' => 'section_additional_options',
				'options' => [
					'true' => __( 'Show', 'elementor' ),
					'false' => __( 'Hide', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'dots',
			[
				'label' => __( 'Dots', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
				'section' => 'section_additional_options',
				'options' => [
					'true' => __( 'Show', 'elementor' ),
					'false' => __( 'Hide', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'pauseOnHover',
			[
				'label' => __( 'Pause On Hover', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
				'section' => 'section_additional_options',
				'options' => [
					'true' => __( 'Yes', 'elementor' ),
					'false' => __( 'No', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'autoplay',
			[
				'label' => __( 'Auto Play', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
				'section' => 'section_additional_options',
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
				'default' => 5000,
				'section' => 'section_additional_options',
			]
		);

		$this->add_control(
			'speed',
			[
				'label' => __( 'Animation Speed (ms)', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => 500,
				'section' => 'section_additional_options',
			]
		);

		$this->add_control(
			'rtl',
			[
				'label' => __( 'Direction', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'false',
				'section' => 'section_additional_options',
				'options' => [
					'false' => __( 'Left to Right', 'elementor' ),
					'true' => __( 'Right to Left', 'elementor' ),
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
			$image = Group_Control_Image_size::get_attachment_image_src( $attachment['id'], 'full', $instance );
			if ( ! empty( $image ) ) {
				$stretch = 'yes' === $instance['stretch'] ? 'class="elementor-slideshow-stretch"' : '';
				$slides[] = '<div><img ' . $stretch . ' src="' . $image . '" alt="slideshow" /></div>';
			}
		}

		if ( empty( $slides ) ) {
			return;
		}
		?>
		<div class="elementor-slideshow-wrapper"<?php if ( 'true' === $instance['rtl'] ) echo ' dir="rtl"'; ?>>
			<div class="elementor-slideshow" <?php echo $this->get_render_attribute_string( 'data' ); ?>>
				<?php echo implode( '', $slides ); ?>
			</div>
		</div>
	<?php
	}

	protected function content_template() {}
}
