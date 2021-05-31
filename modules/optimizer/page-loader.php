<?php


namespace Elementor\Modules\Optimizer;

require __DIR__ . '/../../vendor/autoload.php';

use Elementor\Core\Base\Module as BaseModule;
use PHPHtmlParser\Dom;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


class Page_Loader extends BaseModule {
	private $post_id;
	private $page_data;
	private $images;
	private $background_images;

	public function get_name() {
		return 'page-loader';
	}

	public function __construct( $post_id ) {
		parent::__construct();
		$this->post_id = $post_id;

		add_action( 'elementor/frontend/before_enqueue_styles', function() {
			$this->page_data = $this->get_page_data();
			$this->images = $this->get_images();
			$this->background_images = $this->get_images( true );

			add_filter( 'style_loader_tag', [ $this, 'delay_loading' ], 10, 4 );
		} );

		add_action( 'wp_body_open', function() {
			echo $this->render_optimized_styles();
		} );

		add_action( 'elementor/widget/render_content', function( $content, $widget ) {
			echo $this->parse_widget_output( $content, $widget );
		}, 10, 2 );
	}

	public function delay_loading( $html, $handle, $href, $media ) {
		$style_dir = wp_parse_url( $href, PHP_URL_PATH );
		preg_match( '/wp-content/', $style_dir, $matches, PREG_OFFSET_CAPTURE );
		if ( ! count( $matches ) ) {
			return $html;
		}

		return str_replace(
			"rel='stylesheet'",
			"rel='prefetch' media='none'",
			$html
		);
	}

	private function render_optimized_styles() {
		return '<style type="text/css" class="e-optimizer-critical-style">' . $this->get_critical_css() . '</style>
		<style type="text/css" class="e-optimizer-image-placeholders">' . $this->get_images_placeholders_css() . '</style>
		<style type="text/css" class="e-optimizer-bg_image-placeholders">' . $this->get_background_images_placeholders_css() . '</style>';
	}

	public function parse_widget_output( $html, $widget ) {
		$images = $this->get_images();

		if ( ! $images ) {
			return $html;
		}

		$widget_id = $widget->get_raw_data()['id'];

		foreach ( $images as $image ) {
			if ( $widget_id === $image['parentWidget'] && $image['critical'] ) {
				$html = str_replace(
					' src="' . $image['src'] . '"',
					' data-src="' . $image['src'] . '" loading="eager"',
					$html
				);
				$html = str_replace( ' srcset="', ' data-srcset="', $html );
			}
		}

		return $html;
	}

	private function get_images_placeholders_css() {
		if ( ! $this->images ) {
			return false;
		}

		$css = '';

		foreach ( $this->images as $image ) {
			$img_src = $image['src'];
			$has_placeholder = isset( $image['placeholder']['data'][0] );
			$url = $has_placeholder ? $image['placeholder']['data'][0] : $img_src;
			$widget_id = $image['parentWidget'];
			$css_selector = '[data-id="' . $widget_id . '"] [data-src="' . $img_src . '"]';
			$image_content_rule = 'content: url("' . $url . '");';
			$image_width_rule = 'min-width:' . $image['clientWidth'] . 'px;';
			$css .= $css_selector . '{' . $image_content_rule . $image_width_rule . '}';
		}

		return $css;
	}

	private function get_background_images_placeholders_css() {
		if ( ! $this->background_images ) {
			return false;
		}

		$css = '';

		foreach ( $this->background_images as $image ) {
			$css .= $image['cssSelector'] . '{background-image: url("' . $image['placeholder']['data'][0] . '") !important;}';
		}

		return $css;
	}

	private function get_images( $background_images = false ) {
		$images_data_key = $background_images ? 'backgroundImages' : 'images';
		$page_data = $this->page_data;
		$images = $page_data && isset( $page_data[ $images_data_key ] ) && is_array( $page_data[ $images_data_key ] ) && 0 < count( $page_data[ $images_data_key ] ) ?
			$page_data[ $images_data_key ] :
			false;

		if ( ! $images ) {
			return false;
		}

		foreach ( $images as $key => $image ) {
			if ( ! $background_images && ! $image['critical'] ) {
				continue;
			}
			$url_key = $background_images ? $image['url'] : $image['src'];
			$images[ $key ]['id'] = attachment_url_to_postid( $url_key );
			$images[ $key ]['placeholder']['data'] = get_post_meta(
				$images[ $key ]['id'],
				'_e_optimizer_placeholder_' . $image['placeholder']['size']
			);
		}

		$this->page_data[ $images_data_key ] = $images;

		return $this->page_data[ $images_data_key ];
	}

	private function get_critical_css() {
		return get_post_meta(
			get_the_ID(),
			'_elementor_optimizer_critical_css',
			true
		);
	}

	private function get_page_data() {
		return get_post_meta(
			get_the_ID(),
			'_elementor_analyzer_report',
			true
		);
	}
}
