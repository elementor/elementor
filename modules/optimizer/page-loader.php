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

	public function get_name() {
		return 'page-loader';
	}

	public function __construct( $post_id ) {
		parent::__construct();
		$this->post_id = $post_id;
		$this->page_data = $this->get_page_data();

		add_action( 'elementor/frontend/before_enqueue_styles', function() {
			add_filter( 'style_loader_tag', [ $this, 'delay_loading' ], 10, 4 );
		} );

		add_action( 'wp_footer', function() {
			echo $this->render_optimized_styles();
		} );

 		//add_filter( 'elementor/image_size/get_attachment_image_html', [ $this, 'parse_image_render_output' ], 50, 4 );

		add_action( 'elementor/widget/render_content', function( $content, $widget ) {
			$this->parse_widget_output( $content, $widget );
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
		$page_data = $this->get_page_data();
		return '<style type="text/css" class="e-optimizer-critical-style">' . $page_data['criticalCSS'] . '</style>
		<style type="text/css" class="e-optimizer-image-placeholders">' . $this->get_images_placeholders_css() . '</style>
		<style type="text/css" class="e-optimizer-bg_image-placeholders">' . $this->get_background_images_placeholders_css() . '</style>';
	}

	public function parse_widget_output( $html, $widget ) {
		$images = $this->get_images();

		if ( ! $images ) {
			return;
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

		echo $html;
	}

	private function get_images_placeholders_css() {
		$images = $this->get_images();

		if ( ! $images ) {
			return;
		}

		$css = '';

		foreach ( $images as $image ) {
			$base64 = $image['placeholder']['data'][0];
			$widget_id = $image['parentWidget'];
			$img_src = $image['src'];
			$css_selector = '[data-id="' . $widget_id . '"] [data-src="' . $img_src . '"]';
			$image_content_rule = 'content: url("' . $base64 . '");';
			$image_width_rule = 'min-width:' . $image['clientWidth'] . 'px;';
			$css .= $css_selector . '{' . $image_content_rule . $image_width_rule . '}';
		}

		return $css;
	}

	private function get_background_images_placeholders_css() {
		$images = $this->get_background_images();

		if ( ! $images ) {
			return;
		}

		$css = '';

		foreach ( $images as $image ) {
			$css .= $image['cssSelector'] . '{background-image: url("' . $image['placeholder']['data'] . '") !important;}';
		}

		return $css;
	}

	private function get_background_images() {
		$page_data = $this->get_page_data();
		$images = $page_data && isset( $page_data['backgroundImages'] ) && is_array( $page_data['backgroundImages'] ) && 0 < count( $page_data['backgroundImages'] ) ?
			$page_data['backgroundImages'] :
			false;

		if ( ! $images ) {
			return false;
		}

		foreach ( $images as $key => $image ) {
			$images[ $key ]['id'] = attachment_url_to_postid( $image['url'] );
			$images[ $key ]['placeholder'][0] = get_post_meta(
				$images[ $key ]['id'],
				'_e_optimizer_placeholder_' . $image['placeholder']['size']
			);
		}

		return $images;
	}

	private function get_images() {
		$page_data = $this->get_page_data();
		$images = $page_data && isset( $page_data['images'] ) && is_array( $page_data['images'] ) && 0 < count( $page_data['images'] ) ?
			$page_data['images'] :
			false;

		if ( ! $images ) {
			return false;
		}

		foreach ( $images as $key => $image ) {
			if ( ! $image['critical'] ) {
				continue;
			}
			$images[ $key ]['id'] = attachment_url_to_postid( $image['src'] );
			$images[ $key ]['placeholder']['data'] = get_post_meta(
				$images[ $key ]['id'],
				'_e_optimizer_placeholder_' . $image['placeholder']['size']
			);
		}

		return $images;
	}

	private function get_page_data() {
		return get_post_meta(
			get_the_ID(),
			'_elementor_analyzer_report',
			true
		);
	}
}
