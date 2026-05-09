<?php

namespace Elementor\Modules\AssetsManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Assets {
	private $assets;

	public function __construct() {
		$this->assets = [];
	}
}
