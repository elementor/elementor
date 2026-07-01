<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Preserves_Unregistered_Children {

	protected function _get_default_child_type( array $element_data ) {
		return new Preserved_Element();
	}
}
