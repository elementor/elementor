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

	public function __construct( $variables_route = null ) {
		parent::__construct();

		if ( $variables_route ) {
			$this->variablesRoute = $variables_route;
		} else {
			$this->variablesRoute = new VariablesRoute();
		}
	}
}
