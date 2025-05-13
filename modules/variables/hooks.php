<?php

namespace Elementor\Modules\Variables;

use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Plugin;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Modules\Variables\Classes\CSS_Renderer as Variables_CSS_Renderer;
use Elementor\Modules\Variables\Classes\Style_Transformers;
use Elementor\Modules\Variables\Classes\Variables;
use Elementor\Modules\Variables\Classes\Style_Schema;

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

		// TODO: Remove this, when there are API-endpoints available to access the list of variables
		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			// We must enqueue a random script, so that localize will be triggered as well...
			wp_enqueue_script(
				'e-variables',
				ELEMENTOR_ASSETS_URL . '/variables-' . md5( microtime() ) . '.js',
				[],
				ELEMENTOR_VERSION,
				true
			);

			wp_localize_script(
				'e-variables',
				'ElementorV4Variables',
				( new Variables() )->get_all()
			);
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
		add_action( 'elementor/css-file/post/parse', function ( Post_CSS $post_css ) {
			if ( ! Plugin::$instance->kits_manager->is_kit( $post_css->get_post_id() ) ) {
				return;
			}

			$post_css->get_stylesheet()->add_raw_css(
				( new Variables_CSS_Renderer( new Variables() ) )->raw_css()
			);
		} );

		return $this;
	}

	public function enqueue_font_variables() {
		add_action( 'elementor/css-file/post/parse', function ( Post_CSS $post_css ) {
			if ( ! Plugin::$instance->kits_manager->is_kit( $post_css->get_post_id() ) ) {
				return;
			}

			$variable_groups = ( new Variables() )->get_all();
			$font_variables = $variable_groups[ Font_Variable_Prop_Type::get_key() ];

			foreach ( $font_variables as $variable ) {
				$font = $variable['value'];

				$post_css->add_font( $font );
			}
		} );

		return $this;
	}
}
