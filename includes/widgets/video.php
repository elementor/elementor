<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Video extends Widget_Base {

	protected $_current_instance = [];

	public function get_id() {
		return 'video';
	}

	public function get_title() {
		return __( 'YouTube', 'elementor' );
	}

	public function get_icon() {
		return 'youtube';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_video',
			[
				'label' => __( 'YouTube', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'link',
			[
				'label' => __( 'Link', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'section' => 'section_video',
	            'placeholder' => __( 'Enter your YouTube link', 'elementor' ),
	            'default' => 'https://www.youtube.com/watch?v=9uOETcuFjbE',
	            'label_block' => true,
			]
		);

		$this->add_control(
			'aspect_ratio',
			[
				'label' => __( 'Aspect Ratio', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_video',
	            'options' => [
					'169' => '16:9',
					'43' => '4:3',
					'32' => '3:2',
	            ],
	            'default' => '169',
				'prefix_class' => 'elementor-aspect-ratio-',
			]
		);

		$this->add_control(
			'heading_youtube',
			[
				'label' => __( 'YouTube Options', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'section' => 'section_video',
			]
		);

		$this->add_control(
			'yt_autoplay',
			[
				'label' => __( 'Auto Play', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_video',
				'options' => [
					'no' => __( 'No', 'elementor' ),
					'yes' => __( 'Yes', 'elementor' ),
				],
				'default' => 'no',
			]
		);

		$this->add_control(
			'yt_rel_videos',
			[
				'label' => __( 'Suggested Videos', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_video',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				],
				'default' => 'yes',
			]
		);

		$this->add_control(
			'yt_controls',
			[
				'label' => __( 'Player Control', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_video',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				],
				'default' => 'yes',
			]
		);

		$this->add_control(
			'yt_showinfo',
			[
				'label' => __( 'Player Title & Actions', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_video',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				],
				'default' => 'yes',
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'section' => 'section_video',
				'default' => 'youtube',
			]
		);

		$this->add_control(
			'section_image_overlay',
			[
				'label' => __( 'Image Overlay', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'show_image_overlay',
			[
				'label' => __( 'Image Overlay', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'no',
				'options' => [
					'no' => __( 'Hide', 'elementor' ),
					'yes' => __( 'Show', 'elementor' ),
				],
				'section' => 'section_image_overlay',
			]
		);

		$this->add_control(
			'image_overlay',
			[
				'label' => __( 'Image', 'elementor' ),
				'type' => Controls_Manager::MEDIA,
				'default' => [
					'url' => Utils::get_placeholder_image_src(),
				],
				'section' => 'section_image_overlay',
				'condition' => [
					'show_image_overlay' => 'yes',
				],
			]
		);

		$this->add_control(
			'show_play_icon',
			[
				'label' => __( 'Play Icon', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'yes',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				],
				'section' => 'section_image_overlay',
				'condition' => [
					'show_image_overlay' => 'yes',
					'image_overlay[url]!' => '',
				],
			]
		);
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['link'] ) )
			return;

		$this->_current_instance = $instance;

		add_filter( 'oembed_result', [ $this, 'filter_oembed_result' ], 50, 3 );

		$video_embed = wp_oembed_get( $instance['link'], wp_embed_defaults() );

		if ( $video_embed ) : ?>
			<div class="elementor-video-wrapper">
				<?php
				echo $video_embed;

				if ( ! empty( $this->_current_instance['image_overlay']['url'] )  && 'yes' === $this->_current_instance['show_image_overlay'] ) : ?>
					<div class="elementor-custom-embed-image-overlay" style="background-image: url(<?php echo $this->_current_instance['image_overlay']['url']; ?>);">
						<?php if ( 'yes' === $this->_current_instance['show_play_icon'] ) : ?>
							<div class="elementor-custom-embed-play">
								<i class="fa fa-play-circle"></i>
							</div>
						<?php endif; ?>
					</div>
				<?php endif; ?>
			</div>
		<?php else :
			echo $instance['link'];
		endif;

		remove_filter( 'oembed_result', [ $this, 'filter_oembed_result' ], 50 );
	}

	public function filter_oembed_result( $html, $url, $args ) {
		$youtube_params = [];

		if ( 'yes' === $this->_current_instance['yt_autoplay'] )
			$youtube_params[] = 'autoplay=1';

		if ( 'no' === $this->_current_instance['yt_rel_videos'] )
			$youtube_params[] = 'rel=0';

		if ( 'no' === $this->_current_instance['yt_controls'] )
			$youtube_params[] = 'controls=0';

		if ( 'no' === $this->_current_instance['yt_showinfo'] )
			$youtube_params[] = 'showinfo=0';

		// TODO: Check if is youtube link
		$youtube_params[] = 'wmode=opaque';

		if ( ! empty( $youtube_params ) ) {
			$separator = '&amp;';
			$html = str_replace( '?feature=oembed', '?feature=oembed' . $separator . implode( $separator, $youtube_params ), $html );
		}

		return $html;
	}

	protected function content_template() {}
}
