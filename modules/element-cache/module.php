<?php
namespace Elementor\Modules\ElementCache;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as ExperimentsManager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	public function get_name() {
		return 'element-cache';
	}

	public function __construct() {
		parent::__construct();

		$this->register_experiments();
		$this->register_shortcode();
	}

	private function register_experiments() {
		Plugin::$instance->experiments->add_feature( [
			'name' => 'e_element_cache',
			'title' => esc_html__( 'Element Caching', 'elementor' ),
			'tag' => esc_html__( 'Performance', 'elementor' ),
			'description' => esc_html__( 'Elements caching reduces loading times by serving up a copy of an element instead of rendering it fresh every time the page is loaded. When active, Elementor will determine which elements can benefit from static loading - but you can override this.', 'elementor' ),
			'release_status' => ExperimentsManager::RELEASE_STATUS_DEV,
			'default' => ExperimentsManager::STATE_INACTIVE,
			'generator_tag' => true,
		] );
	}

	private function register_shortcode() {
		add_shortcode( 'elementor-element', function ( $atts ) {
			if ( empty( $atts['data'] ) ) {
				return '';
			}

			$widget_data = json_decode( base64_decode( $atts['data'] ), true );

			if ( empty( $widget_data ) || ! is_array( $widget_data ) ) {
				return '';
			}

			ob_start();

			$element = Plugin::$instance->elements_manager->create_element_instance( $widget_data );

			if ( $element ) {
				$element->print_element();
			}

			return ob_get_clean();
		} );
	}
}
