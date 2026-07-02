<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Export;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Svg_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Svg_Src_Export_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ): ?array {
		if ( ! empty( $value['url'] ) ) {
			return Svg_Src_Prop_Type::generate( [
				'id'  => null,
				'url' => $value['url'],
			], $context->is_disabled() );
		}

		if ( ! empty( $value['id'] ) && ! empty( $value['id']['value'] ) ) {
			$image = wp_get_attachment_image_src( $value['id']['value'], 'full' );

			if ( ! $image ) {
				return null;
			}

			[ $src ] = $image;

			return Svg_Src_Prop_Type::generate( [
				'id'  => $value['id'],
				'url' => Url_Prop_Type::generate( $src ),
			], $context->is_disabled() );
		}

		return null;
	}
}
