<?php

namespace Elementor\Core\Logger\Items;

interface Log_Item_Interface {

	/**
	 * Log_Item_Interface constructor.
	 *
	 * @param array $args
	 */
	public function __construct( $args );

	/**
	 * @param string $name
	 *
	 * @return string
	 */
	public function __get( $name );

	/**
	 * @return string
	 */
	public function __toString();

	/**
	 * @return string
	 */
	public function format();

	/**
	 * @return string
	 */
	public function get_fingerprint();

	/**
	 * @param Log_Item_Interface $item
	 */
	public function increase_times( $item );

	/**
	 * @return string
	 */
	public function get_name();
}
