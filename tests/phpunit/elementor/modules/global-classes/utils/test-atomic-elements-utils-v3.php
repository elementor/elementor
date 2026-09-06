<?php

namespace Elementor\Testing\Modules\GlobalClasses\Utils;

use Elementor\Modules\GlobalClasses\Utils\V3_Elements_Utils;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Atomic_Elements_Utils_V3 extends Elementor_Test_Base {

	public function test_collect_class_labels_from_v3_element__returns_labels_from_css_classes(): void {
		$element_data = [
			'elType' => 'widget',
			'widgetType' => 'heading',
			'settings' => [ '_css_classes' => '  primary   secondary  primary  ' ],
		];

		$labels = V3_Elements_Utils::collect_class_labels_from_v3_element( $element_data );

		$this->assertSame( [ 'primary', 'secondary', 'primary' ], $labels );
	}

	public function test_collect_class_labels_from_v3_element__empty_when_setting_absent(): void {
		$element_data = [
			'elType' => 'widget',
			'widgetType' => 'heading',
			'settings' => [],
		];

		$labels = V3_Elements_Utils::collect_class_labels_from_v3_element( $element_data );

		$this->assertSame( [], $labels );
	}

	public function test_collect_class_labels_from_v3_element__empty_when_setting_is_blank(): void {
		$element_data = [
			'elType' => 'widget',
			'widgetType' => 'heading',
			'settings' => [ '_css_classes' => '   ' ],
		];

		$labels = V3_Elements_Utils::collect_class_labels_from_v3_element( $element_data );

		$this->assertSame( [], $labels );
	}

	public function test_collect_class_labels_from_v3_element__empty_when_element_is_atomic(): void {
		$element_data = [
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [ '_css_classes' => 'primary' ],
		];

		$labels = V3_Elements_Utils::collect_class_labels_from_v3_element( $element_data );

		$this->assertSame( [], $labels );
	}
}
