<?php

namespace Elementor\Modules\Audits\Data;

use Elementor\Data\V2\Base\Controller as Controller_Base;
use Elementor\Modules\Audits\Data\Endpoints\Page_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Controller extends Controller_Base {

	public function get_name(): string {
		return 'audits';
	}

	public function register_endpoints() {
		$this->register_endpoint( new Page_Context( $this ) );
	}

	public function get_items_permissions_check( $request ) {
		$document_id = (int) $request->get_param( 'document_id' );

		return $document_id > 0 && current_user_can( 'edit_post', $document_id );
	}

	public function get_item_permissions_check( $request ) {
		return $this->get_items_permissions_check( $request );
	}
}
