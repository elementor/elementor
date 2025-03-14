<?php

namespace Elementor\Modules\AtomicWidgets\ImportExport;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\PropsResolver\Import_Export_Props_Resolver;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver;
use Elementor\Modules\AtomicWidgets\Styles\Style_Schema;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Import_Export {
	public function register_hooks() {
		add_filter(
			'elementor/template_library/sources/local/save_item/elements',
			fn( $elements ) => $this->run( $elements, Import_Export_Props_Resolver::for_import() )
		);

		add_filter(
			'elementor/template_library/sources/local/prepare_template_export/elements',
			fn( $elements ) => $this->run( $elements, Import_Export_Props_Resolver::for_export() )
		);
	}

	private function run( $elements, Props_Resolver $props_resolver ): array {
		if ( empty( $elements ) ) {
			return $elements;
		}

		return Plugin::$instance->db->iterate_data( $elements, function ( $element ) use ( $props_resolver ) {
			$element_instance = $this->get_element_instance( $element );

			if ( ! $this->is_atomic( $element_instance ) ) {
				return $element;
			}

			$element = Change_Style_Ids::make()->run( $element );
			$element = Change_Settings_Props::make( $props_resolver, $element_instance::get_props_schema() )->run( $element );
			$element = Change_Styles_Props::make( $props_resolver, Style_Schema::get() )->run( $element );

			return $element;
		} );
	}

	private function get_element_instance( $element ) {
		return Plugin::$instance->elements_manager->create_element_instance( $element );
	}

	private function is_atomic( $element_instance ) {
		return $element_instance instanceof Atomic_Element_Base || $element_instance instanceof Atomic_Widget_Base;
	}
}
