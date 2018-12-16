<?php
namespace Elementor\Core\Logger\Items;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

interface Log_Item_Interface extends \JsonSerializable {

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
	 * @param $str
	 * @return Log_Item_Interface | null
	 */
	public static function from_json( $str );

	/**
	 * @param string $format
	 * @return string
	 */
	public function format( $format = 'html' );

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
