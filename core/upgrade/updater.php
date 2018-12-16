<?php

namespace Elementor\Core\Upgrade;

use Elementor\Core\Base\Background_Task;

defined( 'ABSPATH' ) || exit;

class Updater extends Background_Task {

	protected function format_callback_log( $item ) {
		return $this->manager->get_plugin_label() . '/Upgrades - ' . $item['callback'][1];
	}
}
