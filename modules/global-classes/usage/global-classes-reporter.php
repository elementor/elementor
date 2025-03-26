<?php
namespace Elementor\Modules\GlobalClasses\Usage;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\Global_Classes\Usage\Applied_Global_Classes_Usage;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\System_Info\Reporters\Base as Base_Reporter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_Reporter extends Base_Reporter {
	public function get_title() {
		return esc_html__( 'Global Classes', 'elementor' );
	}

	public function get_fields() {
		return [
			'global_classes' => '',
		];
	}

	public function get_global_classes(): array {
		$usage_data = '';

		$data = $this->get_classes_usage();

		foreach ( $data as $value ) {
			$text_value = is_array( $value['value'] )
				? Collection::make( $value['value'] )
					->map( fn ( $value, $key ) => $key . ': ' . $value )
					->implode( PHP_EOL )
				: $value['value'];

			$usage_data .= '<tr><td>' . $value['name'] . '</td><td>' . $text_value . '</td></tr>';
		}

		return [
			'value' => $usage_data,
		];
	}

	public function get_raw_global_classes(): array {
		$usage_data = PHP_EOL;

		$data = $this->get_classes_usage();

		foreach ( $data as $value ) {
			$text_value = is_array( $value['value'] )
				? Collection::make( $value['value'] )
					->map( fn ( $value, $key ) => $key . ': ' . $value )
					->implode( PHP_EOL )
				: $value['value'];

			$usage_data .= "\t" . $value['name'] . ': ' . $text_value . PHP_EOL;
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

		if ( ! $applied_classes_data['total_count'] ) {
			return $usage;
		}

		$usage['applied_classes'] = [
			'name' => 'Applied Classes',
			'value' => $applied_classes_data['total_count'],
		];

		$usage['applied_classes_per_element_types'] = [
			'name' => 'Applied Classes Per Element Type',
			'value' => $applied_classes_data['count_per_type'],
		];

		return $usage;
	}
}
