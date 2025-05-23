<?php

namespace Elementor\Modules\GlobalClasses;

use Elementor\Core\Files\CSS\Post as Post_CSS;
use Elementor\Modules\AtomicWidgets\Styles\Styles_Renderer;
use Elementor\Plugin;

class Global_Classes_CSS_File extends Post_CSS {

	const FILE_PREFIX = 'global-classes-';

	const META_KEY = '_elementor_css__global_classes';

	public function __construct( $kit_id = null ) {
		$kit_id = $kit_id ?? Plugin::$instance->kits_manager->get_active_id();

		parent::__construct( $kit_id );
	}

	public function get_name() {
		return 'global-classes';
	}

	protected function get_file_handle_id() {
		return 'elementor-global-classes-' . $this->get_post_id();
	}

	protected function get_enqueue_dependencies() {
		return [];
	}

	protected function get_inline_dependency() {
		return '';
	}

	protected function render( $context ) {
		$global_classes = Global_Classes_Repository::make()
			->context( $context )
			->all();

		if ( $global_classes->get_items()->is_empty() ) {
			return;
		}

		$sorted_items = $global_classes
			->get_order()
			->reverse()
			->map(
				fn( $id ) => $global_classes->get_items()->get( $id )
			);

		$css = Styles_Renderer::make(
			Plugin::$instance->breakpoints->get_breakpoints_config()
		)->on_prop_transform( function( $key, $value ) {
			if ( 'font-family' !== $key ) {
				return;
			}

			$this->add_font( $value );
		} )->render(
			$sorted_items->map( function( $item ) {
				$item['cssName'] = $item['label'];

				return $item;
			} )->all()
		);

		$this->get_stylesheet()->add_raw_css( $css );
	}

	protected function render_css() {
		$this->render( Global_Classes_Repository::CONTEXT_FRONTEND );
	}
}
