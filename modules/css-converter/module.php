<?php
namespace Elementor\Modules\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Core\Base\Module as BaseModule;

class Module extends BaseModule {
	public function get_name() {
		return 'css-converter';
	}

	public function __construct() {
		parent::__construct();
		require_once __DIR__ . '/routes/variables-route.php';
	}
}


