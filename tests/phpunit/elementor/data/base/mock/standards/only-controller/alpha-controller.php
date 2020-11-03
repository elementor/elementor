<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Standards\OnlyController;

class Alpha_Controller extends \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller {
	public function get_name() {
		return 'alpha';
	}

	public function get_items( $request ) {
		return 'alpha-items';
	}

	public function get_item( $request ) {
		return 'alpha-item';
	}
}
