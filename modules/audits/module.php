<?php

namespace Elementor\Modules\Audits;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Audits\Data\Controller;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'e_page_audit';

	const REST_NAMESPACE = 'elementor/v1';

	const PACKAGES = [
		'editor-props',
		'editor-styles',
		'editor-elements',
		'editor-floating-panels',
		'editor-audits',
	];

	public function __construct() {
		parent::__construct();

		if ( ! self::is_active() ) {
			return;
		}

		$this->register_data_controller();

		add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );
		add_action( 'elementor/editor/v2/scripts/enqueue', fn() => $this->print_inline_config() );
	}

	public function get_name(): string {
		return 'audits';
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Page Audit', 'elementor' ),
			'description' => esc_html__( 'Scan the current page for SEO, accessibility, performance, and best-practice issues directly from the editor.', 'elementor' ),
			'release_status' => Experiments_Manager::RELEASE_STATUS_BETA,
			'default' => Experiments_Manager::STATE_INACTIVE,
		];
	}

	public static function is_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
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
				'restNamespace' => self::REST_NAMESPACE,
				'nonce' => wp_create_nonce( 'wp_rest' ),
			] ) . ';',
			'before'
		);
	}
}
