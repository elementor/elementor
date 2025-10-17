<?php

namespace Elementor\Modules\Components\SaveAction;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Save_Components_Action {

	public static function make() {
		return new static();
	}

	public function execute( Save_Components_DTO $data ) {
		return true;
	}
}
