<?php
namespace Elementor\Modules\NestedElements;

use Elementor\Core\Experiments\Manager as Experiments_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	const EXPERIMENT_NAME = 'nested-elements';

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Nested Elements', 'elementor' ),
			'description' => sprintf(
				esc_html__( 'Create a rich user experience by layering widgets together inside "Nested" Tabs, etc. When turned on, we’ll automatically enable new nested features. Your old widgets won’t be affected. %1$sLearn More%2$s', 'elementor' ),
				'<a href="https://go.elementor.com/wp-dash-nested-elements/" target="_blank">',
				'</a>'
			),
			'release_status' => Experiments_Manager::RELEASE_STATUS_BETA,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'dependencies' => [
				'container',
			],
			'new_site' => [
				'default_active' => false,
				'minimum_installation_version' => '3.10.0',
			],
		];
	}

	public function get_name() {
		return 'nested-elements';
	}

	public function __construct() {
		parent::__construct();

		add_action( 'elementor/controls/controls_registered', function ( $controls_manager ) {
			$controls_manager->register( new Controls\Control_Nested_Repeater() );
		} );

		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			wp_enqueue_script( $this->get_name(), $this->get_js_assets_url( $this->get_name() ), [
				'elementor-common',
			], ELEMENTOR_VERSION, true );
		} );
	}
}
