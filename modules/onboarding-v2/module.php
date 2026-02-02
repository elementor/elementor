<?php

namespace Elementor\Modules\OnboardingV2;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\OnboardingV2\Data\Controller;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Onboarding V2 Module
 *
 * New onboarding experience for 2026 with improved user progress tracking.
 *
 * @since 3.x.x
 */
class Module extends BaseModule {

	const EXPERIMENT_NAME = 'e_onboarding_v2';
	const PACKAGES = [ 'onboarding-v2' ];

	const DB_PROGRESS_KEY = 'elementor_onboarding_v2_progress';
	const DB_CHOICES_KEY = 'elementor_onboarding_v2_choices';

	/**
	 * Get module name.
	 *
	 * @since 3.x.x
	 * @access public
	 *
	 * @return string Module name.
	 */
	public function get_name(): string {
		return 'onboarding-v2';
	}

	/**
	 * Get experimental data.
	 *
	 * @since 3.x.x
	 * @access public
	 * @static
	 *
	 * @return array Experimental data.
	 */
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

	/**
	 * Constructor.
	 *
	 * @since 3.x.x
	 * @access public
	 */
	public function __construct() {
		parent::__construct();

		$this->init_user_progress();

		Plugin::$instance->data_manager_v2->register_controller( new Controller() );

		add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$this->enqueue_editor_scripts();
	}

	/**
	 * Get user progress from database.
	 *
	 * @since 3.x.x
	 * @access public
	 *
	 * @return array User progress data.
	 */
	public function get_user_progress(): array {
		$db_progress = get_option( self::DB_PROGRESS_KEY );
		$db_progress = is_array( $db_progress ) ? $db_progress : json_decode( $db_progress, true );
		$db_progress = is_array( $db_progress ) ? $db_progress : [];

		return array_merge( $this->get_default_progress(), $db_progress );
	}

	/**
	 * Update user progress in database.
	 *
	 * @since 3.x.x
	 * @access public
	 *
	 * @param array $new_data New progress data.
	 * @return bool Whether the update was successful.
	 */
	public function update_user_progress( array $new_data ): bool {
		$current_progress = $this->get_user_progress();

		$allowed_keys = [
			'current_step',
			'completed_steps',
			'exit_type',
			'last_active_timestamp',
			'started_at',
			'completed_at',
		];

		foreach ( $allowed_keys as $key ) {
			if ( isset( $new_data[ $key ] ) ) {
				$current_progress[ $key ] = $new_data[ $key ];
			}
		}

		// Auto-update last_active_timestamp
		$current_progress['last_active_timestamp'] = time();

		return update_option( self::DB_PROGRESS_KEY, wp_json_encode( $current_progress ) );
	}

	/**
	 * Get user choices from database.
	 *
	 * @since 3.x.x
	 * @access public
	 *
	 * @return array User choices data.
	 */
	public function get_user_choices(): array {
		$db_choices = get_option( self::DB_CHOICES_KEY );
		$db_choices = is_array( $db_choices ) ? $db_choices : json_decode( $db_choices, true );

		return is_array( $db_choices ) ? $db_choices : [];
	}

	/**
	 * Update user choices in database.
	 *
	 * @since 3.x.x
	 * @access public
	 *
	 * @param array $new_choices New choices data.
	 * @return bool Whether the update was successful.
	 */
	public function update_user_choices( array $new_choices ): bool {
		$current_choices = $this->get_user_choices();
		$merged_choices = array_merge( $current_choices, $new_choices );

		return update_option( self::DB_CHOICES_KEY, wp_json_encode( $merged_choices ) );
	}

	/**
	 * Check if user had an unexpected exit.
	 *
	 * @since 3.x.x
	 * @access public
	 *
	 * @return bool Whether user had an unexpected exit.
	 */
	public function had_unexpected_exit(): bool {
		$progress = $this->get_user_progress();

		return null === $progress['exit_type']
			&& $progress['current_step'] > 0
			&& null === $progress['completed_at'];
	}

	/**
	 * Add packages to editor.
	 *
	 * @since 3.x.x
	 * @access private
	 *
	 * @param array $packages Existing packages.
	 * @return array Modified packages array.
	 */
	private function add_packages( array $packages ): array {
		return array_merge( $packages, self::PACKAGES );
	}

	/**
	 * Enqueue editor scripts.
	 *
	 * @since 3.x.x
	 * @access private
	 */
	private function enqueue_editor_scripts(): void {
		add_action( 'elementor/editor/before_enqueue_scripts', function() {
			$min_suffix = Utils::is_script_debug() ? '' : '.min';

			wp_enqueue_script(
				'elementor-onboarding-v2',
				ELEMENTOR_ASSETS_URL . 'js/onboarding-v2' . $min_suffix . '.js',
				[
					'react',
					'react-dom',
					'elementor-common',
					'elementor-v2-ui',
					'elementor-v2-icons',
					'elementor-web-cli',
				],
				ELEMENTOR_VERSION,
				true
			);

			wp_set_script_translations( 'elementor-onboarding-v2', 'elementor' );

			wp_localize_script( 'elementor-onboarding-v2', 'elementorOnboardingV2Config', [
				'restUrl' => rest_url( 'elementor/v2/onboarding-v2/' ),
				'nonce' => wp_create_nonce( 'wp_rest' ),
				'progress' => $this->get_user_progress(),
				'choices' => $this->get_user_choices(),
				'hadUnexpectedExit' => $this->had_unexpected_exit(),
			] );
		} );
	}

	/**
	 * Initialize user progress option if not exists.
	 *
	 * @since 3.x.x
	 * @access private
	 */
	private function init_user_progress(): void {
		$default_progress = $this->get_default_progress();

		add_option( self::DB_PROGRESS_KEY, wp_json_encode( $default_progress ) );
	}

	/**
	 * Get default progress data structure.
	 *
	 * @since 3.x.x
	 * @access private
	 *
	 * @return array Default progress data.
	 */
	private function get_default_progress(): array {
		return [
			'current_step' => 0,
			'completed_steps' => [],
			'exit_type' => null,
			'last_active_timestamp' => null,
			'started_at' => null,
			'completed_at' => null,
		];
	}
}
