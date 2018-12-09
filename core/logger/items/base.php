<?php

namespace Elementor\Core\Logger\Items;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Base {

	const FORMAT = ':date [:type] :message';

	protected $date;
	protected $type;
	protected $message;
	protected $meta = [];

	protected $times = 0;
	protected $times_dates = [];

	public function __construct( $args ) {
		$this->date = current_time( 'mysql' );
		$this->message = $args['message'];
		$this->type = $args['type'];
		$this->meta = $args['meta'];
	}

	public function __get( $name ) {
		if ( property_exists( $this, $name ) ) {
			return $this->{$name};
		}

		return '';
	}

	public function __toString() {
		return strtr( self::FORMAT, (array) $this );
	}

	public function get_fingerprint() {
		$clone = clone $this;
		$clone->date = '';
		return md5( $clone );
	}

	/**
	 * @param self $item
	 */
	public function increase_times( $item ) {
		$this->times++;
		$this->times_dates[] = $item->date;
	}
}
