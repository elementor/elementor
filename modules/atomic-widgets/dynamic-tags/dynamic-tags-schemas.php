<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Core\DynamicTags\Base_Tag;
use Elementor\Modules\AtomicWidgets\PropTypes\V3_Converter;
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
		$v3_converter = new V3_Converter();

		foreach ( $tag->get_controls() as $control ) {
			if ( ! isset( $control['type'] ) || 'section' === $control['type'] ) {
				continue;
			}

			$prop_type = $v3_converter->convert_control_to_prop_type( $control );

			if ( ! $prop_type ) {
				continue;
			}

			$this->tags_schemas[ $tag_name ][ $control['name'] ] = $prop_type;
		}

		$this->tags_schemas[ $tag_name ] = $v3_converter->add_dependencies_to_schema(
			$tag->get_controls(),
			$this->tags_schemas[ $tag_name ]
		);

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
}
