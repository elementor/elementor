<?php

namespace Elementor\Core\Logger\Items;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Base implements Log_Item_Interface {

	const FORMAT = 'date [type] message [meta]';

	protected $date;
	protected $type;
	protected $message;
	protected $meta = '';

	protected $times = 0;
	protected $times_dates = [];

	public function __construct( $args ) {
		$this->date = current_time( 'mysql' );
		$this->message = $args['message'];
		$this->type = $args['type'];
		$this->meta = empty( $args['meta'] ) ? '' : print_r( $args['meta'], true );
	}

	public function __get( $name ) {
		if ( property_exists( $this, $name ) ) {
			return $this->{$name};
		}

		return '';
	}

	public function __toString() {
		return strtr( static::FORMAT, get_object_vars( $this ) );
	}

	public function get_fingerprint() {
		$clone = clone $this;
		$clone->date = '';
		return md5( $clone );
	}

	public function increase_times( $item ) {
		$this->times++;
		$this->times_dates[] = $item->date;
	}

	public function format() {
		return $this->__toString();
	}
}
