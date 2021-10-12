<?php
namespace Elementor\Modules\Favorites;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Data\Base\Controller as Controller_Base;

class Controller extends Controller_Base {

	public function get_name() {
		return 'favorites';
	}

	public function register_endpoints() {}

	public function register_internal_endpoints() {
		$this->register_endpoint( Endpoints\Index::class );
	}
}
