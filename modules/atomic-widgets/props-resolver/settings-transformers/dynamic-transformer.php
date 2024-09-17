<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\SettingsTransformers;

use Elementor\Core\DynamicTags\Manager as Dynamic_Manager;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Dynamic_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Transformer extends Transformer_Base {
	private Dynamic_Manager $dynamic_manager;

	public function __construct( Dynamic_Manager $dynamic_manager ) {
		$this->dynamic_manager = $dynamic_manager;
	}

	public function get_type(): string {
		return Dynamic_Prop_Type::get_key();
	}

	public function transform( $value ) {
		if ( ! isset( $value['name'] ) || ! is_string( $value['name'] ) ) {
			throw new \Exception( 'Dynamic tag name must be a string' );
		}

		if ( ! isset( $value['settings'] ) || ! is_array( $value['settings'] ) ) {
			throw new \Exception( 'Dynamic tag settings must be an array' );
		}

		return $this->dynamic_manager->get_tag_data_content( null, $value['name'], $value['settings'] );
	}
}
