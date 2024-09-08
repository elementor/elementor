<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Prop_Type extends Transformable_Prop_Type {

	public static function get_key(): string {
		return 'dynamic';
	}

	public function categories( array $categories ) {
		$this->settings['categories'] = $categories;

		return $this;
	}

	public function validate_value( $value ): void {
		if ( ! isset( $value['name'] ) ) {
			throw new \Exception( 'Property `name` is required' );
		}

		if ( ! is_string( $value['name'] ) ) {
			throw new \Exception( 'Property `name` must be a string' );
		}

		if ( ! isset( $value['settings'] ) ) {
			throw new \Exception( 'Property `settings` is required' );
		}

		if ( ! is_array( $value['settings'] ) ) {
			throw new \Exception( 'Property `settings` must be an array' );
		}

		if ( ! Plugin::$instance->dynamic_tags->get_tag_info( $value['name'] ) ) {
			throw new \Exception( "Dynamic tag `{$value['name']}` does not exist" );
		}

		// TODO: Validate the settings against the schema using the same method from the save process.
	}
}
