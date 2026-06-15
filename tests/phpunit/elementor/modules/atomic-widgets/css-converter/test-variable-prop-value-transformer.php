<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter;

use Elementor\Modules\AtomicWidgets\CssConverter\Variable_Prop_Value_Transformer;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Variables\Adapters\Prop_Type_Adapter;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Variables\Services\Variables_Service;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Variable_Prop_Value_Transformer extends TestCase {

	public function test_transform__promotes_color_var_reference_to_variable_prop_value() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'find_by_label_or_id' )->with( 'primary-text' )->willReturn( [
			'id' => 'e-gv-1',
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'primary-text',
			'value' => '#111111',
		] );

		$transformer = new Variable_Prop_Value_Transformer( $service );
		$schema = [
			'color' => Union_Prop_Type::create_from( Color_Prop_Type::make() )
				->add_prop_type( Color_Variable_Prop_Type::make() ),
		];

		$result = $transformer->transform(
			[ 'color' => Color_Prop_Type::generate( 'var(--primary-text)' ) ],
			$schema
		);

		$this->assertSame(
			[
				'$$type' => Color_Variable_Prop_Type::get_key(),
				'value' => 'e-gv-1',
			],
			$result['color']
		);
	}

	public function test_eject__unknown_var_moves_declaration_to_custom_css() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'find_by_label_or_id' )->with( 'missing' )->willReturn( null );

		$transformer = new Variable_Prop_Value_Transformer( $service );
		$schema = [
			'color' => Union_Prop_Type::create_from( Color_Prop_Type::make() )
				->add_prop_type( Color_Variable_Prop_Type::make() ),
		];
		$rules = [
			[
				'property' => 'color',
				'value' => 'var(--missing)',
				'declaration' => 'color: var(--missing)',
			],
		];

		$result = $transformer->eject_unresolved_var_props(
			[ 'color' => Color_Prop_Type::generate( 'var(--missing)' ) ],
			$schema,
			$rules
		);

		$this->assertSame( [], $result['props'] );
		$this->assertSame( [ 'color: var(--missing);' ], $result['custom_css'] );
		$this->assertSame( [], $result['rejected'] );
	}

	public function test_eject__wrong_variable_type_moves_declaration_to_rejected() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'find_by_label_or_id' )->with( 'heading-font' )->willReturn( [
			'id' => 'e-gv-3',
			'type' => Font_Variable_Prop_Type::get_key(),
			'label' => 'heading-font',
			'value' => 'Roboto',
		] );

		$transformer = new Variable_Prop_Value_Transformer( $service );
		$schema = [
			'font-size' => Union_Prop_Type::create_from( Size_Prop_Type::make() )
				->add_prop_type( Size_Variable_Prop_Type::make() ),
		];
		$rules = [
			[
				'property' => 'font-size',
				'value' => 'var(--heading-font)',
				'declaration' => 'font-size: var(--heading-font)',
			],
		];

		$result = $transformer->eject_unresolved_var_props(
			[
				'font-size' => [
					'$$type' => 'size',
					'value' => [
						'size' => 'var(--heading-font)',
						'unit' => 'custom',
					],
				],
			],
			$schema,
			$rules
		);

		$this->assertSame( [], $result['props'] );
		$this->assertSame( [], $result['custom_css'] );
		$this->assertSame( [ 'font-size: var(--heading-font);' ], $result['rejected'] );
	}

	public function test_transform__promotes_font_var_reference_to_font_variable_prop_value() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'find_by_label_or_id' )->with( 'heading-font' )->willReturn( [
			'id' => 'e-gv-3',
			'type' => Font_Variable_Prop_Type::get_key(),
			'label' => 'heading-font',
			'value' => 'Roboto',
		] );

		$transformer = new Variable_Prop_Value_Transformer( $service );
		$schema = [
			'font-family' => Union_Prop_Type::create_from( String_Prop_Type::make() )
				->add_prop_type( Font_Variable_Prop_Type::make() ),
		];

		$result = $transformer->transform(
			[ 'font-family' => String_Prop_Type::generate( 'var(--heading-font)' ) ],
			$schema
		);

		$this->assertSame(
			[
				'$$type' => Font_Variable_Prop_Type::get_key(),
				'value' => 'e-gv-3',
			],
			$result['font-family']
		);
	}

	public function test_transform__promotes_custom_size_var_to_size_variable_prop_value() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'find_by_label_or_id' )->with( 'fluid-spacing' )->willReturn( [
			'id' => 'e-gv-4',
			'type' => Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY,
			'label' => 'fluid-spacing',
			'value' => 'clamp(1rem, 2vw, 2rem)',
		] );

		$transformer = new Variable_Prop_Value_Transformer( $service );
		$schema = [
			'width' => Union_Prop_Type::create_from( Size_Prop_Type::make() )
				->add_prop_type( Size_Variable_Prop_Type::make() ),
		];

		$result = $transformer->transform(
			[
				'width' => [
					'$$type' => 'size',
					'value' => [
						'size' => 'var(--fluid-spacing)',
						'unit' => 'custom',
					],
				],
			],
			$schema
		);

		$this->assertSame(
			[
				'$$type' => Size_Variable_Prop_Type::get_key(),
				'value' => 'e-gv-4',
			],
			$result['width']
		);
	}

	public function test_transform__promotes_size_var_custom_unit_reference() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'find_by_label_or_id' )->with( 'spacing-md' )->willReturn( [
			'id' => 'e-gv-2',
			'type' => Size_Variable_Prop_Type::get_key(),
			'label' => 'spacing-md',
			'value' => '16px',
		] );

		$transformer = new Variable_Prop_Value_Transformer( $service );
		$schema = [
			'padding-top' => Union_Prop_Type::create_from( Size_Prop_Type::make() )
				->add_prop_type( Size_Variable_Prop_Type::make() ),
		];

		$result = $transformer->transform(
			[
				'padding-top' => [
					'$$type' => 'size',
					'value' => [
						'size' => 'var(--spacing-md)',
						'unit' => 'custom',
					],
				],
			],
			$schema
		);

		$this->assertSame(
			[
				'$$type' => Size_Variable_Prop_Type::get_key(),
				'value' => 'e-gv-2',
			],
			$result['padding-top']
		);
		$this->assertTrue( $schema['padding-top']->validate( $result['padding-top'] ) );
	}
}
