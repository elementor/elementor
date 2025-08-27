<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Core\DynamicTags\Base_Tag;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Tags_Schemas {
	private array $tags_schemas = [];

	public function get( string $tag_name ) {
		if ( isset( $this->tags_schemas[ $tag_name ] ) ) {
			return $this->tags_schemas[ $tag_name ];
		}

		$tag = $this->get_tag( $tag_name );

		$this->tags_schemas[ $tag_name ] = [];

		foreach ( $tag->get_controls() as $control ) {
			if ( ! isset( $control['type'] ) || 'section' === $control['type'] ) {
				continue;
			}

			$prop_type = $this->convert_control_to_prop_type( $control );

			if ( ! $prop_type ) {
				continue;
			}

			$this->tags_schemas[ $tag_name ][ $control['name'] ] = $prop_type;
		}

		return $this->tags_schemas[ $tag_name ];
	}

	private function get_tag( string $tag_name ): Base_Tag {
		$tag_info = Plugin::$instance->dynamic_tags->get_tag_info( $tag_name );

		if ( ! $tag_info || empty( $tag_info['instance'] ) ) {
			throw new \Exception( 'Tag not found' );
		}

		if ( ! $tag_info['instance'] instanceof Base_Tag ) {
			throw new \Exception( 'Tag is not an instance of Tag' );
		}

		return $tag_info['instance'];
	}

	private function convert_control_to_prop_type( array $control ) {
		$control_type = $control['type'];

		switch ( $control_type ) {
			case 'text':
				return String_Prop_Type::make()
					->default( $control['default'] ?? null );

			case 'select':
				return String_Prop_Type::make()
					->default( $control['default'] ?? null )
					->enum( array_keys( $control['options'] ?? [] ) );

			case 'number':
				return Number_Prop_Type::make()
					->default( $control['default'] ?? null );

			case 'switcher':
				$default = $control['default'];

				return Boolean_Prop_Type::make()
					->default( 'yes' === $default || true === $default );

			default:
				return null;
		}
	}
}
