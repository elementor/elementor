<?php

namespace Elementor\Core\Logger\Loggers;

use Elementor\Core\Logger\Items\Base as Log_Item;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Base {

	const LEVEL_INFO = 'info';
	const LEVEL_NOTICE = 'notice';
	const LEVEL_WARNING = 'warning';
	const LEVEL_ERROR = 'error';

	abstract protected function save_log( Log_Item $item );

	public function log( $item, $type = self::LEVEL_INFO ) {
		if ( ! $item instanceof Log_Item ) {
			$item = $this->create_item( $item, $type );
		}

		$this->save_log( $item );
	}

	public function info( $message ) {
		$this->log( $message, self::LEVEL_INFO );
	}

	public function notice( $message ) {
		$this->log( $message, self::LEVEL_NOTICE );
	}

	public function warning( $message ) {
		$this->log( $message, self::LEVEL_WARNING );
	}

	public function error( $message ) {
		$this->log( $message, self::LEVEL_ERROR );
	}

	private function create_item( $message, $type ) {
		$item = new Log_Item( [
			'message' => $message,
			'type' => $type,
		] );

		return $item;
	}
}
