<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Video extends Widget_Base {

	public function get_name() {
		return 'video';
	}

	public function get_title() {
		return __( 'Video', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-youtube';
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'section_video',
			[
				'label' => __( 'Video', 'elementor' ),
			]
		);

		$this->add_control(
			'video_type',
			[
				'label' => __( 'Video Type', 'elementor' ),
				'type' => Controls_Manager::SELECT,
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
				'frontend_available' => true,
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
				'separator' => 'before',
			]
		);

		// YouTube
		$this->add_control(
			'yt_autoplay',
			[
				'label' => __( 'Autoplay', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __( 'No', 'elementor' ),
				'label_on' => __( 'Yes', 'elementor' ),
				'condition' => [
					'video_type' => 'youtube',
				],
			]
		);

		$this->add_control(
			'yt_rel',
			[
				'label' => __( 'Suggested Videos', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __( 'Hide', 'elementor' ),
				'label_on' => __( 'Show', 'elementor' ),
				'condition' => [
					'video_type' => 'youtube',
				],
			]
		);

		$this->add_control(
			'yt_controls',
			[
				'label' => __( 'Player Control', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __( 'Hide', 'elementor' ),
				'label_on' => __( 'Show', 'elementor' ),
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
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __( 'Hide', 'elementor' ),
				'label_on' => __( 'Show', 'elementor' ),
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
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __( 'No', 'elementor' ),
				'label_on' => __( 'Yes', 'elementor' ),
				'condition' => [
					'video_type' => 'vimeo',
				],
			]
		);

		$this->add_control(
			'vimeo_loop',
			[
				'label' => __( 'Loop', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __( 'No', 'elementor' ),
				'label_on' => __( 'Yes', 'elementor' ),
				'condition' => [
					'video_type' => 'vimeo',
				],
			]
		);

		$this->add_control(
			'vimeo_title',
			[
				'label' => __( 'Intro Title', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __( 'Hide', 'elementor' ),
				'label_on' => __( 'Show', 'elementor' ),
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
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __( 'Hide', 'elementor' ),
				'label_on' => __( 'Show', 'elementor' ),
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
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __( 'Hide', 'elementor' ),
				'label_on' => __( 'Show', 'elementor' ),
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
				'default' => 'youtube',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_image_overlay',
			[
				'label' => __( 'Image Overlay', 'elementor' ),
			]
		);

		$this->add_control(
			'show_image_overlay',
			[
				'label' => __( 'Image Overlay', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __( 'Hide', 'elementor' ),
				'label_on' => __( 'Show', 'elementor' ),
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
				'condition' => [
					'show_image_overlay' => 'yes',
					'image_overlay[url]!' => '',
				],
			]
		);

		$this->add_control(
			'lightbox',
			[
				'label' => __( 'Lightbox', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'frontend_available' => true,
				'label_off' => __( 'Off', 'elementor' ),
				'label_on' => __( 'On', 'elementor' ),
				'condition' => [
					'show_image_overlay' => 'yes',
					'image_overlay[url]!' => '',
				],
				'separator' => 'before',
			]
		);

		$this->add_control(
			'lightbox_color',
			[
				'label' => __( 'Background Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'#elementor-video-modal-{{ID}}' => 'background-color: {{VALUE}};',
				],
				'condition' => [
					'show_image_overlay' => 'yes',
					'image_overlay[url]!' => '',
					'lightbox' => 'yes',
				],
			]
		);

		$this->add_control(
			'lightbox_content_width',
			[
				'label' => __( 'Content Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'units' => [ '%' ],
				'default' => [
					'unit' => '%',
				],
				'range' => [
					'%' => [
						'min' => 50,
					],
				],
				'selectors' => [
					'(desktop+)#elementor-video-modal-{{ID}} .dialog-widget-content' => 'width: {{SIZE}}{{UNIT}};',
				],
				'condition' => [
					'show_image_overlay' => 'yes',
					'image_overlay[url]!' => '',
					'lightbox' => 'yes',
				],
			]
		);

		$this->add_control(
			'lightbox_content_position',
			[
				'label' => __( 'Content Position', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'center center',
				'frontend_available' => true,
				'options' => [
					'center center' => __( 'Center', 'elementor' ),
					'center top' => __( 'Top', 'elementor' ),
				],
				'condition' => [
					'show_image_overlay' => 'yes',
					'image_overlay[url]!' => '',
					'lightbox' => 'yes',
				],
				'render_type' => 'none',
			]
		);

		$this->add_control(
			'lightbox_content_animation',
			[
				'label' => __( 'Entrance Animation', 'elementor' ),
				'type' => Controls_Manager::ANIMATION,
				'default' => '',
				'frontend_available' => true,
				'label_block' => true,
				'condition' => [
					'show_image_overlay' => 'yes',
					'image_overlay[url]!' => '',
					'lightbox' => 'yes',
				],
				'render_type' => 'none',
			]
		);

		$this->end_controls_section();
	}

	protected function render() {
		$settings = $this->get_active_settings();

		$video_link = 'youtube' === $settings['video_type'] ? $settings['link'] : $settings['vimeo_link'];

		if ( empty( $video_link ) )
			return;

		$video_html = Embed::get_embed_html( $video_link, $this->get_embed_params() );

		if ( ! $video_html ) {
			echo $video_link;

			return;
		}

		$this->add_render_attribute( 'video-wrapper', 'class', 'elementor-wrapper' );

		if ( ! $settings['lightbox'] ) {
			$this->add_render_attribute( 'video-wrapper', 'class', 'elementor-video-wrapper' );
		}

		$this->add_render_attribute( 'video-wrapper', 'class', 'elementor-open-' . ( $settings['lightbox'] ? 'lightbox' : 'inline' ) );
		?>
		<div <?php echo $this->get_render_attribute_string( 'video-wrapper' ); ?>>
			<?php
			echo $video_html;

			if ( $this->has_image_overlay() ) {
				$this->add_render_attribute( 'image-overlay', 'class', 'elementor-custom-embed-image-overlay' );

				if ( ! $settings['lightbox'] ) {
					$this->add_render_attribute( 'image-overlay', 'style', 'background-image: url(' . $settings['image_overlay']['url'] . ');' );
				}
				?>
				<div <?php echo $this->get_render_attribute_string( 'image-overlay' ); ?>>
					<?php if ( $settings['lightbox'] ) : ?>
						<img src="<?php echo $settings['image_overlay']['url']; ?>">
					<?php endif; ?>
					<?php if ( 'yes' === $settings['show_play_icon'] ) : ?>
						<div class="elementor-custom-embed-play">
							<i class="fa"></i>
						</div>
					<?php endif; ?>
				</div>
			<?php } ?>
		</div>
	<?php
	}

	public function render_plain_content() {
		$settings = $this->get_active_settings();

		echo 'youtube' === $settings['video_type'] ? $settings['link'] : $settings['vimeo_link'];
	}

	public function get_embed_params() {
		$settings = $this->get_settings();

		$params = [];

		if ( 'youtube' === $settings['video_type'] ) {
			$youtube_options = [ 'autoplay', 'rel', 'controls', 'showinfo' ];

			foreach ( $youtube_options as $option ) {
				if ( 'autoplay' === $option && $this->has_image_overlay() )
					continue;

				$value = ( 'yes' === $settings[ 'yt_' . $option ] ) ? '1' : '0';
				$params[ $option ] = $value;
			}

			$params['wmode'] = 'opaque';
		}

		if ( 'vimeo' === $settings['video_type'] ) {
			$vimeo_options = [ 'autoplay', 'loop', 'title', 'portrait', 'byline' ];

			foreach ( $vimeo_options as $option ) {
				if ( 'autoplay' === $option && $this->has_image_overlay() )
					continue;

				$value = ( 'yes' === $settings[ 'vimeo_' . $option ] ) ? '1' : '0';
				$params[ $option ] = $value;
			}

			$params['color'] = str_replace( '#', '', $settings['vimeo_color'] );
		}

		return $params;
	}

	protected function get_hosted_params() {
		$settings = $this->get_settings();

		$params = [];

		$params['src'] = $settings['hosted_link'];

		$hosted_options = [ 'autoplay', 'loop' ];

		foreach ( $hosted_options as $key => $option ) {
			$value = ( 'yes' === $settings[ 'hosted_' . $option ] ) ? '1' : '0';
			$params[ $option ] = $value;
		}

		if ( ! empty( $settings['hosted_width'] ) ) {
			$params['width'] = $settings['hosted_width'];
		}

		if ( ! empty( $settings['hosted_height'] ) ) {
			$params['height'] = $settings['hosted_height'];
		}
		return $params;
	}

	protected function has_image_overlay() {
		$settings = $this->get_settings();

		return ! empty( $settings['image_overlay']['url'] ) && 'yes' === $settings['show_image_overlay'];
	}

	public function get_script_depends() {
		return [
			'elementor-dialog'
		];
	}
}
