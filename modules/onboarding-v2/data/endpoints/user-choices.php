<?php

namespace Elementor\Modules\OnboardingV2\Data\Endpoints;

use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use Elementor\Modules\OnboardingV2\Module as OnboardingV2_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * User Choices Endpoint
 *
 * Handles storing and retrieving user choices during onboarding.
 * Stores answers from each onboarding step (building_for, site_type, experience_level, etc.)
 *
 * @since 3.x.x
 */
class User_Choices extends Endpoint_Base {

	/**
	 * Register endpoint routes.
	 *
	 * @since 3.x.x
	 * @access protected
	 */
	protected function register(): void {
		parent::register();

		$this->register_items_route( \WP_REST_Server::READABLE );
		$this->register_items_route( \WP_REST_Server::EDITABLE );
	}

	/**
	 * Get endpoint name.
	 *
	 * @since 3.x.x
	 * @access public
	 *
	 * @return string Endpoint name.
	 */
	public function get_name(): string {
		return 'user-choices';
	}

	/**
	 * Get endpoint format.
	 *
	 * @since 3.x.x
	 * @access public
	 *
	 * @return string Endpoint format.
	 */
	public function get_format(): string {
		return 'onboarding-v2';
	}

	/**
	 * Get items (user choices data).
	 *
	 * @since 3.x.x
	 * @access public
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return array Response data.
	 */
	public function get_items( $request ): array {
		$module = OnboardingV2_Module::instance();

		return [
			'data' => $module->get_user_choices(),
		];
	}

	/**
	 * Update items (user choices data).
	 *
	 * @since 3.x.x
	 * @access public
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return array Response data.
	 */
	public function update_items( $request ): array {
		$module = OnboardingV2_Module::instance();
		$params = $request->get_json_params();

		// Sanitize and validate choices
		$allowed_choice_keys = [
			'building_for',       // Step 3/4: Who are you building for?
			'site_type',          // Step 5/6: What is your site about?
			'experience_level',   // Step 7/8: How familiar are you with Elementor?
			'goals',              // Step 9: What are your goals?
			'features',           // Step 10: What features do you need?
			'design_preference',  // Step 11: Design preferences
			'template_choice',    // Step 12: Template selection
			'connected_account',  // Whether user connected their Elementor account
			'site_name',          // User's site name if provided
			'custom_data',        // Any additional custom data
		];

		$sanitized_choices = [];

		foreach ( $allowed_choice_keys as $key ) {
			if ( isset( $params[ $key ] ) ) {
				$sanitized_choices[ $key ] = $this->sanitize_choice_value( $params[ $key ] );
			}
		}

		$success = $module->update_user_choices( $sanitized_choices );

		return [
			'data' => $success ? 'success' : 'error',
			'choices' => $module->get_user_choices(),
		];
	}

	/**
	 * Sanitize choice value.
	 *
	 * @since 3.x.x
	 * @access private
	 *
	 * @param mixed $value The value to sanitize.
	 * @return mixed Sanitized value.
	 */
	private function sanitize_choice_value( $value ) {
		if ( is_string( $value ) ) {
			return sanitize_text_field( $value );
		}

		if ( is_array( $value ) ) {
			return array_map( [ $this, 'sanitize_choice_value' ], $value );
		}

		if ( is_bool( $value ) ) {
			return $value;
		}

		if ( is_int( $value ) ) {
			return absint( $value );
		}

		return $value;
	}
}
