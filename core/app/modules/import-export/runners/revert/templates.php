<?php

namespace Elementor\Core\App\Modules\ImportExport\Runners\Revert;

use Elementor\Core\App\Modules\ImportExport\Utils as ImportExportUtils;
use Elementor\Core\Base\Document;
use Elementor\Core\Documents_Manager;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Utils;

class Templates extends Revert_Runner_Base {

	public static function get_name() : string {
		return 'templates';
	}

	public function should_revert( array $data ) {
		return false;
	}

	public function revert( array $data ) {
		return [];
	}
}
