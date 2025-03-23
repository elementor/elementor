<?php
namespace Elementor\Modules\GlobalClasses;

use Elementor\Modules\System_Info\Reporters\Base as Base_Reporter;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Classes_Reporter extends Base_Reporter {
	public function get_title() {
		return esc_html__( 'Classes', 'elementor' );
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

	public static function get_classes_usage() {
		$usage = [];

		$usage['count'] = [
			'name' => 'Classes Count',
			'value' => self::get_classes_count(),
		];

		$applied_classes_data = self::get_applied_classes_data();

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

	public static function get_classes_count() {
		$classes = Global_Classes_Repository::make()->all()->get_items()->all();

		return count( $classes );
	}

	/**
	 * Get data about how global classes are applied across Elementor elements.
	 *
	 * @return array{count: int, element_types: array<string, int>} Statistics about applied global classes
	 */
	public static function get_applied_classes_data() {
		$global_class_ids = Global_Classes_Repository::make()->all()->get_items()->keys()->all();
		$elementor_posts = self::get_elementor_posts();
		$stats = [
			'total_count' => 0,
			'element_types' => [],
		];

		foreach ( $elementor_posts as $post ) {
			$document = Plugin::$instance->documents->get( $post->ID );
			$element_data = $document->get_json_meta( '_elementor_data' );
			$raw_data = $document->get_elements_raw_data( $element_data );

			self::process_elements_data( $raw_data, $global_class_ids, $stats );
		}

		return [
			'count' => $stats['total_count'],
			'element_types' => $stats['element_types'],
		];
	}

	/**
	 * Process elements data to collect class usage statistics.
	 *
	 * @param array $elements_data Raw elements data
	 * @param array $global_class_ids List of global class IDs
	 * @param array $stats Statistics array to update
	 */
	private static function process_elements_data( $elements_data, $global_class_ids, &$stats ) {
		Plugin::$instance->db->iterate_data( $elements_data, function( $element ) use ( $global_class_ids, &$stats ) {
			if ( ! self::has_classes( $element ) ) {
				return;
			}

			$element_classes = $element['settings']['classes']['value'];
			$element_type = self::get_element_type( $element );

			foreach ( $element_classes as $class ) {
				if ( in_array( $class, $global_class_ids, true ) ) {
					$stats['total_count']++;

					if ( ! isset( $stats['element_types'][ $element_type ] ) ) {
						$stats['element_types'][ $element_type ] = 0;
					}
					$stats['element_types'][ $element_type ]++;
				}
			}
		});
	}

	/**
	 * Check if element has classes defined.
	 *
	 * @param array $element Element data
	 * @return bool Whether element has classes
	 */
	private static function has_classes( $element ) {
		return isset( $element['settings']['classes'] )
			&& ! empty( $element['settings']['classes']['value'] );
	}

	/**
	 * Get the type of an element.
	 *
	 * @param array $element Element data
	 * @return string Element type
	 */
	private static function get_element_type( $element ) {
		return $element['elType'] === 'widget' ? $element['widgetType'] : $element['elType'];
	}

	private static function get_elementor_posts() {
		$args = wp_parse_args( [
			'post_type' => 'any',
			'post_status' => [ 'publish' ],
			'posts_per_page' => '-1',
			'meta_key' => '_elementor_edit_mode',
			'meta_value' => 'builder',
		] );

		$query = new \WP_Query( $args );

		return $query->get_posts();
	}
}
