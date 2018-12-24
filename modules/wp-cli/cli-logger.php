<?php
namespace Elementor\Modules\WpCli;

use Elementor\Core\Logger\Loggers\Db;
use Elementor\Core\Logger\Items\Log_Item_Interface as Log_Item_Interface;

class Cli_Logger extends Db {
	public function save_log( Log_Item_Interface $item ) {
		\WP_CLI::log( $item );


		parent::save_log( $item );
	}
}
