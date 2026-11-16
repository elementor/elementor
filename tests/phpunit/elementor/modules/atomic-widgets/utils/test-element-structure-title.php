<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Utils;

use Elementor\Modules\AtomicWidgets\Utils\Element_Structure_Title;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Element_Structure_Title extends TestCase {

	public function test_resolve__returns_editor_settings_title() {
		// Arrange.
		$element = [
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'editor_settings' => [ 'title' => 'Hero Section' ],
		];

		// Act.
		$title = Element_Structure_Title::resolve( $element );

		// Assert.
		$this->assertSame( 'Hero Section', $title );
	}

	public function test_resolve__falls_back_to_title_setting() {
		// Arrange.
		$element = [
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [ '_title' => 'Legacy Custom Title' ],
		];

		// Act.
		$title = Element_Structure_Title::resolve( $element );

		// Assert.
		$this->assertSame( 'Legacy Custom Title', $title );
	}

	public function test_resolve__falls_back_to_preset_title() {
		// Arrange.
		$element = [
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [ 'presetTitle' => 'Preset Title' ],
		];

		// Act.
		$title = Element_Structure_Title::resolve( $element );

		// Assert.
		$this->assertSame( 'Preset Title', $title );
	}

	public function test_resolve__prefers_editor_settings_title_over_title_setting() {
		// Arrange.
		$element = [
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'editor_settings' => [ 'title' => 'Editor Title' ],
			'settings' => [ '_title' => 'Legacy Title' ],
		];

		// Act.
		$title = Element_Structure_Title::resolve( $element );

		// Assert.
		$this->assertSame( 'Editor Title', $title );
	}

	public function test_resolve__extracts_title_from_envelope_setting() {
		// Arrange.
		$element = [
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => [
				'_title' => [
					'$$type' => 'string',
					'value' => 'Envelope Title',
				],
			],
		];

		// Act.
		$title = Element_Structure_Title::resolve( $element );

		// Assert.
		$this->assertSame( 'Envelope Title', $title );
	}

	public function test_resolve__returns_null_when_no_title_sources_and_unknown_type() {
		// Arrange.
		$element = [
			'elType' => 'widget',
			'widgetType' => 'unknown-widget-type-xyz',
		];

		// Act.
		$title = Element_Structure_Title::resolve( $element );

		// Assert.
		$this->assertNull( $title );
	}
}
