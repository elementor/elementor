<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Mocks;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Schema\Atomic_Prop;

class Mock_Widget extends Atomic_Widget_Base {
	public function get_name() {
		return 'mock-widget';
	}

	protected function get_props_schema_definition(): array {
		return [
			'test_prop' => Atomic_Prop::make()
				->default( 'default-value' ),
		];
	}

	public function get_atomic_controls(): array {
		return [];
	}
};
