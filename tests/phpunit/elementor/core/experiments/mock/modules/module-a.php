<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Experiments\Mock\Modules;

use Elementor\Core\Base\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module_A extends Module {

	public function get_name() {
		return 'module-a';
	}
}
