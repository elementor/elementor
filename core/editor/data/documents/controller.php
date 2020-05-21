<?php

namespace Elementor\Core\Editor\Data\Documents;

use Elementor\Data\Base\Controller as Controller_Base;

class Controller extends Controller_Base {

	public function get_name() {
		return 'editor/documents';
	}

	public function register_endpoints() {
		// Bypass.
	}

	public function register_internal_endpoints() {
		$this->register_endpoint( Endpoints\Index::class );
	}

	public function register_processors() {
		$this->register_processor( Processors\AddDefaultGlobals::class );
		$this->register_processor( Processors\AddGlobals::class );
	}
}
