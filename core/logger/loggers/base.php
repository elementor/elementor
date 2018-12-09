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

	public function log( $item, $type = self::LEVEL_INFO, $meta = [] ) {
		if ( ! $item instanceof Log_Item ) {
			$item = $this->create_item( $item, $type, $meta );
		}

		$this->save_log( $item );
	}

	public function info( $message, $meta = [] ) {
		$this->log( $message, self::LEVEL_INFO, $meta );
	}

	public function notice( $message, $meta = [] ) {
		$this->log( $message, self::LEVEL_NOTICE, $meta );
	}

	public function warning( $message, $meta = [] ) {
		$this->log( $message, self::LEVEL_WARNING, $meta );
	}

	public function error( $message, $meta = [] ) {
		$this->log( $message, self::LEVEL_ERROR, $meta );
	}

	private function create_item( $message, $type, $meta = [] ) {
		$item = new Log_Item( [
			'message' => $message,
			'type' => $type,
			'meta' => $meta,
		] );

		return $item;
	}
}
