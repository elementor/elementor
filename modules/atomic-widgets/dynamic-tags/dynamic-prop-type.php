<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\PropTypes\Transformable_Prop_Type;
use Elementor\Modules\AtomicWidgets\Settings_Validator;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Prop_Type extends Transformable_Prop_Type {

	/**
	 * Return a tuple that lets the developer ignore the dynamic prop type in the props schema
	 * using `Prop_Type::add_meta()`, e.g. `String_Prop_Type::make()->add_meta( Dynamic_Prop_Type::ignore() )`.
	 */
	public static function ignore(): array {
		return [ 'dynamic', false ];
	}

	public static function get_key(): string {
		return 'dynamic';
	}

	public function categories( array $categories ) {
		$this->settings['categories'] = $categories;

		return $this;
	}

	public function get_categories() {
		return $this->settings['categories'] ?? [];
	}

	protected function validate_value( $value ): void {
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

		$tag = Dynamic_Tags_Module::instance()->registry->get_tag( $value['name'] );

		if ( ! $tag ) {
			throw new \Exception( "Dynamic tag `{$value['name']}` does not exist" );
		}

		if ( ! $this->is_tag_in_supported_categories( $tag ) ) {
			throw $this->unsupported_tag( $tag );
		}

		$validator = Settings_Validator::make( $tag['props_schema'] );

		[ $is_valid, , $errors ] = $validator->validate( $value['settings'] );

		if ( ! $is_valid ) {
			$errors = join( ', ', $errors );

			throw new \Exception( 'Dynamic tag settings validation failed. Invalid keys: ' . $errors );
		}
	}

	private function is_tag_in_supported_categories( array $tag ): bool {
		$intersection = array_intersect(
			$tag['categories'],
			$this->get_categories()
		);

		return ! empty( $intersection );
	}

	private function unsupported_tag( array $tag ): \Exception {
		$tag_categories = implode( ', ', $tag['categories'] );
		$prop_categories = implode( ', ', $this->get_categories() );

		return new \Exception( "Dynamic tag `{$tag['name']}` categories ($tag_categories) are not in supported categories ($prop_categories)" );
	}
}
