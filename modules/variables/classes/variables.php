<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Modules\Variables\Services\Variables_Service;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Variables {
	private static $lookup = [];

	public static function init( Variables_Service $service ) {
		self::$lookup = $service->get_variables_list();
	}

	public static function by_id( string $id ) {
		return self::$lookup[ $id ] ?? null;
	}
}
