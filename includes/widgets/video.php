<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Video extends Widget_Base {

	protected $_current_instance = [];

	public function get_id() {
		return 'video';
	}

	public function get_title() {
		return __( 'Video', 'elementor' );
	}

	public function get_icon() {
		return 'youtube';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_video',
			[
				'label' => __( 'Video', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'video_type',
			[
				'label' => __( 'Video Type', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_video',
				'default' => 'youtube',
				'options' => [
					'youtube' => __( 'YouTube', 'elementor' ),
					'vimeo' => __( 'Vimeo', 'elementor' ),
					//'hosted' => __( 'HTML5 Video', 'elementor' ),
				],
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
				'condition' => [
					'video_type' => 'youtube',
				],
			]
		);

		$this->add_control(
			'vimeo_link',
			[
				'label' => __( 'Vimeo Link', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'section' => 'section_video',
				'placeholder' => __( 'Enter your Vimeo link', 'elementor' ),
				'default' => 'https://vimeo.com/170933924',
				'label_block' => true,
				'condition' => [
					'video_type' => 'vimeo',
				],
			]
		);

		$this->add_control(
			'hosted_link',
			[
				'label' => __( 'Link', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'section' => 'section_video',
				'placeholder' => __( 'Enter your video link', 'elementor' ),
				'default' => '',
				'label_block' => true,
				'condition' => [
					'video_type' => 'hosted',
				],
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
				'label' => __( 'Video Options', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'section' => 'section_video',
				'separator' => 'before',
			]
		);

		// YouTube
		$this->add_control(
			'yt_autoplay',
			[
				'label' => __( 'Autoplay', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_video',
				'options' => [
					'no' => __( 'No', 'elementor' ),
					'yes' => __( 'Yes', 'elementor' ),
				],
				'condition' => [
					'video_type' => 'youtube',
				],
				'default' => 'no',
			]
		);

		$this->add_control(
			'yt_rel',
			[
				'label' => __( 'Suggested Videos', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_video',
				'options' => [
					'no' => __( 'Hide', 'elementor' ),
					'yes' => __( 'Show', 'elementor' ),
				],
				'default' => 'no',
				'condition' => [
					'video_type' => 'youtube',
				],
			]
		);

		$this->add_control(
			'yt_controls',
			[
				'label' => __( 'Player Control', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_video',
				'options' => [
					'yes' => __( 'Show', 'elementor' ),
					'no' => __( 'Hide', 'elementor' ),
				],
				'default' => 'yes',
				'condition' => [
					'video_type' => 'youtube',
				],
			]
		);

		$this->add_control(
			'yt_showinfo',
			[
				'label' => __( 'Player Title & Actions', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_video',
				'options' => [
					'yes' => __( 'Show', 'elementor' ),
					'no' => __( 'Hide', 'elementor' ),
				],
				'default' => 'yes',
				'condition' => [
					'video_type' => 'youtube',
				],
			]
		);

		// Vimeo
		$this->add_control(
			'vimeo_autoplay',
			[
				'label' => __( 'Autoplay', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_video',
				'options' => [
					'no' => __( 'No', 'elementor' ),
					'yes' => __( 'Yes', 'elementor' ),
				],
				'default' => 'no',
				'condition' => [
					'video_type' => 'vimeo',
				],
			]
		);

		$this->add_control(
			'vimeo_loop',
			[
				'label' => __( 'Loop', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_video',
				'options' => [
					'no' => __( 'No', 'elementor' ),
					'yes' => __( 'Yes', 'elementor' ),
				],
				'default' => 'no',
				'condition' => [
					'video_type' => 'vimeo',
				],
			]
		);

		$this->add_control(
			'vimeo_title',
			[
				'label' => __( 'Intro Title', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_video',
				'options' => [
					'yes' => __( 'Show', 'elementor' ),
					'no' => __( 'Hide', 'elementor' ),
				],
				'default' => 'yes',
				'condition' => [
					'video_type' => 'vimeo',
				],
			]
		);

		$this->add_control(
			'vimeo_portrait',
			[
				'label' => __( 'Intro Portrait', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_video',
				'options' => [
					'yes' => __( 'Show', 'elementor' ),
					'no' => __( 'Hide', 'elementor' ),
				],
				'default' => 'yes',
				'condition' => [
					'video_type' => 'vimeo',
				],
			]
		);

		$this->add_control(
			'vimeo_byline',
			[
				'label' => __( 'Intro Byline', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_video',
				'options' => [
					'yes' => __( 'Show', 'elementor' ),
					'no' => __( 'Hide', 'elementor' ),
				],
				'default' => 'yes',
				'condition' => [
					'video_type' => 'vimeo',
				],
			]
		);

		$this->add_control(
			'vimeo_color',
			[
				'label' => __( 'Controls Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'section' => 'section_video',
				'default' => '',
				'condition' => [
					'video_type' => 'vimeo',
				],
			]
		);

		// Self Hosted
		//$this->add_control(
		//	'hosted_width',
		//	[
		//		'label' => __( 'Width', 'elementor' ),
		//		'type' => Controls_Manager::NUMBER,
		//		'section' => 'section_video',
		//		'default' => '640',
		//		'condition' => [
		//			'video_type' => 'hosted',
		//		],
		//	]
		//);
		//
		//$this->add_control(
		//	'hosted_height',
		//	[
		//		'label' => __( 'Height', 'elementor' ),
		//		'type' => Controls_Manager::NUMBER,
		//		'section' => 'section_video',
		//		'default' => '360',
		//		'condition' => [
		//			'video_type' => 'hosted',
		//		],
		//	]
		//);
		//
		//$this->add_control(
		//	'hosted_autoplay',
		//	[
		//		'label' => __( 'Autoplay', 'elementor' ),
		//		'type' => Controls_Manager::SELECT,
		//		'section' => 'section_video',
		//		'options' => [
		//			'no' => __( 'No', 'elementor' ),
		//			'yes' => __( 'Yes', 'elementor' ),
		//		],
		//		'default' => 'no',
		//		'condition' => [
		//			'video_type' => 'hosted',
		//		],
		//	]
		//);
		//
		//$this->add_control(
		//	'hosted_loop',
		//	[
		//		'label' => __( 'Loop', 'elementor' ),
		//		'type' => Controls_Manager::SELECT,
		//		'section' => 'section_video',
		//		'options' => [
		//			'no' => __( 'No', 'elementor' ),
		//			'yes' => __( 'Yes', 'elementor' ),
		//		],
		//		'default' => 'no',
		//		'condition' => [
		//			'video_type' => 'hosted',
		//		],
		//	]
		//);

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
		$this->_current_instance = $instance;

		if ( 'hosted' !== $instance['video_type'] ) {
			add_filter( 'oembed_result', [ $this, 'filter_oembed_result' ], 50, 3 );

			$video_link = 'youtube' === $instance['video_type'] ? $instance['link'] : $instance['vimeo_link'];

			if ( empty( $video_link ) )
				return;

			$video_html = wp_oembed_get( $video_link, wp_embed_defaults() );

			remove_filter( 'oembed_result', [ $this, 'filter_oembed_result' ], 50 );
		} else {
			$video_html = wp_video_shortcode( $this->get_hosted_params() );
		}

		if ( $video_html ) : ?>
			<div class="elementor-video-wrapper">
				<?php
				echo $video_html;

				if ( $this->has_image_overlay() ) : ?>
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
	}

	public function filter_oembed_result( $html, $url, $args ) {
		$params = [];

		if ( 'youtube' === $this->_current_instance['video_type'] ) {
			$youtube_options = [ 'autoplay', 'rel', 'controls', 'showinfo' ];

			foreach ( $youtube_options as $option ) {
				if ( 'autoplay' === $option && $this->has_image_overlay() )
					continue;

				$value = ( 'yes' === $this->_current_instance[ 'yt_' . $option ] ) ? '1' : '0';
				$params[ $option ] = $value;
			}

			$params['wmode'] = 'opaque';
		}

		if ( 'vimeo' === $this->_current_instance['video_type'] ) {
			$vimeo_options = [ 'autoplay', 'loop', 'title', 'portrait', 'byline' ];

			foreach ( $vimeo_options as $option ) {
				if ( 'autoplay' === $option && $this->has_image_overlay() )
					continue;

				$value = ( 'yes' === $this->_current_instance[ 'vimeo_' . $option ] ) ? '1' : '0';
				$params[ $option ] = $value;
			}

			$params['color'] = str_replace( '#', '', $this->_current_instance['vimeo_color'] );
		}

		if ( ! empty( $params ) ) {
			preg_match( '/<iframe.*src=\"(.*)\".*><\/iframe>/isU', $html, $matches );
			$url = esc_url( add_query_arg( $params, $matches[1] ) );

			$html = str_replace( $matches[1], $url, $html );
		}

		return $html;
	}

	protected function get_hosted_params() {
		$params = [];
		$params['src'] = $this->_current_instance['hosted_link'];
		$hosted_options = [ 'autoplay', 'loop' ];

		foreach ( $hosted_options as $key => $option ) {
			$value = ( 'yes' === $this->_current_instance[ 'hosted_' . $option ] ) ? '1' : '0';
			$params[ $option ] = $value;
		}

		if ( ! empty( $this->_current_instance['hosted_width'] ) ) {
			$params['width'] = $this->_current_instance['hosted_width'];
		}

		if ( ! empty( $this->_current_instance['hosted_height'] ) ) {
			$params['height'] = $this->_current_instance['hosted_height'];
		}
		return $params;
	}

	protected function has_image_overlay() {
		return ! empty( $this->_current_instance['image_overlay']['url'] ) && 'yes' === $this->_current_instance['show_image_overlay'];
	}

	protected function content_template() {}
}
