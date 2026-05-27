<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Selection_Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transition_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @group props-resolver
 */
class Test_Render_Props_Resolver_Array_Prop_Type extends Elementor_Test_Base {

	private const GENERATE_ITEM_DISABLED = true;

	public function setUp(): void {
		parent::setUp();

		Render_Props_Resolver::reset();
	}

	public function tearDown(): void {
		parent::tearDown();

		Render_Props_Resolver::reset();
	}

	public function test_resolve__array_prop_skips_disabled_items_before_transform() {
		// Arrange.
		$make_selection = fn () => Key_Value_Prop_Type::generate( [
			'key' => String_Prop_Type::generate( 'All properties' ),
			'value' => String_Prop_Type::generate( 'all' ),
		] );

		$transition_items = [
			Selection_Size_Prop_Type::generate( [
				'selection' => $make_selection(),
				'size' => Size_Prop_Type::generate( [
					'size' => 200,
					'unit' => Size_Constants::UNIT_MILLI_SECOND,
				] ),
			] ),
			Selection_Size_Prop_Type::generate( [
				'selection' => $make_selection(),
				'size' => Size_Prop_Type::generate( [
					'size' => 300,
					'unit' => Size_Constants::UNIT_MILLI_SECOND,
				] ),
			], self::GENERATE_ITEM_DISABLED ),
			Selection_Size_Prop_Type::generate( [
				'selection' => $make_selection(),
				'size' => Size_Prop_Type::generate( [
					'size' => 400,
					'unit' => Size_Constants::UNIT_MILLI_SECOND,
				] ),
			] ),
		];

		$props = [
			'transition' => Transition_Prop_Type::generate( $transition_items ),
		];

		$schema = [
			'transition' => Transition_Prop_Type::make(),
		];

		// Act.
		$result = Render_Props_Resolver::for_styles()->resolve( $schema, $props );

		// Assert.
		$this->assertSame( 'all 200ms, all 400ms', $result['transition'] );
	}
}
