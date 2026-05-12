<?php

namespace Elementor\Modules\AtomicWidgets\DynamicTags;

use Elementor\Core\Base\Document;
use Elementor\Modules\AtomicWidgets\DynamicTags\ImportExport\Dynamic_Transformer as Import_Export_Dynamic_Transformer;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers_Registry;
use Elementor\Modules\AtomicWidgets\Utils\Utils as Atomic_Utils;
use Elementor\Modules\GlobalClasses\Global_Classes_Dynamic_Index;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Dynamic_Tags_Module {

	const META_KEY_POST_DYNAMIC = '_elementor_post_styles_dynamic';

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

		add_action(
			'elementor/atomic-widgets/global-classes/persisted',
			fn( string $class_id, ?array $data, string $context ) => $this->mark_global_class( $class_id, $data, $context ),
			10,
			3
		);

		add_action(
			'elementor/document/after_save',
			fn( Document $document ) => $this->mark_document( $document ),
			19,
			1
		);

		add_filter(
			'elementor/atomic-widgets/global-classes/has-dynamic',
			fn( bool $current, array $class_ids, string $context ) => $current || $this->global_classes_have_dynamic( $class_ids, $context ),
			10,
			3
		);

		add_filter(
			'elementor/atomic-widgets/post-styles/has-dynamic',
			fn( bool $current, int $post_id ) => $current || '1' === get_post_meta( $post_id, self::META_KEY_POST_DYNAMIC, true ),
			10,
			2
		);
	}

	private function mark_global_class( string $class_id, ?array $data, string $context ): void {
		$index = $this->index_for_context( $context );

		if ( ! $index ) {
			return;
		}

		if ( null === $data ) {
			$index->remove( $class_id );

			return;
		}

		$index->mark( $class_id, Dynamic_Value_Detector::contains_dynamic_value( $data ) );
	}

	private function mark_document( Document $document ): void {
		$post_id = $document->get_main_post()->ID;
		$is_dynamic = false;

		Atomic_Utils::traverse_post_elements( (string) $post_id, function( $element_data ) use ( &$is_dynamic ) {
			if ( $is_dynamic ) {
				return;
			}

			if ( Dynamic_Value_Detector::contains_dynamic_value( $element_data['styles'] ?? [] ) ) {
				$is_dynamic = true;
			}
		} );

		update_post_meta( $post_id, self::META_KEY_POST_DYNAMIC, $is_dynamic ? '1' : '0' );
	}

	private function global_classes_have_dynamic( array $class_ids, string $context ): bool {
		$index = $this->index_for_context( $context );

		if ( ! $index ) {
			return false;
		}

		return $index->has_any( $class_ids );
	}

	private function index_for_context( string $context ): ?Global_Classes_Dynamic_Index {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$main_post = $kit->get_main_post();

		if ( ! $main_post || 'trash' === $main_post->post_status ) {
			return null;
		}

		return Global_Classes_Dynamic_Index::make( $kit )->set_preview( 'preview' === $context );
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
