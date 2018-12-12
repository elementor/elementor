<?php

namespace Elementor\Core\Logger\Items;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Base implements Log_Item_Interface {
	const FORMAT = 'date [type X times] message [meta]';
	const TRACE_FORMAT = '#key: file(line): class type function()';
	const TRACE_LIMIT = 5;

	protected $date;
	protected $type;
	protected $message;
	protected $meta = [];

	protected $times = 0;
	protected $times_dates = [];
	protected $args = [];

	public function __construct( $args ) {
		$this->date = current_time( 'mysql' );
		$this->message = empty( $args['message'] ) ? '' : $args['message'];
		$this->type = empty( $args['type'] ) ? 'info' : $args['type'];
		$this->meta = empty( $args['meta'] ) ? [] : $args['meta'];
		$this->args = $args;

		$this->set_trace();
	}

	public function __get( $name ) {
		if ( property_exists( $this, $name ) ) {
			return $this->{$name};
		}

		return '';
	}

	public function __toString() {
		$vars = get_object_vars( $this );
		$vars['meta'] = empty( $vars['meta'] ) ? '' : var_export( $vars['meta'], true );
		return strtr( static::FORMAT, $vars );
	}

	public function get_fingerprint() {
		return md5( $this->type . $this->message . var_export( $this->meta, 1 ) );
	}

	public function increase_times( $item ) {
		$this->times++;
		$this->times_dates[] = $item->date;
	}

	public function format() {
		$trace = $this->format_trace();
		if( empty( $trace ) ) {
			return $this->__toString();
		}
		$copy = clone $this;
		$copy->meta['trace'] = $trace;
		return $copy->__toString();
	}

	public function get_name() {
		return 'Log';
	}

	private function format_trace() {
		$trace = empty( $this->meta['trace'] ) ? '' : $this->meta['trace'];

		$trace_str = '';
		if ( ! is_array( $trace ) ) {
			return $trace;
		}

		foreach ( $trace as $key => $trace_line ) {
			$trace_line['key'] = $key;
			$trace_str .=  PHP_EOL . strtr( self::TRACE_FORMAT, $trace_line );
			$trace_str .= empty( $trace_line['args'] ) ? '' : var_export( $trace_line['args'] );
		}

		return $trace_str;
	}

	private function set_trace() {
		if ( ! empty( $this->args['trace'] ) && true === $this->args['trace'] ) {
			$limit = empty( $this->args['trace_limit'] ) ? self::TRACE_LIMIT : $this->args['trace_limit'];

			$stack = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS );

			while ( ! empty( $stack ) && ! empty( $stack[0]['file'] ) && ( false !== strpos( $stack[0]['file'], 'core' . DIRECTORY_SEPARATOR . 'logger' ) ) ) {
				array_shift( $stack );
			}

			$this->meta['trace'] = array_slice( $stack, 0, $limit );
		} else {
			unset( $this->args['trace'] );
		}
	}
}
