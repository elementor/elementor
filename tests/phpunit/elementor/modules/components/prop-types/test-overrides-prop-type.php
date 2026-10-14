<?php
namespace Elementor\Testing\Modules\Components\PropTypes;

use Elementor\Modules\Components\PropTypes\Override_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overrides_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Overrides_Prop_Type extends Elementor_Test_Base {
	public function test_sanitize__filters_out_overrides_with_nullish_value() {
		// Arrange
		$prop_keys_to_filter_out = [
			'prop-uuid-1',
			'prop-uuid-4',
		];

		$override_prop_type_mock = $this->getMockBuilder( Override_Prop_Type::class )
			->disableOriginalConstructor()->onlyMethods( [ 'sanitize' ] )->getMock();

		$override_prop_type_mock->method( 'sanitize' )->willReturnCallback( function ( $item ) use ( $prop_keys_to_filter_out ) {
			if ( in_array( $item['value']['override_key'], $prop_keys_to_filter_out ) ) {
				return [
					'$$type' => 'override',
					'value' => null,
				];
			}

			return $item;
		} );

		$prop_type = Overrides_Prop_Type::make()
			->set_item_type( $override_prop_type_mock );

		// Act
		$result = $prop_type->sanitize( [
			'$$type' => 'overrides',
			'value' => [
				$this->create_mock_override( 'prop-uuid-1' ),
				$this->create_mock_override( 'prop-uuid-2' ),
				$this->create_mock_override( 'prop-uuid-3' ),
				$this->create_mock_override( 'prop-uuid-4' ),
				$this->create_mock_override( 'prop-uuid-5' ),
			],
		] );

		// Assert
		$this->assertEquals( [
			'$$type' => 'overrides',
			'value' => [
				$this->create_mock_override( 'prop-uuid-2' ),
				$this->create_mock_override( 'prop-uuid-3' ),
				$this->create_mock_override( 'prop-uuid-5' ),
			],
		], $result );
	}

	private function create_mock_override( string $override_key ): array {
		return [
			'$$type' => 'override',
			'value' => [
				'override_key' => $override_key,
				'override_value' => [ '$$type' => 'string', 'value' => 'Click me' ],
				'schema_source' => ['type' => 'component', 'id' => '123' ],
			],
		];
	}
}
