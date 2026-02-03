<?php

namespace Elementor\App\Modules\OnboardingV2;

use Elementor\App\Modules\OnboardingV2\Data\Controller;
use Elementor\App\Modules\OnboardingV2\Storage\Repository;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const VERSION = '1.0.0';
	const EXPERIMENT_NAME = 'e_onboarding_v2';

	private Repository $repository;

	public function get_name(): string {
		return 'onboarding-v2';
	}

	public static function get_experimental_data(): array {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Onboarding V2', 'elementor' ),
			'description' => esc_html__( 'New onboarding experience for 2026 with improved user journey and progress tracking.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public function __construct() {
		$this->repository = Repository::instance();

		Plugin::$instance->data_manager_v2->register_controller( new Controller() );

		add_action( 'elementor/init', [ $this, 'on_elementor_init' ], 12 );
	}

	public function on_elementor_init(): void {
		if ( ! Plugin::$instance->app->is_current() ) {
			return;
		}

		$this->set_onboarding_settings();
	}

	public function repository(): Repository {
		return $this->repository;
	}

	private function set_onboarding_settings(): void {
		if ( ! Plugin::$instance->common ) {
			return;
		}

		$progress = $this->repository->get_progress();
		$choices = $this->repository->get_choices();

		Plugin::$instance->app->set_settings( 'onboarding', [
			'version' => self::VERSION,
			'restUrl' => rest_url( 'elementor/v2/onboarding-v2/' ),
			'nonce' => wp_create_nonce( 'wp_rest' ),
			'progress' => $progress->to_array(),
			'choices' => $choices->to_array(),
			'hadUnexpectedExit' => $progress->had_unexpected_exit(),
			'totalSteps' => 14,
			'urls' => [
				'dashboard' => admin_url(),
				'editor' => admin_url( 'edit.php?post_type=elementor_library' ),
			],
		] );
	}
}
