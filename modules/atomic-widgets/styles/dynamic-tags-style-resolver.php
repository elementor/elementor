<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dynamic_Tags_Style_Resolver {
	public static function resolve_node( array $dynamic_node ): ?string {
		if ( ! Dynamic_Prop_Type::is_dynamic_prop_value( $dynamic_node ) ) {
			return null;
		}

		$tag_name = $dynamic_node['value']['name'] ?? null;
		$tag_settings = $dynamic_node['value']['settings'] ?? [];

		if ( ! $tag_name ) {
			return null;
		}

		$value = Plugin::$instance->dynamic_tags->get_tag_data_content( null, $tag_name, $tag_settings );

		if ( null === $value || '' === $value ) {
			return null;
		}

		return (string) $value;
	}
}
