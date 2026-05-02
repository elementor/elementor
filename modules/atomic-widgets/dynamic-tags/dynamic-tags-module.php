<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\DynamicTags\ImportExport\Dynamic_Transformer as Import_Export_Dynamic_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers_Registry;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Tags_Module {

	private static ?self $instance = null;

	public Dynamic_Tags_Editor_Config $registry;

	private Dynamic_Tags_Schemas $schemas;

	private function __construct() {
		$this->schemas  = new Dynamic_Tags_Schemas();
		$this->registry = new Dynamic_Tags_Editor_Config( $this->schemas );
	}

	public static function instance( $fresh = false ): self {
		if ( null === static::$instance || $fresh ) {
			static::$instance = new static();
		}

		return static::$instance;
	}

	public static function fresh(): self {
		return static::instance( true );
	}

	public function register_hooks() {
		add_filter(
			'elementor/editor/localize_settings',
			fn( array $settings ) => $this->add_atomic_dynamic_tags_to_editor_settings( $settings )
		);

		add_filter(
			'elementor/atomic-widgets/props-schema',
			fn( array $schema ) => Dynamic_Prop_Types_Mapping::make()->get_extended_schema( $schema )
		);

		add_filter(
			'elementor/atomic-widgets/styles/schema',
			fn( array $schema ) => Dynamic_Prop_Types_Mapping::make()->get_extended_style_schema( $schema ),
			8,
			2
		);

		add_action(
			'elementor/atomic-widgets/settings/transformers/register',
			fn ( $transformers, $prop_resolver ) => $this->register_transformers( $transformers, $prop_resolver ),
			10,
			2
		);

		add_action(
			'elementor/atomic-widgets/styles/transformers/register',
			fn ( $transformers, $prop_resolver ) => $this->register_transformers( $transformers, $prop_resolver ),
			10,
			2
		);

		add_action(
			'elementor/atomic-widgets/import/transformers/register',
			fn ( $transformers ) => $this->register_import_export_transformer( $transformers )
		);

		add_action(
			'elementor/atomic-widgets/export/transformers/register',
			fn ( $transformers ) => $this->register_import_export_transformer( $transformers )
		);
	}

	private function add_atomic_dynamic_tags_to_editor_settings( $settings ) {
		if ( isset( $settings['dynamicTags']['tags'] ) ) {
			$settings['atomicDynamicTags'] = [
				'tags'   => $this->registry->get_tags(),
				'groups' => Plugin::$instance->dynamic_tags->get_config()['groups'],
			];
		}

		return $settings;
	}

	private function register_transformers( Transformers_Registry $transformers, Render_Props_Resolver $props_resolver ) {
		$transformers->register(
			Dynamic_Prop_Type::get_key(),
			new Dynamic_Transformer(
				Plugin::$instance->dynamic_tags,
				$this->schemas,
				$props_resolver
			)
		);
	}

	private function register_import_export_transformer( Transformers_Registry $transformers ) {
		$transformers->register(
			Dynamic_Prop_Type::get_key(),
			new Import_Export_Dynamic_Transformer()
		);
	}
}
