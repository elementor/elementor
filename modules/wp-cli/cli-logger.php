<?php
namespace Elementor\Modules\WpCli;

use Elementor\Core\Logger\Loggers\Base as Loggers_Base;

use Elementor\Core\Logger\Items\Log_Item_Interface as Log_Item_Interface;

class Cli_Logger extends Loggers_Base {
	public function save_log( Log_Item_Interface $item ) {
		\WP_CLI::log( $item );
	}

	protected function get_log() {
		return [];
	}
}
