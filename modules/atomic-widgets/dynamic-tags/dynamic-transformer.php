<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Core\DynamicTags\Manager as Dynamic_Tags_Manager;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Transformer extends Transformer_Base {
	private Dynamic_Tags_Manager $dynamic_tags_manager;
	private Dynamic_Tags_Schemas $dynamic_tags_schemas;
	private Render_Props_Resolver $props_resolver;
	private Dynamic_Tags_Editor_Config $editor_config;

	public function __construct(
		Dynamic_Tags_Manager $dynamic_tags_manager,
		Dynamic_Tags_Schemas $dynamic_tags_schemas,
		Render_Props_Resolver $props_resolver,
		Dynamic_Tags_Editor_Config $editor_config
	) {
		$this->dynamic_tags_manager = $dynamic_tags_manager;
		$this->dynamic_tags_schemas = $dynamic_tags_schemas;
		$this->props_resolver = $props_resolver;
		$this->editor_config = $editor_config;
	}

	public function transform( $value, $context ) {
		if ( ! isset( $value['name'] ) || ! is_string( $value['name'] ) ) {
			throw new \Exception( 'Dynamic tag name must be a string' );
		}

		if ( isset( $value['settings'] ) && ! is_array( $value['settings'] ) ) {
			throw new \Exception( 'Dynamic tag settings must be an array' );
		}

		$tag = $this->editor_config->get_tag( $value['name'] );

		if ( $tag && $context->get_key() && $context->get_shared_context() ) {
			$context->get_shared_context()->store_field_metadata( $context->get_key(), [
				'dynamic_group' => $tag['group'],
				'dynamic_tag' => $tag['name'],
			] );
		}

		$schema = $this->dynamic_tags_schemas->get( $value['name'] );

		$settings = $this->props_resolver->resolve(
			$schema,
			$value['settings'] ?? []
		);

		return $this->dynamic_tags_manager->get_tag_data_content( null, $value['name'], $settings );
	}
}
