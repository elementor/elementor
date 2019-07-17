<?php
namespace Elementor\Modules\Usage;

use Elementor\System_Info\Classes\Abstracts\Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor usage report.
 *
 * Elementor system report handler class responsible for generating a report for
 * the user.
 *
 * @since 1.0.0
 */
class Usage_Reporter extends Base_Reporter {

	public function get_title() {
		return 'Elements Usage';
	}

	public function get_fields() {
		return [
			'usage' => '',
		];
	}

	public function get_usage() {
		/** @var \Elementor\Modules\Usage\Module $module */
		$module = Module::instance();
		$usage = '<tr>';

		foreach ( $module->get_formatted_usage() as $doc_type => $data ) {
			$usage .= '<td>' . $data['title'] . '</td><td>';

			foreach ( $data['elements'] as $element => $count ) {
				$usage .= $element . ': ' . $count . PHP_EOL;
			}

			$usage .= '</td></tr>';
		}

		$usage .= '</tr>';


		return [
			'value' => $usage,
		];
	}

	public function get_raw_usage() {
		/** @var \Elementor\Modules\Usage\Module $module */
		$module = Module::instance();
		$usage = PHP_EOL;

		foreach ( $module->get_formatted_usage() as $doc_type => $data ) {
			$usage .= "\t{$data['title']}" . PHP_EOL;

			foreach ( $data['elements'] as $element => $count ) {
				$usage .= "\t\t{$element} : {$count}" . PHP_EOL;
			}
		}

		return [
			'value' => $usage,
		];
	}
}
