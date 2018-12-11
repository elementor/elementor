<?php

namespace Elementor\Core\Logger\Loggers;

use \Elementor\Core\Logger\Items\Log_Item_Interface as Log_Item;

interface Logger_Interface {
	const LEVEL_INFO = 'info';
	const LEVEL_NOTICE = 'notice';
	const LEVEL_WARNING = 'warning';
	const LEVEL_ERROR = 'error';

	/**
	 * @param string $message
	 * @param string $type
	 * @param array  $meta
	 *
	 * @return void
	 */
	public function log( $message, $type = self::LEVEL_INFO, $meta = [] );

	/**
	 * @param string $message
	 * @param array $meta
	 *
	 * @return void
	 */
	public function info( $message, $meta = [] );

	/**
	 * @param string $message
	 * @param array $meta
	 *
	 * @return void
	 */
	public function notice( $message, $meta = [] );

	/**
	 * @param string $message
	 * @param array $meta
	 *
	 * @return void
	 */
	public function warning( $message, $meta = [] );

	/**
	 * @param string $message
	 * @param array $meta
	 *
	 * @return void
	 */
	public function error( $message, $meta = [] );

	/**
	 * @return Log_Item[]
	 */
	public function get_formatted_log_entries();

}
