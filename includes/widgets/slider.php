<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Slider extends Widget_Base {
	private $_slider_options = [];

	public function get_id() {
		return 'slider';
	}

	public function get_title() {
		return __( 'Slider', 'elementor' );
	}

	public function get_categories() {
		return [ 'basic' ];
	}

	public function get_icon() {
		return 'insert-image';
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
		$this->_slider_options = [
			'arrows' => [
				'label' => __( 'Arrows', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
			],
			'dots' => [
				'label' => __( 'Navagations Dots', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
			],
			'autoplay' => [
				'label' => __( 'Auto Play', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
			],
			'autoplaySpeed' => [
				'label' => __( 'Auto Play Speed', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => '3000',
			],
			'pauseOnHover' => [
				'label' => __( 'Pause On Hover', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'true',
			],
			'rtl' => [
				'label' => __( 'Right To Left', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'false',
			],
		];

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
			'slider',
			[
				'label' => __( 'Choose Image', 'elementor' ),
				'type' => Controls_Manager::GALLERY,
				'default' => [],
				'section' => 'section_image',
			]
		);

		$this->add_control(
			'size',
			[
				'label' => __( 'Size', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'thumbnail',
				'section' => 'section_image',
				'options' => $this->_get_image_sizes(),
			]
		);

		foreach ( $this->_slider_options as $option_name => $option_value ) {
			$this->add_control(
				$option_name,
				[
					'label' => $option_value['label'],
					'type' => $option_value['type'],
					'default' => $option_value['default'],
					'section' => 'section_image',
					'options' => [
						'true' => __( 'Yes', 'elementor' ),
						'false' => __( 'No', 'elementor' ),
					],
				]
			);
		}
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['slider'] ) ) {
			return;
		}

		foreach ( $this->_slider_options as $option_name => $option_value ) {
			$this->add_render_attribute( 'data', 'data-' . $option_name , $instance[ $option_name ] );
		}
		?>

		<div class="elementor-slider-wrapper">
			<div class="elementor-slider" <?php echo $this->get_render_attribute_string( 'data' ); ?>>
				<?php
				$slides = '';
				$ids = explode( ',', $instance['slider'] );

				foreach ( $ids as $attach_id ) :
					$image = wp_get_attachment_image_src( $attach_id, $instance['size'] );
					$slides .= '<div><img src="' . $image[0] . '" /></div>';
				endforeach;

				echo $slides; ?>
			</div>
		</div>
	<?php
	}

	protected function content_template() {}
}
