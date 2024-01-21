<?php

namespace Elementor\Modules\EditorEvents;

use Elementor\Core\Base\Module as BaseModule;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	public function get_name() {
		return 'editor-events';
	}
}
