<?php

namespace Elementor\Modules\Variables;

use Elementor\Plugin;
use Elementor\Core\Files\CSS\Post;
use Elementor\Modules\Variables\Classes\CSS_Renderer as Variables_CSS_Renderer;
use Elementor\Modules\Variables\Classes\Style_Schema;
use Elementor\Modules\Variables\Classes\Style_Transformers;
use Elementor\Modules\Variables\Classes\Variables;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Hooks {
	const PACKAGES = [
		'editor-variables',
	];

	public function register_packages() {
		add_filter( 'elementor/editor/v2/packages', function ( $packages ) {
			return array_merge( $packages, self::PACKAGES );
		} );

		return $this;
	}

	public function register_styles_transformers() {
		add_action( 'elementor/atomic-widgets/styles/transformers/register', function ( $registry ) {
			( new Style_Transformers() )->append_to( $registry );
		} );

		return $this;
	}

	public function filter_for_style_schema() {
		add_filter( 'elementor/atomic-widgets/styles/schema', function ( array $schema ) {
			return ( new Style_Schema() )->augment( $schema );
		} );

		return $this;
	}

	public function register_css_renderer() {
		add_action( 'elementor/css-file/post/parse', function ( Post $post ) {
			if ( ! Plugin::$instance->kits_manager->is_kit( $post->get_post_id() ) ) {
				return;
			}

			$post->get_stylesheet()->add_raw_css(
				( new Variables_CSS_Renderer( new Variables() ) )->raw_css()
			);
		} );

		return $this;
	}
}
