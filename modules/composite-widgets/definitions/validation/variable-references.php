<?php

namespace Elementor\Modules\CompositeWidgets\Definitions\Validation;

use Elementor\Modules\Variables\Utils\Variable_Type_Keys;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Variable_References {
	const VARIABLES_MODULE = 'variables';

	private ?array $variable_type_keys = null;

	/**
	 * @return string[] Dot paths of every PropValue whose $$type is a global variable type.
	 */
	public function find_paths( array $data, string $path ): array {
		if ( isset( $data['$$type'] ) && in_array( $data['$$type'], $this->get_variable_type_keys(), true ) ) {
			return [ $path ];
		}

		$paths = [];

		foreach ( $data as $key => $value ) {
			if ( is_array( $value ) ) {
				$paths = array_merge( $paths, $this->find_paths( $value, "{$path}.{$key}" ) );
			}
		}

		return $paths;
	}

	private function get_variable_type_keys(): array {
		if ( null === $this->variable_type_keys ) {
			$this->variable_type_keys = array_values( array_unique( array_merge(
				Variable_Type_Keys::get_all(),
				$this->get_registered_variable_type_keys()
			) ) );
		}

		return $this->variable_type_keys;
	}

	private function get_registered_variable_type_keys(): array {
		$variables_module = Plugin::$instance->modules_manager->get_modules( self::VARIABLES_MODULE );

		if ( ! $variables_module || ! method_exists( $variables_module, 'get_variable_types_registry' ) ) {
			return [];
		}

		return array_keys( $variables_module->get_variable_types_registry()->all() );
	}
}
