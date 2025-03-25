<?php
namespace Elementor\Modules\GlobalClasses\Usage;

use Elementor\Modules\Global_Classes\Usage\Applied_Global_Classes_Usage;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\System_Info\Reporters\Base as Base_Reporter;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_Reporter extends Base_Reporter {
	public function get_title() {
		return esc_html__( 'Global Classes', 'elementor' );
	}

	public function get_fields() {
		return [
			'classes' => '',
		];
	}

	public function get_classes(): array {
		$usage_data = '';

		$data = $this->get_classes_usage();

		foreach ( $data as $value ) {
			$value_text = is_array( $value['value'] ) ? implode( PHP_EOL, array_map( function ( $value, $key ) {
				return $key . ': ' . $value;
			}, $value['value'], array_keys( $value['value'] ) ) ) : $value['value'];

			$usage_data .= '<tr><td>' . $value['name'] . '</td><td>' . $value_text . '</td></tr>';
		}

		return [
			'value' => $usage_data,
		];
	}

	public function get_raw_classes(): array {
		$usage_data = PHP_EOL;

		$data = $this->get_classes_usage();

		foreach ( $data as $value ) {
			$value_text = is_array( $value['value'] ) ? implode( PHP_EOL, array_map( function ( $value, $key ) {
				return $key . ': ' . $value;
			}, $value['value'], array_keys( $value['value'] ) ) ) : $value['value'];

			$usage_data .= "\t" . $value['name'] . ': ' . $value_text . PHP_EOL;
		}

		return [
			'value' => $usage_data,
		];
	}

	private function get_classes_usage() {
		$usage = [];

		$usage['count'] = [
			'name' => 'Classes Count',
			'value' => Global_Classes_Repository::make()->all()->get_items()->count(),
		];

		$applied_classes_data = ( new Applied_Global_Classes_Usage() )->get();

		if ( ! $applied_classes_data['count'] ) {
			return $usage;
		}

		$usage['applied_classes'] = [
			'name' => 'Applied Classes',
			'value' => $applied_classes_data['count'],
		];

		$usage['applied_classes_element_types'] = [
			'name' => 'Applied Classes Per Element Type',
			'value' => $applied_classes_data['element_types'],
		];

		return $usage;
	}
}
