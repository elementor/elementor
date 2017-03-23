<?php
namespace Elementor\System_Info\Classes\Abstracts;

use Elementor\System_Info\Helpers\Model_Helper;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Base_Reporter {

	private $_properties;

	abstract public function get_title();

	abstract public function get_fields();

	public function is_enabled() {
		return true;
	}

	final public function get_report() {
		$result = [];

		foreach ( $this->get_fields() as $field_name => $field_label ) {
			$method = 'get_' . $field_name;

			if ( ! method_exists( $this, $method ) ) {
				return new \WP_error( "Getter method for the field '{$field_name}' wasn't found in " . get_called_class() );
			}

			$reporter_field = [
				'name' => $field_name,
				'label' => $field_label,
			];

			$reporter_field = array_merge( $reporter_field, $this->$method() );
			$result[ $field_name ] = $reporter_field;
		}

		return $result;
	}

	public static function get_properties_keys() {
		return [
			'name',
			'fields',
		];
	}

	final public static function filter_possible_properties( $properties ) {
		return Model_Helper::filter_possible_properties( self::get_properties_keys(), $properties );
	}

	final public function set_properties( $key, $value = null ) {
		if ( is_array( $key ) ) {
			$key = self::filter_possible_properties( $key );

			foreach ( $key as $sub_key => $sub_value ) {
				$this->set_properties( $sub_key, $sub_value );
			}

			return;
		}

		if ( ! in_array( $key, self::get_properties_keys() ) ) {
			return;
		}

		$this->_properties[ $key ] = $value;
	}

	public function __construct( $properties = null ) {
		$this->_properties = array_fill_keys( self::get_properties_keys(), null );

		if ( $properties ) {
			$this->set_properties( $properties, null );
		}
	}
}
