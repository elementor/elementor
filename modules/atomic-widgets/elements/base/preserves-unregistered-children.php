<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Base;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

trait Preserves_Unregistered_Children {

	protected function _get_default_child_type( array $element_data ) {
		$document = Plugin::$instance->documents->get_current();

		if ( $document && $document->is_saving() ) {
			return new Preserved_Element();
		}

		return null;
	}
}
