<?php

namespace Elementor\Modules\Components\Transformers;

use Elementor\Core\Base\Document as Component_Document;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\Components\Components_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Instance_Transformer extends Transformer_Base {
	private static array $nested_path_stack = [];
	private static array $rendering_stack = [];
	private static $repository;

	public static function reset_rendering_stack(): void {
		self::$rendering_stack = [];
		self::$nested_path_stack = [];
	}

	public function transform( $value, Props_Resolver_Context $context ) {
		$component_id = $value['component_id'];

		if ( $this->is_circular_reference( $component_id ) ) {
			return '';
		}

		$instance_element_id = $context->get_element_id();

		self::$rendering_stack[] = $component_id;
		$content = $this->get_rendered_content( $component_id, $instance_element_id );
		array_pop( self::$rendering_stack );

		return $content;
	}

	private function is_circular_reference( int $component_id ): bool {
		return in_array( $component_id, self::$rendering_stack, true );
	}

	private function get_rendered_content( int $component_id, ?string $instance_element_id ): string {
		$should_show_autosave = is_preview();
		$component = $this->get_repository()->get( $component_id, $should_show_autosave );

		if ( ! $component || ! $this->should_render_content( $component ) ) {
			return '';
		}
		$parent_path = ! empty( self::$nested_path_stack ) ? end( self::$nested_path_stack ) : [];
		$nested_path = $instance_element_id !== null && $instance_element_id !== ''
			? array_merge( $parent_path, [ $instance_element_id ] )
			: $parent_path;

		Plugin::$instance->documents->switch_to_document( $component );

		self::$nested_path_stack[] = $nested_path;

		try {
			$data = $component->get_nested_document_elements_data( $nested_path );

			$data = apply_filters( 'elementor/frontend/builder_content_data', $data, $component_id );

			$content = '';

			if ( ! empty( $data ) ) {
				ob_start();

				$this->print_elements_without_cache( $data );

				$content = ob_get_clean();

				$content = apply_filters( 'elementor/frontend/the_content', $content );
			}

			return $content;
		} finally {
			array_pop( self::$nested_path_stack );
			Plugin::$instance->documents->restore_document();
		}
	}

	private function should_render_content( Component_Document $document ): bool {
		return ! $this->is_password_protected( $document ) &&
			$document->is_built_with_elementor();
	}

	private function is_password_protected( $document ) {
		return post_password_required( $document->get_post()->ID );
	}

	private function print_elements_without_cache( array $elements_data ): void {
		foreach ( $elements_data as $element_data ) {
			$element = Plugin::$instance->elements_manager->create_element_instance( $element_data );

			if ( ! $element ) {
				continue;
			}

			$element->print_element();
		}
	}

	private function get_repository(): Components_Repository {
		if ( ! self::$repository ) {
			self::$repository = new Components_Repository();
		}

		return self::$repository;
	}
}
