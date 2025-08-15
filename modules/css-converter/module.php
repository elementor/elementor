<?php
namespace Elementor\Modules\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\CssConverter\Routes\VariablesRoute;

class Module extends BaseModule {
	public function get_name() {
		return 'css-converter';
	}

	public function __construct() {
		parent::__construct();
		new VariablesRoute();
	}
}
