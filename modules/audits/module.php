<?php

namespace Elementor\Modules\Audits;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\Audits\Data\Controller;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	const FILTER_AUDITS = 'elementor/audits/audits';

	const REST_NAMESPACE = 'elementor/v1';

	private Audits_Manager $audits_manager;

	public function __construct() {
		parent::__construct();

		$this->audits_manager = new Audits_Manager();
		$this->register_data_controller();

		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			$this->enqueue_editor_scripts();
		} );
	}

	public function get_name(): string {
		return 'audits';
	}

	public function register_data_controller(): void {
		Plugin::$instance->data_manager_v2->register_controller( new Controller() );
	}

	private function enqueue_editor_scripts(): void {
		$min_suffix = Utils::is_script_debug() ? '' : '.min';

		wp_enqueue_script(
			'elementor-audits',
			ELEMENTOR_ASSETS_URL . 'js/audits' . $min_suffix . '.js',
			[
				'react',
				'react-dom',
				'elementor-common',
				'elementor-v2-ui',
				'elementor-v2-icons',
				'elementor-v2-editor-app-bar',
				'elementor-web-cli',
			],
			ELEMENTOR_VERSION,
			true
		);

		wp_set_script_translations( 'elementor-audits', 'elementor' );

		wp_add_inline_script(
			'elementor-audits',
			'window.elementorAudits = ' . wp_json_encode( [
				'audits' => $this->audits_manager->get_descriptors(),
				'restNamespace' => self::REST_NAMESPACE,
				'nonce' => wp_create_nonce( 'wp_rest' ),
			] ) . ';',
			'before'
		);
	}
}
