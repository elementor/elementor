<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers_Registry;
use Elementor\Plugin;

class Dynamic_Tags_Module {

	private static ?self $instance = null;

	public Dynamic_Tags_Registry $registry;

	private function __construct() {
		$this->registry = new Dynamic_Tags_Registry();
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
			fn( array $schema ) => Dynamic_Prop_Types_Mapping::make()->add_to_schema( $schema )
		);

		add_action(
			'elementor/atomic-widgets/settings/transformers/register',
			fn ( $transformers ) => $this->register_transformers( $transformers )
		);
	}

	private function add_atomic_dynamic_tags_to_editor_settings( $settings ) {
		if ( isset( $settings['dynamicTags']['tags'] ) ) {
			$settings['atomicDynamicTags'] = [
				'tags' => $this->registry->get_tags(),
				'groups' => Plugin::$instance->dynamic_tags->get_config()['groups'],
			];
		}

		return $settings;
	}

	private function register_transformers( Transformers_Registry $transformers ) {
		$transformers->register(
			Dynamic_Prop_Type::get_key(),
			new Dynamic_Transformer( Plugin::$instance->dynamic_tags )
		);
	}
}
