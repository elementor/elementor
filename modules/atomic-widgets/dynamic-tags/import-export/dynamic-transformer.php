<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags\ImportExport;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ): ?array {
		if ( empty( $value['name'] ) || ! is_string( $value['name'] ) ) {
			return null;
		}

		$tag = Dynamic_Tags_Module::instance()->registry->get_tag( $value['name'] );

		if ( ! $tag ) {
			return null;
		}

		$group = $value['group'] ?? $tag['group'] ?? '';

		return Dynamic_Prop_Type::generate( [
			'name' => $value['name'],
			'group' => $group,
			'settings' => $value['settings'] ?? [],
		], $context->is_disabled() );
	}
}
