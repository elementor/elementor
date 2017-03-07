<?php
namespace Elementor\Debugger;

use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Debugger_Reporter extends Base_Reporter {

	public function get_title() {
		return 'Debugger';
	}

	public function get_fields() {
		return [
			'errors' => 'Errors',
		];
	}

	public function get_errors() {
		$log = get_option( Debugger::OPTION_NAME, [] );
		$log_string = '';

		foreach ( $log as $index => $item ) {
			$item['date'] = date( 'Y-m-d H:i', (int) $item['date'] );

			$log_string .= strtr( 'date: message in url:line:column', $item ) . PHP_EOL;
		}

		return [
			'value' => $log_string,
		];
	}
}
