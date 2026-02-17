<?php

namespace Elementor\App\Modules\E_Onboarding\Data;

use Elementor\App\Modules\E_Onboarding\Data\Endpoints\Install_Pro;
use Elementor\App\Modules\E_Onboarding\Data\Endpoints\Pro_Status;
use Elementor\App\Modules\E_Onboarding\Data\Endpoints\User_Choices;
use Elementor\App\Modules\E_Onboarding\Data\Endpoints\User_Progress;
use Elementor\Data\V2\Base\Controller as Base_Controller;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Controller extends Base_Controller {

	public function get_name(): string {
		return 'e-onboarding';
	}

	public function register_endpoints(): void {
		$this->register_endpoint( new User_Progress( $this ) );
		$this->register_endpoint( new User_Choices( $this ) );
		$this->register_endpoint( new Pro_Status( $this ) );
		$this->register_endpoint( new Install_Pro( $this ) );
	}

	public function get_items_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	public function get_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	public function create_items_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	public function create_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	public function update_items_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}

	public function update_item_permissions_check( $request ) {
		return current_user_can( 'manage_options' );
	}
}
