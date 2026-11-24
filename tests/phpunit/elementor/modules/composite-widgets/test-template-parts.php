<?php

namespace Elementor\Testing\Modules\CompositeWidgets;

use Elementor\Modules\CompositeWidgets\Instance\Template_Parts;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Template_Parts extends TestCase {

	public function test_describe__lists_parts_with_their_type_and_stops_at_a_slot() {
		// Arrange.
		$template = [
			'elType' => 'e-flexbox',
			'part' => 'root',
			'elements' => [
				[
					'elType' => 'widget',
					'widgetType' => 'e-heading',
					'part' => 'title',
				],
				[
					'elType' => 'e-flexbox',
					'part' => 'content',
					'slot' => true,
					'elements' => [
						[
							'elType' => 'widget',
							'widgetType' => 'e-paragraph',
							'part' => 'slot_content',
						],
					],
				],
			],
		];

		// Act.
		$parts = Template_Parts::describe( $template );

		// Assert.
		$this->assertSame( [
			'root' => [ 'type' => 'e-flexbox' ],
			'title' => [ 'type' => 'e-heading' ],
			'content' => [
				'type' => 'e-flexbox',
				'slot' => true,
			],
		], $parts );
	}

	public function test_walk__changes_the_visited_parts_in_place() {
		// Arrange.
		$element = [
			'elType' => 'e-flexbox',
			'elements' => [
				[
					'elType' => 'widget',
					'widgetType' => 'e-heading',
					'part' => 'title',
				],
			],
		];

		// Act.
		Template_Parts::walk( $element, function ( array &$part_element, string $part ) {
			$part_element['visited'] = $part;
		} );

		// Assert.
		$this->assertArrayNotHasKey( 'visited', $element );
		$this->assertSame( 'title', $element['elements'][0]['visited'] );
	}
}
