<?php
namespace Elementor\Data\Editor\Globals\Commands;

use Elementor\Data\Base\Command as Base_Command;
use Elementor\Data\Base\Traits\Get;

class Test extends Base_Command {
	use Get;

	public function get_name() {
		return 'test';
	}


	public function apply_get( $data ) {
		return [
			'apply_get' => 'done',
		];
	}

	protected function after_apply_get( $data, $result ) {
		$result['after_apply_get'] = 'done';
		return $result;
	}
}
