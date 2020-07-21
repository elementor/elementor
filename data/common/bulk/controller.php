<?php
namespace Elementor\Data\Common\Bulk;

use Elementor\Data\Base\Controller as Controller_Base;

class Controller extends Controller_Base {

	public function get_name() {
		return 'bulk';
	}

	public function register_endpoints() {
		// Nothing todo.
	}

	protected function register_internal_endpoints() {
		$this->register_endpoint( Endpoints\Index::class );
	}
}
