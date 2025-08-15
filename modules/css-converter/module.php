<?php
namespace Elementor\Modules\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\CssConverter\Routes\VariablesRoute;

class Module extends BaseModule {
	private $variablesRoute;

	public function get_name() {
		return 'css-converter';
	}

	public function __construct( $variablesRoute = null ) {
		parent::__construct();

		if ( $variablesRoute ) {
			$this->variablesRoute = $variablesRoute;
		} else {
			$this->variablesRoute = new VariablesRoute();
		}
	}
}
