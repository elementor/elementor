<?php
namespace Elementor\Modules\NestedElements;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	public function get_name() {
		return 'nested-elements';
	}

	protected function get_widgets() {
		return [
			'NestedTabs',
		];
	}
}
