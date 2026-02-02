<?php

namespace Elementor\Modules\OnboardingV2\Data;

use Elementor\Data\V2\Base\Controller as Controller_Base;
use Elementor\Modules\OnboardingV2\Data\Endpoints\User_Progress;
use Elementor\Modules\OnboardingV2\Data\Endpoints\User_Choices;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Onboarding V2 Data Controller
 *
 * REST API controller for onboarding v2 data endpoints.
 *
 * @since 3.x.x
 */
class Controller extends Controller_Base {

	/**
	 * Get controller name.
	 *
	 * @since 3.x.x
	 * @access public
	 *
	 * @return string Controller name.
	 */
	public function get_name(): string {
		return 'onboarding-v2';
	}

	/**
	 * Register endpoints.
	 *
	 * @since 3.x.x
	 * @access public
	 */
	public function register_endpoints(): void {
		$this->register_endpoint( new User_Progress( $this ) );
		$this->register_endpoint( new User_Choices( $this ) );
	}

	/**
	 * Get permission callback.
	 *
	 * @since 3.x.x
	 * @access public
	 *
	 * @param \WP_REST_Request $request The request object.
	 * @return bool Whether user has permission.
	 */
	public function get_permission_callback( $request ): bool {
		return current_user_can( 'manage_options' );
	}
}
