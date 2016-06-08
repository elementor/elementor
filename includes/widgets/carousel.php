<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Carousel extends Widget_Base {

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
			'slides_to_show',
			[
				'label' => __( 'Slides to show', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => '3',
				'section' => 'section_image',
			]
		);

		$this->add_control(
			'slides_to_scroll',
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
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['carousel'] ) )
			return;

		?>
		<div class="elementor-carousel-wrapper">
			<div class="elementor-carousel" data-autoplay="<?php echo $instance['autoplay']; ?>" data-slide-to-show="<?php echo $instance['slides_to_show']; ?>" data-slide-to-scroll="<?php echo $instance['slides_to_scroll']; ?>">
				<?php
				$slides = '';
				$ids = explode( ',', $instance['carousel'] );

				foreach ( $ids as $attach_id ) :
					$image = wp_get_attachment_image_src( $attach_id, $instance['thumbnail_size'] );
					$slides .= '<div><img src="' . $image[0] . '" /></div>';
				endforeach;

				echo $slides; ?>
			</div>
		</div>
	<?php
	}

	protected function content_template() {}
}
