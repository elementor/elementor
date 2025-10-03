<?php

namespace Elementor\Modules\Components;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\Components\Documents\Component;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Id_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		$document = Plugin::$instance->documents->get_doc_for_frontend( $value );

		if (
			! $document ||
			$this->is_password_protected( $document ) ||
			! $this->is_component( $document ) ||
			! $document->is_built_with_elementor()
		) {
			return '';
		}

		Plugin::$instance->documents->switch_to_document( $document );

		$data = $document->get_elements_data();

		$data = apply_filters( 'elementor/frontend/builder_content_data', $data, $value );

		$content = '';

		if ( ! empty( $data ) ) {
			ob_start();

			$document->print_elements( $data );

			$content = ob_get_clean();

			$content = apply_filters( 'elementor/frontend/the_content', $content );
		}

		Plugin::$instance->documents->restore_document();

		return $content;
	}

	private function is_component( $document ) {
		return $document instanceof Component;
	}

	private function is_password_protected( $document ) {
		return post_password_required( $document->get_post()->ID );
	}
}
