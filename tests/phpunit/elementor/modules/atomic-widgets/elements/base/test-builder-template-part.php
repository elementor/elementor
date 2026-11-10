<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\AtomicWidgets\Elements\Base\Element_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Builder;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use PHPUnit\Framework\TestCase;

class Test_Builder_Template_Part extends TestCase {

	public function test_build__without_part_or_local_style_keeps_existing_shape() {
		// Act.
		$element = Element_Builder::make( 'e-flexbox' )->build();
		$widget = Widget_Builder::make( 'e-paragraph' )->build();

		// Assert.
		$this->assertSame( [
			'elType' => 'e-flexbox',
			'settings' => [],
			'isLocked' => false,
			'editor_settings' => [],
			'elements' => [],
		], $element );

		$this->assertSame( [
			'elType' => 'widget',
			'widgetType' => 'e-paragraph',
			'settings' => [],
			'isLocked' => false,
			'editor_settings' => [],
		], $widget );
	}

	public function test_part__adds_top_level_part_without_id_or_widget_marker() {
		// Act.
		$widget = Widget_Builder::make( 'e-paragraph' )->part( 'label' )->build();

		// Assert.
		$this->assertSame( 'label', $widget['part'] );
		$this->assertArrayNotHasKey( 'id', $widget );
		$this->assertArrayNotHasKey( 'widget', $widget );
		$this->assertArrayNotHasKey( 'styles', $widget );
	}

	public function test_local_style__is_keyed_by_part_with_every_variant() {
		// Arrange.
		$style = Style_Definition::make()
			->add_variant( Style_Variant::make()->set_breakpoint( 'desktop' )->add_prop( 'color', $this->color( '#111111' ) ) )
			->add_variant( Style_Variant::make()->set_breakpoint( 'mobile' )->add_prop( 'color', $this->color( '#222222' ) ) );

		// Act.
		$element = Element_Builder::make( 'e-flexbox' )->part( 'root' )->local_style( $style )->build();

		// Assert.
		$this->assertSame( [ 'local-root' ], array_keys( $element['styles'] ) );
		$this->assertSame( [
			'id' => 'local-root',
			'type' => 'class',
			'label' => 'local',
			'variants' => [
				[
					'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
					'props' => [ 'color' => $this->color( '#111111' ) ],
				],
				[
					'meta' => [ 'breakpoint' => 'mobile', 'state' => null ],
					'props' => [ 'color' => $this->color( '#222222' ) ],
				],
			],
		], $element['styles']['local-root'] );
	}

	public function test_local_style__appends_to_existing_classes_once() {
		// Arrange.
		$style = Style_Definition::make()->add_variant( Style_Variant::make()->set_breakpoint( 'desktop' ) );

		// Act.
		$widget = Widget_Builder::make( 'e-paragraph' )
			->settings( [
				'classes' => [ '$$type' => 'classes', 'value' => [ 'existing', 'local-label' ] ],
				'paragraph' => [ '$$type' => 'string', 'value' => 'Hi' ],
			] )
			->part( 'label' )
			->local_style( $style )
			->build();

		// Assert.
		$this->assertSame( [ '$$type' => 'classes', 'value' => [ 'existing', 'local-label' ] ], $widget['settings']['classes'] );
		$this->assertSame( [ '$$type' => 'string', 'value' => 'Hi' ], $widget['settings']['paragraph'] );
	}

	public function test_local_style__does_not_change_the_callers_definition() {
		// Arrange.
		$style = Style_Definition::make()->set_label( 'custom' );

		// Act.
		Widget_Builder::make( 'e-paragraph' )->part( 'label' )->local_style( $style )->build();

		// Assert.
		$this->assertSame( 'custom', $style->build( 'any' )['label'] );
	}

	public function test_local_style__without_part_emits_an_unkeyed_style_for_the_validator_to_reject() {
		// Arrange.
		$style = Style_Definition::make()->add_variant( Style_Variant::make()->set_breakpoint( 'desktop' ) );

		// Act.
		$widget = Widget_Builder::make( 'e-paragraph' )->local_style( $style )->build();

		// Assert.
		$this->assertArrayNotHasKey( 'part', $widget );
		$this->assertSame( [ 'local-' ], array_keys( $widget['styles'] ) );
	}

	private function color( string $value ): array {
		return [ '$$type' => 'color', 'value' => $value ];
	}
}
