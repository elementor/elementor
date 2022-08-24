<?php

namespace Elementor\Core\App\Modules\ImportExport\Runners\Revert;

use Elementor\Core\Utils\Collection;
use Elementor\Core\Utils\Plugins_Manager;
use Elementor\Core\Utils\Str;

class Plugins extends Revert_Runner_Base {

	public static function get_name() : string {
		return 'plugins';
	}

	public function should_revert( array $data ) {
		return false;
	}

	public function revert( array $data ) {}
}
