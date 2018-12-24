<?php
namespace Elementor\Modules\WpCli;

use Elementor\Core\Logger\Loggers\Db;
use Elementor\Core\Logger\Items\Log_Item_Interface as Log_Item_Interface;

class Cli_Logger extends Db {
	public function save_log( Log_Item_Interface $item ) {

		switch ( $item->type ) {
			case self::LEVEL_WARNING:
				\WP_CLI::warning( $item->format() );
				break;
			case self::LEVEL_ERROR:
				\WP_CLI::error( $item->format(), false );
				break;
			default:
				\WP_CLI::log( $item->format() );
				break;
		}

		parent::save_log( $item );
	}
}
