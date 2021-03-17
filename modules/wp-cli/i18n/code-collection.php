<?php
namespace Elementor\Modules\WpCli\i18n;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Code_Collection {
	private $code;

	private $current_line = [];
	public $current_cursor_inline = [];

	private $collector = '';
	private $collector_is_collecting = false;
	private $collector_skip_and_replace = false;

	public function __construct( $code ) {
		$this->code = $code;
	}

	public function for_each_line( callable $callback ) {
		$this->current_line = [
			'index' => 0,
			'code' => null,
			'length' => 0,
		];

		foreach ( explode( PHP_EOL, $this->code ) as $current_code_line ) {
			$this->current_line['code'] = $current_code_line;
			$this->current_line['length'] = strlen( $current_code_line );

			$callback( $this );

			++$this->current_line['index'];
		}
	}

	public function for_each_cursor_inline( callable $callback ) {
		$this->current_cursor_inline = [
			'index' => 0,
			'value' => null,
		];

		$i = &$this->current_cursor_inline['index'];
		for ( $i = 0; $i < $this->current_line['length']; ++$i ) {
			$this->current_cursor_inline['value'] = $this->current_line['code'][ $i ];

			if ( false !== $this->collector_skip_and_replace ) {
				$this->collector[ strlen( $this->collector ) - 1 ] = $this->collector_skip_and_replace;
				$this->collector_skip_and_replace = false;
				continue;
			}

			$callback( $this );

			if ( $this->collector_is_collecting ) {
				$this->cursor_collect();
			}
		}
	}

	public function line_contains( $needle ) {
		return strstr( $this->current_line['code'], $needle );
	}

	public function cursor_includes( array $needle ) {
		return in_array( $this->get_cursor_value(), $needle );
	}

	public function cursor_includes_string_delimiter() {
		return "'" === $this->get_cursor_value();
	}

	public function cursor_collect() {
		$this->collector .= $this->get_cursor_value();
	}

	public function cursor_start_collecting() {
		$this->collector_is_collecting = true;
	}

	public function cursor_stop_collecting() {
		// Since what it starting collect it always include the "'" in the beginning.
		$this->collector = ltrim( $this->collector, "'" );

		$this->collector_is_collecting = false;
	}

	public function cursor_is_collecting() {
		return $this->collector_is_collecting;
	}

	public function cursor_reset_collector() {
		$this->collector = '';
	}

	public function cursor_collector_skip_and_replace( $character ) {
		$this->collector_skip_and_replace = $character;
	}

	public function get_collector() {
		return $this->collector;
	}

	public function get_line_code() {
		return $this->current_line['code'];
	}

	public function get_line_index() {
		return $this->current_line['index'];
	}

	public function get_cursor_value() {
		return $this->current_cursor_inline['value'];
	}

	public function get_cursor_next_value() {
		return $this->current_line['code'][ $this->current_cursor_inline['index'] + 1 ];
	}
}
