<?php

namespace Elementor\Core\Logger\Items;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Base implements Log_Item_Interface {

	const FORMAT = 'date [type X times][meta] message';

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
		$this->meta = empty( $args['meta'] ) ? [] : $args['meta'];
	}

	public function __get( $name ) {
		if ( property_exists( $this, $name ) ) {
			return $this->{$name};
		}

		return '';
	}

	public function __toString() {
		$vars = get_object_vars( $this );
		$vars['meta'] = empty( $vars['meta'] ) ? 'No meta' : print_r( $vars['meta'], true );
		return strtr( static::FORMAT, $vars );
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

	public function get_name() {
		return 'Base';
	}
}
