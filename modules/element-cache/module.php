<?php
namespace Elementor\Modules\ElementCache;

use Elementor\Controls_Manager;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as ExperimentsManager;
use Elementor\Element_Base;
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
		$this->add_advanced_tab_actions();
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

	private function add_advanced_tab_actions() {
		if ( ! Plugin::$instance->experiments->is_feature_active( 'e_element_cache' ) ) {
			return;
		}

		$hooks = array(
			'elementor/element/common/_section_style/after_section_end' => '_css_classes', // Widgets
		);

		foreach ( $hooks as $hook => $injection_position ) {
			add_action(
				$hook,
				function( $element, $args ) use ( $injection_position ) {
					$this->add_control_to_advanced_tab( $element, $args, $injection_position );
				},
				10,
				2
			);
		}
	}

	private function add_control_to_advanced_tab( Element_Base $element, $args, $injection_position ) {
		$element->start_injection(
			[
				'of' => $injection_position,
			]
		);

		$control_data = [
			'label' => esc_html__( 'Cache Settings', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => '',
			'options' => [
				'' => esc_html__( 'Default', 'elementor' ),
				'yes' => esc_html__( 'Inactive', 'elementor' ),
				'no' => esc_html__( 'Active', 'elementor' ),
			],
		];

		$element->add_control( '_element_cache', $control_data );

		$element->end_injection();
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
