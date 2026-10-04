<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Settings_Readback;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Map_Settings_Readback extends TestCase {

	private function schemas(): array {
		return [
			'stretch' => [
				'type' => 'boolean',
				'key' => 'full_width',
				'convert' => [
					'true' => 'stretch',
					'false' => '',
				],
			],
			'layout' => [
				'type' => 'string',
				'enum' => [ 'horizontal', 'dropdown' ],
			],
			'link' => [
				'type' => 'object',
				'properties' => [
					'url' => [ 'type' => 'string' ],
					'is_external' => [
						'type' => 'boolean',
						'convert' => [
							'true' => 'on',
							'false' => '',
						],
					],
				],
			],
		];
	}

	public function test_from_raw__reverts_converted_values_to_public_keys() {
		// Arrange.
		$raw = [
			'full_width' => 'stretch',
			'layout' => 'dropdown',
			'link' => [
				'url' => 'https://example.com',
				'is_external' => '',
			],
			'menu_typography_font_size' => [ 'size' => 16 ],
		];

		// Act.
		$result = V3_Map_Settings_Readback::from_raw( $this->schemas(), $raw );

		// Assert.
		$this->assertSame(
			[
				'stretch' => true,
				'layout' => 'dropdown',
				'link' => [
					'url' => 'https://example.com',
					'is_external' => false,
				],
			],
			$result
		);
	}

	public function test_from_raw__skips_settings_that_are_not_stored() {
		// Arrange.
		$raw = [ 'full_width' => '' ];

		// Act.
		$result = V3_Map_Settings_Readback::from_raw( $this->schemas(), $raw );

		// Assert.
		$this->assertSame( [ 'stretch' => false ], $result );
	}
}
