<?php

namespace Elementor\App\Modules\E_Onboarding\Data;

use Elementor\App\Modules\E_Onboarding\Data\Endpoints\User_Choices;
use Elementor\App\Modules\E_Onboarding\Data\Endpoints\User_Progress;
use Elementor\Data\V2\Base\Controller as Base_Controller;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * E-Onboarding REST API controller.
 *
 * Security: All endpoints under this controller require the 'manage_options' capability
 * (WordPress administrator). Permission callbacks below are invoked by the Data V2 base
 * route registration and must not be relaxed—unauthorized access would allow reading or
 * modifying onboarding state.
 */
class Controller extends Base_Controller {

	public function get_name(): string {
		return 'e-onboarding';
	}

	public function register_endpoints(): void {
		$this->register_endpoint( new User_Progress( $this ) );
		$this->register_endpoint( new User_Choices( $this ) );
	}

	/** @inheritdoc — Restrict to administrators only. */
	public function get_items_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/** @inheritdoc — Restrict to administrators only. */
	public function get_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/** @inheritdoc — Restrict to administrators only. */
	public function create_items_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/** @inheritdoc — Restrict to administrators only. */
	public function create_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/** @inheritdoc — Restrict to administrators only. */
	public function update_items_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	/** @inheritdoc — Restrict to administrators only. */
	public function update_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}
}
