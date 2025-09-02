<?php

namespace Elementor\Modules\ProFreeTrialPopup;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Utils\Ab_Test;
use Elementor\Core\Isolation\Elementor_Adapter;
use Elementor\Core\Isolation\Elementor_Adapter_Interface;
use Elementor\Modules\ElementorCounter\Module as Elementor_Counter;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	
	const EXPERIMENT_NAME = 'e_pro_free_trial_popup';
	const MODULE_NAME = 'pro-free-trial-popup';
	const POPUP_DISPLAYED_OPTION = '_e_pro_free_trial_popup_displayed';
	const AB_TEST_NAME = 'pro_free_trial_popup';
	const REQUIRED_VISIT_COUNT = 4;
	const EXTERNAL_DATA_URL = 'https://assets.elementor.com/pro-free-trial/v1/data.json';
	
	private Elementor_Adapter_Interface $elementor_adapter;
	
	public function __construct() {
		parent::__construct();
		$this->elementor_adapter = new Elementor_Adapter();
		
		// Temporary debug
		error_log('Pro Free Trial Popup: Constructor called');
		
		// Check if module is registered
		add_action('init', function() {
			$modules_manager = \Elementor\Plugin::$instance->modules_manager;
			
			// Check if our specific module is registered
			$our_module = $modules_manager->get_modules('pro-free-trial-popup');
			if ($our_module) {
				error_log('Pro Free Trial Popup module is registered!');
			} else {
				error_log('Pro Free Trial Popup module is NOT registered!');
			}
			
			// Get all module names
			$module_names = $modules_manager->get_modules_names();
			error_log('Available module names: ' . print_r($module_names, true));
			
			// Check if our module name is in the list
			if (in_array('pro-free-trial-popup', $module_names)) {
				error_log('Pro Free Trial Popup is in module names list!');
			} else {
				error_log('Pro Free Trial Popup is NOT in module names list!');
			}
		});
		
		// TEMPORARY: Force initialize the module
		add_action('elementor/init', function() {
			error_log('=== FORCING MODULE INITIALIZATION ===');
			$this->init();
		});
	}
	
	public function get_name() {
		return 'pro-free-trial-popup';
	}
	
	public static function get_experimental_data(): array {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Pro Free Trial Popup', 'elementor' ),
			'description' => esc_html__( 'Show Pro free trial popup on 4th editor visit', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_ACTIVE,
			// 'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
			// 'new_site' => [
			// 	'default_active' => true,
			// 	// 'minimum_installation_version' => '3.32.0',
			// ],
		];
	}
	
	public function init() {
		// Debug logging
		error_log('=== Pro Free Trial Popup Debug ===');
		error_log('Module init called');
		
		// Check if experiment is active
		$experiment_active = \Elementor\Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
		error_log('Experiment active: ' . ($experiment_active ? 'YES' : 'NO'));
		
		// Check if user has Pro
		$user_has_pro = $this->user_has_pro();
		error_log('User has Pro: ' . ($user_has_pro ? 'YES' : 'NO'));
		
		// Only initialize if user doesn't have Pro
		if ( $user_has_pro ) {
			error_log('Skipping - user has Pro');
			return;
		}
		
		error_log('Adding action hook');
		add_action( 'elementor/editor/before_enqueue_scripts', [ $this, 'maybe_enqueue_popup' ] );
		error_log('=== End Debug ===');
	}
	
	/**
	 * Check if user has Pro (without depending on Pro)
	 * 
	 * @return bool True if user has Pro
	 */
	private function user_has_pro(): bool {
		return false;
		// Method 1: Check if Pro plugin is active
		if ( $this->is_pro_plugin_active() ) {
			return true;
		}
		
		// Method 2: Check if user has Pro license
		if ( $this->user_has_pro_license() ) {
			return true;
		}
		
		// Method 3: Check if Pro features are available
		if ( $this->pro_features_available() ) {
			return true;
		}
		
		return false;
	}
	
	/**
	 * Check if Elementor Pro plugin is active
	 * 
	 * @return bool True if Pro plugin is active
	 */
	private function is_pro_plugin_active(): bool {
		// Check if Pro plugin file exists and is active
		return file_exists( WP_PLUGIN_DIR . '/elementor-pro/elementor-pro.php' ) &&
			   is_plugin_active( 'elementor-pro/elementor-pro.php' );
	}
	
	/**
	 * Check if user has Pro license
	 * 
	 * @return bool True if user has Pro license
	 */
	private function user_has_pro_license(): bool {
		// Check for Pro license data
		$license_data = get_option( '_elementor_pro_license_v2_data' );
		if ( ! empty( $license_data ) ) {
			return true;
		}
		
		// Check for legacy license data
		$legacy_license = get_option( 'elementor_pro_license_key' );
		if ( ! empty( $legacy_license ) ) {
			return true;
		}
		
		return false;
	}
	
	/**
	 * Check if Pro features are available
	 * 
	 * @return bool True if Pro features are available
	 */
	private function pro_features_available(): bool {
		// Check if Pro classes exist
		if ( class_exists( 'ElementorPro\Plugin' ) ) {
			return true;
		}
		
		// Check if Pro functions exist
		if ( function_exists( 'elementor_pro_load_plugin' ) ) {
			return true;
		}
		
		return false;
	}
	
	/**
	 * Check if popup should be enqueued and enqueue if needed
	 */
	public function maybe_enqueue_popup(): void {
		error_log('=== maybe_enqueue_popup called ===');
		$this->enqueue_scripts();
	}
	
	/**
	 * Determine if popup should be shown
	 * 
	 * @return bool True if popup should be shown
	 */
	private function should_show_popup(): bool {
		// Check if feature is enabled via external JSON
		if ( ! $this->is_feature_enabled() ) {
			return false;
		}
		
		// Check if it's the 4th visit
		if ( $this->is_before_fourth_visit() ) {
			return false;
		}
		
		// Check if popup has already been displayed
		if ( $this->has_popup_been_displayed() ) {
			return false;
		}
		
		// Check A/B test variation (50% of users)
		return Ab_Test::should_show_feature( self::AB_TEST_NAME );
	}
	
	/**
	 * Check if feature is enabled via external JSON
	 * 
	 * @return bool True if feature is enabled
	 */
	private function is_feature_enabled(): bool {
		$data = $this->get_external_data();
		return ! empty( $data['enabled'] );
	}
	
	/**
	 * Get external JSON data
	 * 
	 * @return array External data or empty array on failure
	 */
	private function get_external_data(): array {
		$cached_data = get_transient( 'elementor_pro_free_trial_data' );
		
		if ( false !== $cached_data ) {
			return $cached_data;
		}
		
		$response = wp_remote_get( self::EXTERNAL_DATA_URL );
		
		if ( is_wp_error( $response ) ) {
			return [];
		}
		
		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );
		
		if ( ! is_array( $data ) ) {
			return [];
		}
		
		// Cache for 1 hour
		set_transient( 'elementor_pro_free_trial_data', $data, HOUR_IN_SECONDS );
		
		return $data;
	}
	
	/**
	 * Check if current visit is before the 4th visit
	 * 
	 * @return bool True if before 4th visit
	 */
	private function is_before_fourth_visit(): bool {
		if ( ! $this->elementor_adapter ) {
			return true;
		}
		
		$editor_visit_count = $this->elementor_adapter->get_count( Elementor_Counter::EDITOR_COUNTER_KEY );
		return $editor_visit_count < self::REQUIRED_VISIT_COUNT;
	}
	
	/**
	 * Check if popup has already been displayed to this user
	 * 
	 * @return bool True if already displayed
	 */
	private function has_popup_been_displayed(): bool {
		return (bool) get_user_meta( $this->get_current_user_id(), self::POPUP_DISPLAYED_OPTION, true );
	}
	
	/**
	 * Mark popup as displayed for current user
	 */
	private function set_popup_as_displayed(): void {
		update_user_meta( $this->get_current_user_id(), self::POPUP_DISPLAYED_OPTION, true );
	}
	
	/**
	 * Enqueue popup scripts
	 */
	private function enqueue_scripts(): void {
		error_log('=== enqueue_scripts called ===');
		
		$min_suffix = Utils::is_script_debug() ? '' : '.min';
		$script_url = ELEMENTOR_ASSETS_URL . 'js/pro-free-trial-popup' . $min_suffix . '.js';
		
		error_log('Script URL: ' . $script_url);
		error_log('Script exists: ' . (file_exists(str_replace(ELEMENTOR_URL, ELEMENTOR_PATH, $script_url)) ? 'YES' : 'NO'));
		
		wp_enqueue_script(
			self::MODULE_NAME,
			$script_url,
			[
				'react',
				'react-dom',
				'elementor-common',
				'elementor-v2-ui',
			],
			ELEMENTOR_VERSION,
			true
		);
		
		// Pass external data to JavaScript
		$external_data = $this->get_external_data();
		error_log('External data: ' . print_r($external_data, true));
		wp_localize_script( self::MODULE_NAME, 'elementorProFreeTrialData', $external_data );
		
		wp_set_script_translations( self::MODULE_NAME, 'elementor' );
		
		error_log('Script enqueued successfully');
	}
	
	/**
	 * Get current user ID
	 * 
	 * @return int Current user ID
	 */
	private function get_current_user_id(): int {
		$current_user = wp_get_current_user();
		return $current_user->ID ?? 0;
	}
}