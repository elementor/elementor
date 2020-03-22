<?php
namespace Elementor\Data\Editor\Globals\Commands;

use Elementor\Data\Base\Command as Base_Command;

class Colors extends Base_Command {
	public function get_name() {
		return 'colors';
	}

	protected function apply( $data ) {
		return [
			'test' => 'from colors.php',
		];
	}
}
