<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Expanders;

use Elementor\Modules\AtomicWidgets\CssConverter\Expanders\Physical_To_Logical_Expander;
use Elementor\Modules\AtomicWidgets\CssConverter\Variable_Prop_Value_Transformer;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;
use Elementor\Modules\Variables\Services\Variables_Service;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Physical_To_Logical_Expander extends TestCase {

	/**
	 * @dataProvider all_physical_mappings
	 */
	public function test_expand__rewrites_every_physical_property_to_its_logical_equivalent( string $physical, string $logical ) {
		$rules = ( new Physical_To_Logical_Expander() )->expand( [
			'property' => $physical,
			'value'    => '10px',
		] );

		$this->assertSame(
			[ [ 'property' => $logical, 'value' => '10px', 'declaration' => "$logical: 10px" ] ],
			$rules
		);
	}

	public function all_physical_mappings(): array {
		return array_map(
			fn( $physical, $logical ) => [ $physical, $logical ],
			array_keys( Physical_To_Logical_Expander::PHYSICAL_TO_LOGICAL ),
			array_values( Physical_To_Logical_Expander::PHYSICAL_TO_LOGICAL )
		);
	}

	public function test_transform__promotes_logical_inset_size_var_reference() {
		$service = $this->createMock( Variables_Service::class );
		$service->method( 'find_by_label_or_id' )->with( 'spacing-md' )->willReturn( [
			'id' => 'e-gv-2',
			'type' => Size_Variable_Prop_Type::get_key(),
			'label' => 'spacing-md',
			'value' => '16px',
		] );

		$transformer = new Variable_Prop_Value_Transformer( $service );
		$schema = [
			'inset-block-start' => Union_Prop_Type::create_from( Size_Prop_Type::make() )
				->add_prop_type( Size_Variable_Prop_Type::make() ),
		];

		$result = $transformer->transform(
			[
				'inset-block-start' => [
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
			$result['inset-block-start']
		);
	}

	/**
	 * @dataProvider null_physical_properties
	 */
	public function test_expand__null_value_rewrites_property_name_and_preserves_null( string $physical, string $logical ) {
		// Arrange & Act.
		$rules = ( new Physical_To_Logical_Expander() )->expand( [
			'property' => $physical,
			'value' => null,
		] );

		// Assert: property is renamed to logical; null value passes through as a prop reset.
		$this->assertSame( [ [ 'property' => $logical, 'value' => null, 'declaration' => $logical . ': ' ] ], $rules );
	}

	public function null_physical_properties(): array {
		return [
			'top'    => [ 'top', 'inset-block-start' ],
			'right'  => [ 'right', 'inset-inline-end' ],
			'bottom' => [ 'bottom', 'inset-block-end' ],
			'left'   => [ 'left', 'inset-inline-start' ],
		];
	}

	public function test_parse__null_sentinel_string_is_normalised_to_php_null_before_expansion() {
		// The 'null' sentinel is a reserved magic word meaning "reset". parse() converts it to PHP
		// null before expanders run — expanders only ever receive PHP null, never the string 'null'.
		$converter = new \Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter(
			\Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory::create(),
			new \Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter(),
			( new \Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry() )
				->register( new Physical_To_Logical_Expander() )
		);

		$result = $converter->convert( 'top: null;' );

		$this->assertSame( [ 'inset-block-start' => null ], $result['props'] );
		$this->assertSame( '', $result['customCss'] );
	}

}
