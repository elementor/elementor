<?php
namespace Elementor\Testing\Modules\Components;

use Elementor\Modules\Components\OverridableProps\Overridable_Groups_Parser;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Overridable_Groups_Parser extends Elementor_Test_Base {

	private Overridable_Groups_Parser $parser;

	public function setUp(): void {
		parent::setUp();

		$this->parser = Overridable_Groups_Parser::make();
	}

	public function test_parse__with_valid_data__succeeds() {
		// Arrange.
		$valid_data = [
			'items' => [
				'group-uuid-1' => [
					'id' => 'group-uuid-1',
					'label' => 'Group 1',
					'props' => [ 'prop-uuid-1' ],
				],
				'group-uuid-2' => [
					'id' => 'group-uuid-2',
					'label' => 'Group 2',
					'props' => [ 'prop-uuid-2' ],
				],
			],
			'order' => [ 'group-uuid-1', 'group-uuid-2' ],
		];

		// Act.
		$result = $this->parser->parse( $valid_data );

		// Assert.
		$this->assertTrue( $result->is_valid() );
	}

	public function test_parser__sanitizes_strings() {
		// Arrange.
		$data_to_sanitize = [
			'items' => [
				'group-uuid-1' => [
					'id' => 'group-uuid-1',
					'label' => '<b>User Info</b>',
					'props' => [ 'prop-uuid-1' ],
				],
			],
			'order' => [ 'group-uuid-1' ],
		];

		// Act.
		$result = $this->parser->parse( $data_to_sanitize );

		// Assert.
		$this->assertTrue( $result->is_valid() );

		$sanitized = $result->unwrap();
		$this->assertEquals( 'User Info', $sanitized['items']['group-uuid-1']['label'] );
	}

	/**
	 * @dataProvider invalid_groups_data_provider
	 */
	public function test_parse__fails_for_invalid_groups( $data, $expected_error ) {
		// Arrange & Act.
		$result = $this->parser->parse( $data );

		// Assert.
		$this->assertFalse( $result->is_valid() );
		$this->assertEquals( $expected_error, $result->errors()->to_string() );
	}

	public function invalid_groups_data_provider() {
		return [
			// Single group
			'single group missing field' => [ 
				'data' => [
					'items' => [
						'group-uuid-1' => [
							'label' => 'User Info',
							'props' => [ 'prop-uuid-1' ],
						],
					],
					'order' => ['group-uuid-1'],
				],
				'expected_error' => 'groups.items.group-uuid-1.id: missing',
			],
			'single group non-array props' => [ 
				'data' => [
					'items' => [
						'group-uuid-1' => [
							'id' => 'group-uuid-1',
							'label' => 'User Info',
							'props' => 'not-an-array',
						],
					],
					'order' => ['group-uuid-1'],
				],
				'expected_error' => 'groups.items.group-uuid-1.props: invalid_structure',
			],
			// Groups items
			'duplicate group labels' => [ 
				'data' => [
					'items' => [
						'group-uuid-1' => [
							'id' => 'group-uuid-1',
							'label' => 'User Info',
							'props' => [ 'prop-uuid-1' ],
						],
						'group-uuid-2' => [
							'id' => 'group-uuid-2',
							'label' => 'User Info',
							'props' => [ 'prop-uuid-2' ],
						],
					],
					'order' => [ 'group-uuid-1', 'group-uuid-2' ],
				],
				'expected_error' => 'groups.items: duplicate_labels: User Info',
			],
			'mismatching group id' => [ 
				'data' => [
					'items' => [
						'group-uuid-1' => [
							'id' => 'different-uuid',
							'label' => 'User Info',
							'props' => [ 'prop-uuid-1' ],
						],
					],
					'order' => [ 'group-uuid-1' ],
				],
				'expected_error' => 'groups.items.group-uuid-1.id: mismatching_value',
			],
			// Groups order
			'a group is missing in groups order' => [ 
				'data' => [
					'items' => [
						'group-uuid-1' => [
							'id' => 'group-uuid-1',
							'label' => 'User Info',
							'props' => [ 'prop-uuid-1' ],
						],
					],
					'order' => [],
				],
				'expected_error' => 'groups.order.group-uuid-1: missing',
			],
			'a group appears in groups order but not in groups items' => [ 
				'data' => [
					'items' => [],
					'order' => [ 'group-uuid-1' ],
				],
				'expected_error' => 'groups.order.group-uuid-1: excess',
			],
		];
	}
}
