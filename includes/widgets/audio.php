<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Audio extends Widget_Base {
	protected $_current_instance = [];

	public function get_id() {
		return 'audio';
	}

	public function get_title() {
		return __( 'SoundCloud', 'elementor' );
	}

	public function get_icon() {
		return 'headphones';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_audio',
			[
				'label' => __( 'SoundCloud', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'link',
			[
				'label' => __( 'Link', 'elementor' ),
				'type' => Controls_Manager::URL,
				'default' => [
					'url' => 'https://soundcloud.com/shchxango/john-coltrane-1963-my-favorite',
				],
				'show_external' => false,
				'section' => 'section_audio',
			]
		);

		$this->add_control(
			'visual',
			[
				'label' => __( 'Visual Player', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'no',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				],
				'section' => 'section_audio',
			]
		);

		$this->add_control(
			'section_sc_options',
			[
				'label' => __( 'Additional Options', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'section' => 'section_audio',
				'separator' => 'before',
			]
		);

		$this->add_control(
			'sc_auto_play',
			[
				'label' => __( 'Autoplay', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'no',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				],
				'section' => 'section_audio',
			]
		);

		$this->add_control(
			'sc_buying',
			[
				'label' => __( 'Buy Button', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'show',
				'options' => [
					'show' => __( 'Show', 'elementor' ),
					'hide' => __( 'Hide', 'elementor' ),
				],
				'section' => 'section_audio',
			]
		);

		$this->add_control(
			'sc_liking',
			[
				'label' => __( 'Like Button', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'show',
				'options' => [
					'show' => __( 'Show', 'elementor' ),
					'hide' => __( 'Hide', 'elementor' ),
				],
				'section' => 'section_audio',
			]
		);

		$this->add_control(
			'sc_download',
			[
				'label' => __( 'Download Button', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'show',
				'options' => [
					'show' => __( 'Show', 'elementor' ),
					'hide' => __( 'Hide', 'elementor' ),
				],
				'section' => 'section_audio',
			]
		);

		$this->add_control(
			'sc_sharing',
			[
				'label' => __( 'Share Button', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'show',
				'options' => [
					'show' => __( 'Show', 'elementor' ),
					'hide' => __( 'Hide', 'elementor' ),
				],
				'section' => 'section_audio',
			]
		);

		$this->add_control(
			'sc_show_comments',
			[
				'label' => __( 'Comments', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'show',
				'options' => [
					'show' => __( 'Show', 'elementor' ),
					'hide' => __( 'Hide', 'elementor' ),
				],
				'section' => 'section_audio',
			]
		);

		$this->add_control(
			'sc_show_playcount',
			[
				'label' => __( 'Play Counts', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'show',
				'options' => [
					'show' => __( 'Show', 'elementor' ),
					'hide' => __( 'Hide', 'elementor' ),
				],
				'section' => 'section_audio',
			]
		);

		$this->add_control(
			'sc_show_user',
			[
				'label' => __( 'Username', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'show',
				'options' => [
					'show' => __( 'Show', 'elementor' ),
					'hide' => __( 'Hide', 'elementor' ),
				],
				'section' => 'section_audio',
			]
		);

		$this->add_control(
			'sc_color',
			[
				'label' => __( 'Controls Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'section' => 'section_audio',
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'soundcloud',
				'section' => 'section_audio',
			]
		);
	}

	protected function render( $instance = [] ) {
		if ( empty( $instance['link'] ) )
			return;

		$this->_current_instance = $instance;

		add_filter( 'oembed_result', [ $this, 'filter_oembed_result' ], 50, 3 );
		$video_html = wp_oembed_get( $instance['link']['url'], wp_embed_defaults() );
		remove_filter( 'oembed_result', [ $this, 'filter_oembed_result' ], 50 );

		if ( $video_html ) : ?>
			<div class="elementor-soundcloud-wrapper">
				<?php echo $video_html; ?>
			</div>
		<?php endif;
	}

	public function filter_oembed_result( $html ) {
		$params = [
			'auto_play' => 'yes' === $this->_current_instance['sc_auto_play'] ? 'true' : 'false',
			'buying' => 'show' === $this->_current_instance['sc_buying'] ? 'true' : 'false',
			'liking' => 'show' === $this->_current_instance['sc_liking'] ? 'true' : 'false',
			'download' => 'show' === $this->_current_instance['sc_download'] ? 'true' : 'false',
			'sharing' => 'show' === $this->_current_instance['sc_sharing'] ? 'true' : 'false',
			'show_comments' => 'show' === $this->_current_instance['sc_show_comments'] ? 'true' : 'false',
			'show_playcount' => 'show' === $this->_current_instance['sc_show_playcount'] ? 'true' : 'false',
			'show_user' => 'show' === $this->_current_instance['sc_show_user'] ? 'true' : 'false',
			'color' => str_replace( '#', '', $this->_current_instance['sc_color'] ),
		];

		$visual = 'yes' === $this->_current_instance['visual'] ? 'true' : 'false';

		preg_match( '/<iframe.*src=\"(.*)\".*><\/iframe>/isU', $html, $matches );
		$url = esc_url( add_query_arg( $params, $matches[1] ) );

		$html = str_replace( $matches[1], $url, $html );
		$html = str_replace( 'visual=true', 'visual=' . $visual, $html );

		if ( 'false' === $visual ) {
			$html = str_replace( 'height="400"', 'height="200"', $html );
		}

		return $html;
	}

	protected function content_template() {}
}
