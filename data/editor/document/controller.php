<?php
namespace Elementor\Data\Editor\Document;

use Elementor\Data\Base\Controller as Controller_Base;

class Controller extends Controller_Base {
	public function get_name() {
		return 'document';
	}

	public function register_endpoints() {
		$this->register_endpoint( Endpoints\Elements::class );
	}
}
