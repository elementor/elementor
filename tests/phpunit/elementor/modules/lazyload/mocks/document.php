<?php
namespace Elementor\Testing\Modules\LazyLoadֿ\Mocks;

use Elementor\Core\Base\Document as BaseDocument;

class Document extends BaseDocument {

	public function get_name() {
		return 'test-document';
	}

    public static function get_properties() {
		$properties = parent::get_properties();
		$properties['support_lazyload'] = false;

		return $properties;
	}
}
