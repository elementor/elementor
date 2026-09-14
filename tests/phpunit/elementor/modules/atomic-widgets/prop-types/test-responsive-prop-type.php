<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Core\Breakpoints\Manager as Breakpoints_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Responsive_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use Elementor\Modules\Components\Overridable_Schema_Extender;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Responsive_Prop_Type extends Elementor_Test_Base {
	public function tearDown(): void {
		Render_Props_Resolver::reset();

		parent::tearDown();
	}

	public function test_create_from__covers_every_canonical_breakpoint() {
		$prop_type = Responsive_Prop_Type::create_from( Number_Prop_Type::make()->default( 3 ) );

		$this->assertSame( Responsive_Prop_Type::breakpoint_keys(), array_keys( $prop_type->get_shape() ) );
		$this->assertSame( 'object', $prop_type->get_type() );
		$this->assertSame( 'responsive', $prop_type::get_key() );
	}

	public function test_validate__accepts_a_sparse_value() {
		$prop_type = Responsive_Prop_Type::create_from( Number_Prop_Type::make()->default( 3 ) );

		$result = $prop_type->validate( [
			'$$type' => 'responsive',
			'value' => [
				'desktop' => [
					'$$type' => 'number',
					'value' => 3,
				],
				'tablet' => [
					'$$type' => 'number',
					'value' => 2,
				],
			],
		] );

		$this->assertTrue( $result );
	}

	public function test_validate__survives_a_disabled_breakpoint_key() {
		$prop_type = Responsive_Prop_Type::create_from( Number_Prop_Type::make()->default( 3 ) );

		$result = $prop_type->validate( [
			'$$type' => 'responsive',
			'value' => [
				'desktop' => [
					'$$type' => 'number',
					'value' => 3,
				],
				'laptop' => [
					'$$type' => 'number',
					'value' => 4,
				],
			],
		] );

		$this->assertTrue( $result );
		$this->assertArrayHasKey( Breakpoints_Manager::BREAKPOINT_KEY_LAPTOP, $prop_type->get_shape() );
	}

	public function test_fallback_chain__walks_toward_desktop() {
		$this->assertSame(
			[ 'tablet', 'tablet_extra', 'laptop', 'desktop' ],
			Responsive_Prop_Type::fallback_chain( 'tablet' )
		);
		$this->assertSame(
			[ 'widescreen', 'desktop' ],
			Responsive_Prop_Type::fallback_chain( 'widescreen' )
		);
		$this->assertSame(
			[ 'desktop' ],
			Responsive_Prop_Type::fallback_chain( 'desktop' )
		);
	}

	public function test_props_resolver__returns_a_breakpoint_map() {
		$prop_type = Responsive_Prop_Type::create_from( Number_Prop_Type::make()->default( 3 ) );
		$resolver = Render_Props_Resolver::for_settings();

		$result = $resolver->resolve(
			[ 'count' => $prop_type ],
			[
				'count' => [
					'$$type' => 'responsive',
					'value' => [
						'desktop' => [
							'$$type' => 'number',
							'value' => 3,
						],
						'tablet' => [
							'$$type' => 'number',
							'value' => 2,
						],
					],
				],
			]
		);

		$this->assertSame( 3, $result['count']['desktop'] );
		$this->assertSame( 2, $result['count']['tablet'] );
	}

	public function test_overridable_schema_extender__wraps_a_responsive_prop() {
		$schema = [
			'count' => Responsive_Prop_Type::create_from( Number_Prop_Type::make()->default( 3 ) ),
		];

		$extended = Overridable_Schema_Extender::make()->get_extended_schema( $schema );

		$this->assertInstanceOf( Union_Prop_Type::class, $extended['count'] );
		$this->assertNotNull( $extended['count']->get_prop_type( 'responsive' ) );
		$this->assertNotNull( $extended['count']->get_prop_type( 'overridable' ) );
	}

	public function test_default__is_desktop_only() {
		$prop_type = Responsive_Prop_Type::create_from( Number_Prop_Type::make()->default( 3 ) );
		$default = $prop_type->get_default();

		$this->assertSame( 'responsive', $default['$$type'] );
		$this->assertSame( 3, $default['value']['desktop']['value'] );
		$this->assertArrayNotHasKey( 'tablet', $default['value'] );
		$this->assertNotNull( $prop_type->get_shape_field( 'desktop' )->get_default() );
		$this->assertNull( $prop_type->get_shape_field( 'tablet' )->get_default() );
	}

	public function test_create_from__preserves_inner_float_and_meta() {
		$inner = Number_Prop_Type::make()->float()->meta( 'suffix', '%' )->default( 1.5 );
		$prop_type = Responsive_Prop_Type::create_from( $inner );
		$desktop = $prop_type->get_shape_field( Breakpoints_Manager::BREAKPOINT_KEY_DESKTOP );
		$tablet = $prop_type->get_shape_field( Breakpoints_Manager::BREAKPOINT_KEY_TABLET );

		$this->assertSame( 1.5, $desktop->sanitize( [
			'$$type' => 'number',
			'value' => '1.5',
		] )['value'] );
		$this->assertSame( 1.5, $tablet->sanitize( [
			'$$type' => 'number',
			'value' => '1.5',
		] )['value'] );
		$this->assertSame( '%', $desktop->get_meta_item( 'suffix' ) );
		$this->assertSame( '%', $tablet->get_meta_item( 'suffix' ) );
	}
}
