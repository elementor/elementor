<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Soundcloud extends Widget_Base {
	protected $_current_instance = [];

	public function get_id() {
		return 'soundcloud';
	}

	public function get_title() {
		return __( 'Soundcloud', 'elementor' );
	}

	public function get_icon() {
		return 'coding';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_title',
			[
				'label' => __( 'Soundcloud', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'link',
			[
				'label' => '',
				'type' => Controls_Manager::URL,
				'default' => '',
				'section' => 'section_title',
			]
		);

		$this->add_control(
			'section_sc_options',
			[
				'label' => __( 'Additional Options', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'section' => 'section_sc_options',
			]
		);

		$this->add_control(
			'visual',
			[
				'label' => __( 'Visual Widget', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'no',
				'section' => 'section_sc_options',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				]
			]
		);

		$this->add_control(
			'auto_play',
			[
				'label' => __( 'Autoplay', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'no',
				'section' => 'section_sc_options',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				]
			]
		);

		$this->add_control(
			'show_comments',
			[
				'label' => __( 'Show Comments', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'no',
				'section' => 'section_sc_options',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				]
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

	public function filter_oembed_result( $html, $url, $args ) {
		$params = [];

		$params['url'] = $this->_current_instance['link']['url'];
		$params['auto_play'] = 'yes' === $this->_current_instance['auto_play'] ? 'true' : 'false';
		$params['show_comments'] = 'yes' === $this->_current_instance['show_comments'] ? 'true' : 'false';
		$params['color'] = str_replace( '#', '', $this->_current_instance['color'] );

		if ( ! empty( $params ) ) {
			preg_match( '/<iframe.*src=\"(.*)\".*><\/iframe>/isU', $html, $matches );
			$url = esc_url( add_query_arg( $params, $matches[1] ) );

			$html = str_replace( $matches[1], $url, $html );

			$visual = 'yes' === $this->_current_instance['visual'] ? 'true' : 'false';
			$html = str_replace( 'visual=true', 'visual=' . $visual, $html );
		}

		return $html;
	}

	protected function content_template() {}
}
