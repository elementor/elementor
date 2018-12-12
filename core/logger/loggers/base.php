<?php

namespace Elementor\Core\Logger\Loggers;

use Elementor\Core\Logger\Items\Base as Log_Item;
use Elementor\Core\Logger\Items\Log_Item_Interface as Log_Item_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Base implements Logger_Interface {

	abstract protected function save_log( Log_Item_Interface $item );

	public function log( $item, $type = self::LEVEL_INFO, $args = [] ) {
		if ( ! $item instanceof Log_Item ) {
			$item = $this->create_item( $item, $type, $args );
		}
		$this->save_log( $item );
	}

	public function info( $message, $args = [] ) {
		$this->log( $message, self::LEVEL_INFO, $args );
	}

	public function notice( $message, $args = [] ) {
		$this->log( $message, self::LEVEL_NOTICE, $args );
	}

	public function warning( $message, $args = [] ) {
		$this->log( $message, self::LEVEL_WARNING, $args );
	}

	public function error( $message, $args = [] ) {
		$this->log( $message, self::LEVEL_ERROR, $args );
	}

	/**
	 * @param string $message
	 * @param string $type
	 * @param array  $args
	 *
	 * @return Log_Item_Interface
	 */
	private function create_item( $message, $type, $args = [] ) {
		$args['message'] = $message;
		$args['type'] = $type;

		$item = new Log_Item( $args );

		return $item;
	}
}
