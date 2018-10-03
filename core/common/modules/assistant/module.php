<?php

namespace Elementor\Core\Common\Modules\Assistant;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\RoleManager\Role_Manager;
use Elementor\Plugin;
use Elementor\Tools;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	public function __construct() {
		$this->add_template();

		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_action' ] );
	}

	public function get_name() {
		return 'assistant';
	}

	public function add_template() {
		Plugin::$instance->common->add_template( __DIR__ . '/template.php' );
	}

	public function register_ajax_action() {
//		Plugin::$instance->ajax->register_ajax_action(  );
	}

	protected function get_init_settings() {
		return [
			'data' => [
				'recently_created' => [
					'title' => __( 'Recently Created', 'elementor' ),
					'items' => [],
				],
				'configurations' => [
					'title' => __( 'Configurations', 'elementor' ),
					'items' => [
						[
							'title' => __( 'Role Manager', 'elementor' ),
							'icon' => 'person',
							'link' => Role_Manager::get_url(),
						],
						[
							'title' => __( 'Maintenance Mode', 'elementor' ),
							'icon' => 'time-line',
							'link' => Tools::get_url() . '#tab-maintenance_mode',
						]
					],
				]
			]
		];
	}
}
