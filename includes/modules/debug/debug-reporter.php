<?php
namespace Elementor\Modules\Debug;

use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Debug_Reporter extends Base_Reporter {

	public function get_title() {
		return 'Debug';
	}

	public function get_fields() {
		return [
			'errors' => 'Errors',
		];
	}

	public function get_errors() {
		$log = get_option( Debug::OPTION_NAME, [] );

		$log = array_reverse( $log );

		$log_string = '';

		foreach ( $log as $index => $item ) {
			$item['date'] = date( 'Y-m-d H:i P', $item['date'] );

			$log_string .= "\n\t\t$item[message]\n\t\t\tat $item[url] - $item[line]:$item[column]\n\t\t\t$item[date]\n";

			if ( $item['custom'] ) {
				foreach ( $item['custom'] as $key => $value ) {
					$log_string .= "\t\t\t$key: $value\n";
				}
			}

			if ( ! empty( $item['times'] ) ) {
				$log_string .= "\t\t\tx $item[times] times\n";
			}
		}

		if ( ! $log_string ) {
			$log_string = __( 'There are no errors to display', 'elementor' );
		}

		return [
			'value' => $log_string,
		];
	}
}
