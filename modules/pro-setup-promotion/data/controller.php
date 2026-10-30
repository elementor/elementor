<?php

namespace Elementor\Modules\ProSetupPromotion\Data;

use Elementor\Modules\ProSetupPromotion\Data\Endpoints\Complete_Setup;
use Elementor\Modules\ProSetupPromotion\Data\Endpoints\Dismiss;
use Elementor\Modules\ProSetupPromotion\Data\Endpoints\Setup_State_Endpoint;
use Elementor\Data\V2\Base\Controller as Base_Controller;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Controller extends Base_Controller {

	public function get_name(): string {
		return 'pro-setup-promotion';
	}

	public function register_endpoints(): void {
		$this->register_endpoint( new Dismiss( $this ) );
		$this->register_endpoint( new Complete_Setup( $this ) );
		$this->register_endpoint( new Setup_State_Endpoint( $this ) );
	}

	public function get_items_permissions_check( $request ) {
		return current_user_can( 'edit_posts' );
	}

	public function get_item_permissions_check( $request ) {
		return current_user_can( 'edit_posts' );
	}

	public function create_items_permissions_check( $request ) {
		return current_user_can( 'edit_posts' );
	}

	public function create_item_permissions_check( $request ) {
		return $this->create_items_permissions_check( $request );
	}
}
