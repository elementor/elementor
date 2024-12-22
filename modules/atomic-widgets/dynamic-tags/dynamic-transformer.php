<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Core\DynamicTags\Manager as Dynamic_Manager;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Transformer extends Transformer_Base {
	private Dynamic_Manager $dynamic_manager;

	public function __construct( Dynamic_Manager $dynamic_manager ) {
		$this->dynamic_manager = $dynamic_manager;
	}

	public function transform( $value, $key ) {
		if ( ! isset( $value['name'] ) || ! is_string( $value['name'] ) ) {
			throw new \Exception( 'Dynamic tag name must be a string' );
		}

		if ( isset( $value['settings'] ) && ! is_array( $value['settings'] ) ) {
			throw new \Exception( 'Dynamic tag settings must be an array' );
		}

		return $this->dynamic_manager->get_tag_data_content(
			null,
			$value['name'],
			$value['settings'] ?? []
		);
	}
}
