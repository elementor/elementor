<?php

namespace Elementor\Modules\Sdk\V4\Builder\Elements;

use Elementor\Modules\Sdk\V4\Builder\SUPPORTED_PROPERTY_TYPES;

trait Schema_Properties_Validator {

	protected function validate_select_property( $property ) {
		if ( ! isset( $property['options'] ) ) {
			throw new \InvalidArgumentException( 'Select property must have options' );
		}

		if ( ! is_array( $property['options'] ) ) {
			throw new \InvalidArgumentException( 'Select property options must be an array' );
		}

		foreach ( $property['options'] as $option ) {
			if ( ! isset( $option['value'] ) ) {
				throw new \InvalidArgumentException( 'Select property option must have a value' );
			}
			if ( ! isset( $option['label'] ) ) {
				$option['label'] = $option['value'];
			}
		}
	}

	protected function validate_property( $property ) {
		if ( ! isset( $property['type'] ) ) {
			throw new \InvalidArgumentException( 'Property must have a type' );
		}

		SUPPORTED_PROPERTY_TYPES::is( $property['type'] );

		if ( ! isset( $property['name'] ) ) {
			throw new \InvalidArgumentException( 'Property must have a name' );
		}

		// Set default label
		if ( ! isset( $property['label'] ) ) {
			$property['label'] = $property['name'];
		}

		// Set default value
		if ( ! isset( $property['default'] ) ) {
			$property['default'] = null;
		}

		// In case of select - validate as select
		if ( $property['type'] === 'select' ) {
			$this->validate_select_property( $property );
		}
	}
}
