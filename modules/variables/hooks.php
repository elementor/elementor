<?php

namespace Elementor\Modules\Variables;

use Elementor\Plugin;
use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Modules\Variables\Classes\CSS_Renderer as Variables_CSS_Renderer;
use Elementor\Modules\Variables\Classes\Fonts;
use Elementor\Modules\Variables\Classes\Rest_Api as Variables_API;
use Elementor\Modules\Variables\Classes\Variables;
use Elementor\Modules\Variables\Storage\Repository as Variables_Repository;
use Elementor\Modules\Variables\Classes\Style_Schema;
use Elementor\Modules\Variables\Classes\Style_Transformers;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Hooks {
	const PACKAGES = [
		'editor-variables',
	];

	public function register() {
		$this->register_styles_transformers()
			->register_packages()
			->filter_for_style_schema()
			->register_css_renderer()
			->register_fonts()
			->register_api_endpoints();

		// TODO: Remove this, later, temporary solution
		$this->filter_for_stored_variables();

		return $this;
	}

	private function filter_for_stored_variables() {
		add_filter( Variables::FILTER, function ( $variables ) {
			$db_record = ( new Variables_Repository(
				Plugin::$instance->kits_manager->get_active_kit()
			) )->load();

			foreach ( $db_record['data'] as $id => $variable ) {
				$variables[ $id ] = $variable;
			}

			return $variables;
		} );

		return $this;
	}

	private function register_packages() {
		add_filter( 'elementor/editor/v2/packages', function ( $packages ) {
			return array_merge( $packages, self::PACKAGES );
		} );

		return $this;
	}

	private function register_styles_transformers() {
		add_action( 'elementor/atomic-widgets/styles/transformers/register', function ( $registry ) {
			( new Style_Transformers() )->append_to( $registry );
		} );

		return $this;
	}

	private function filter_for_style_schema() {
		add_filter( 'elementor/atomic-widgets/styles/schema', function ( array $schema ) {
			return ( new Style_Schema() )->augment( $schema );
		} );

		return $this;
	}

	private function register_css_renderer() {
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

	private function register_fonts() {
		add_action( 'elementor/css-file/post/parse', function ( $post_css ) {
			( new Fonts() )->append_to( $post_css );
		} );

		return $this;
	}

	private function rest_api() {
		return new Variables_API(
			new Variables_Repository(
				Plugin::$instance->kits_manager->get_active_kit()
			)
		);
	}

	private function register_api_endpoints() {
		add_action( 'rest_api_init', function () {
			$this->rest_api()->register_routes();
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
}
