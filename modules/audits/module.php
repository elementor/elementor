<?php

namespace Elementor\Modules\Audits;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\Audits\Data\Controller;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	const FILTER_AUDITS = 'elementor/audits/audits';

	const REST_NAMESPACE = 'elementor/v1';

	const PACKAGES = [
		'editor-props',
		'editor-styles',
		'editor-elements',
		'editor-floating-panels',
		'editor-audits',
	];

	private Audits_Manager $audits_manager;

	public function __construct() {
		parent::__construct();

		$this->audits_manager = new Audits_Manager();
		$this->register_data_controller();

		add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );
		add_action( 'elementor/editor/v2/scripts/enqueue', fn() => $this->print_inline_config() );
	}

	public function get_name(): string {
		return 'audits';
	}

	public function register_data_controller(): void {
		Plugin::$instance->data_manager_v2->register_controller( new Controller() );
	}

	private function add_packages( array $packages ): array {
		return array_merge( $packages, self::PACKAGES );
	}

	private function print_inline_config(): void {
		wp_add_inline_script(
			'elementor-v2-editor-audits',
			'window.elementorAudits = ' . wp_json_encode( [
				'audits' => $this->audits_manager->get_descriptors(),
				'restNamespace' => self::REST_NAMESPACE,
				'nonce' => wp_create_nonce( 'wp_rest' ),
			] ) . ';',
			'before'
		);
	}
}
