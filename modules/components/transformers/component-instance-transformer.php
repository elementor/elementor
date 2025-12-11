<?php

namespace Elementor\Modules\Components\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\Components\Documents\Component;
use Elementor\Plugin;
use Elementor\Modules\AtomicWidgets\Elements\Base\Render_Context;
use Elementor\Core\Base\Document as Component_Document;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Instance_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		$component_id = $value['component_id'];
		$overrides = $this->get_merged_overrides( $value );

		$document = Plugin::$instance->documents->get_doc_for_frontend( $component_id );

		if ( ! $this->should_render_content( $document ) ) {
			return '';
		}

		Render_Context::push( Overridable_Transformer::class, [ 'overrides' => $overrides ] );

		$content = $this->get_content( $document, $component_id );

		Render_Context::pop( Overridable_Transformer::class );

		return $content;
	}

	private function get_merged_overrides( $value ): array {
		$overrides_array = $value['overrides'] ?? [];
		$overrides = [];

		foreach ( $overrides_array as $override ) {
			$overrides[ $override['override_key'] ] = $override['override_value'];
		}

		return $overrides;
	}

	private function should_render_content( Component_Document $document ): bool {
		return $document &&
			! $this->is_password_protected( $document ) &&
			$this->is_component( $document ) &&
			$document->is_built_with_elementor();
	}

	private function is_component( $document ) {
		return $document instanceof Component;
	}

	private function is_password_protected( $document ) {
		return post_password_required( $document->get_post()->ID );
	}

	private function get_content( Component_Document $component_doc, int $component_id ): string {
		Plugin::$instance->documents->switch_to_document( $component_doc );

		$data = $component_doc->get_elements_data();

		$data = apply_filters( 'elementor/frontend/builder_content_data', $data, $component_id );

		$content = '';

		if ( ! empty( $data ) ) {
			ob_start();

			$component_doc->print_elements( $data );

			$content = ob_get_clean();

			$content = apply_filters( 'elementor/frontend/the_content', $content );
		}

		Plugin::$instance->documents->restore_document();

		return $content;
	}
}
