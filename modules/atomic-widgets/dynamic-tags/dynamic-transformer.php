<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Core\DynamicTags\Manager as Dynamic_Tags_Manager;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Attachment_Id_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Svg_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Transformer extends Transformer_Base {
	private Dynamic_Tags_Manager $dynamic_tags_manager;
	private Dynamic_Tags_Schemas $dynamic_tags_schemas;
	private Render_Props_Resolver $props_resolver;

	public function __construct(
		Dynamic_Tags_Manager $dynamic_tags_manager,
		Dynamic_Tags_Schemas $dynamic_tags_schemas,
		Render_Props_Resolver $props_resolver
	) {
		$this->dynamic_tags_manager = $dynamic_tags_manager;
		$this->dynamic_tags_schemas = $dynamic_tags_schemas;
		$this->props_resolver = $props_resolver;
	}

	public function transform( $value, Props_Resolver_Context $context ) {
		if ( ! isset( $value['name'] ) || ! is_string( $value['name'] ) ) {
			throw new \Exception( 'Dynamic tag name must be a string' );
		}

		if ( isset( $value['settings'] ) && ! is_array( $value['settings'] ) ) {
			throw new \Exception( 'Dynamic tag settings must be an array' );
		}

		$schema = $this->dynamic_tags_schemas->get( $value['name'] );

		$settings = $this->props_resolver->resolve(
			$schema,
			$value['settings'] ?? []
		);

		$content = $this->dynamic_tags_manager->get_tag_data_content( null, $value['name'], $settings );

		return $this->maybe_wrap_as_svg_src( $content, $context );
	}

	/**
	 * Tags from the image category resolve into an attachment array (`[ 'id' => .., 'url' => .. ]`).
	 * When such a tag is bound to an SVG prop, the result is wrapped back into an `svg-src` value,
	 * so it will be resolved again by the SVG transformer and rendered as inline SVG markup.
	 *
	 * @param mixed $content
	 *
	 * @return mixed
	 */
	private function maybe_wrap_as_svg_src( $content, Props_Resolver_Context $context ) {
		if ( ! is_array( $content ) || ! $this->is_svg_src_prop( $context ) ) {
			return $content;
		}

		$id = ! empty( $content['id'] ) ? (int) $content['id'] : null;
		$url = ( ! empty( $content['url'] ) && is_string( $content['url'] ) ) ? $content['url'] : null;

		if ( ! $id && ! $url ) {
			return null;
		}

		return Svg_Src_Prop_Type::generate( [
			'id' => $id ? Image_Attachment_Id_Prop_Type::generate( $id ) : null,
			'url' => $url ? Url_Prop_Type::generate( $url ) : null,
		] );
	}

	private function is_svg_src_prop( Props_Resolver_Context $context ): bool {
		$schema_prop_type = $context->get_schema_prop_type();

		if ( ! ( $schema_prop_type instanceof Union_Prop_Type ) ) {
			return false;
		}

		return $schema_prop_type->get_prop_type( Svg_Src_Prop_Type::get_key() ) instanceof Svg_Src_Prop_Type;
	}
}
