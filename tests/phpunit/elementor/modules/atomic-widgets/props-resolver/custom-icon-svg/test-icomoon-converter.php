<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg;

use Elementor\Modules\AtomicWidgets\PropsResolver\Custom_Icon_Svg\Icomoon_Converter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Icomoon_Converter extends TestCase {
	public function test_svg_from_selection__builds_current_color_path() {
		// Arrange.
		$json = json_encode( [
			'preferences' => [ 'fontPref' => [ 'prefix' => 'icon-' ] ],
			'icons' => [
				[
					'icon' => [
						'paths' => [ 'M0 0H1024V1024H0Z' ],
						'width' => 1024,
						'tags' => [ 'home' ],
					],
					'properties' => [
						'name' => 'home',
						'code' => 59648,
					],
				],
			],
		] );

		// Act.
		$svg = Icomoon_Converter::svg_from_selection( $json, 'home', 'icon-' );

		// Assert.
		$this->assertStringContainsString( 'M0 0H1024V1024H0Z', $svg );
		$this->assertStringContainsString( 'fill="currentColor"', $svg );
		$this->assertStringContainsString( 'viewBox="0 0 1024 1024"', $svg );
	}
}
