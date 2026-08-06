<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\GlobalClasses\Global_Class_Post;
use Elementor\Modules\GlobalClasses\Global_Class_Post_Type;
use Elementor\Modules\GlobalClasses\Global_Classes_Labels;
use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\Mcp\Abilities\Global_Classes_Resource_Ability;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Global_Classes_Resource_Ability extends Elementor_Test_Base {

	public function test_execute__returns_label_and_css_per_class() {
		// Arrange.
		$this->act_as_admin();

		$class_id = $this->given_kit_global_class( 'hero-heading', '#123456' );

		// Act.
		$json = ( new Global_Classes_Resource_Ability() )->execute();
		$payload = json_decode( $json, true );

		// Assert.
		$this->assertIsArray( $payload );
		$this->assertArrayHasKey( $class_id, $payload );

		$entry = $payload[ $class_id ];
		$this->assertSame( 'hero-heading', $entry['label'] );
		$this->assertStringContainsString( 'color: #123456;', $entry['css'] );
	}

	public function test_execute__returns_media_and_pseudo_variants_as_raw_css() {
		// Arrange.
		$this->act_as_admin();

		$class_id = $this->given_kit_global_class(
			'multi-variant',
			[
				[
					'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
					'props' => [ 'color' => [ '$$type' => 'color', 'value' => '#fff' ] ],
					'custom_css' => null,
				],
				[
					'meta' => [ 'breakpoint' => 'desktop', 'state' => 'hover' ],
					'props' => [ 'color' => [ '$$type' => 'color', 'value' => '#0f0' ] ],
					'custom_css' => null,
				],
				[
					'meta' => [ 'breakpoint' => 'mobile', 'state' => null ],
					'props' => [ 'color' => [ '$$type' => 'color', 'value' => '#000' ] ],
					'custom_css' => null,
				],
			]
		);

		// Act.
		$json = ( new Global_Classes_Resource_Ability() )->execute();
		$payload = json_decode( $json, true );

		// Assert.
		$css = $payload[ $class_id ]['css'];
		$this->assertStringContainsString( 'color: #fff;', $css );
		$this->assertStringContainsString( '&:hover { color: #0f0; }', $css );
		$this->assertStringContainsString( '@media(--mobile) {', $css );
		$this->assertStringContainsString( 'color: #000;', $css );
	}

	/**
	 * @param string       $label
	 * @param string|array $variants_or_color
	 */
	private function given_kit_global_class( string $label, $variants_or_color ): string {
		( new Global_Class_Post_Type() )->register_post_type();

		$class_id = 'g-' . strtolower( substr( md5( $label ), 0, 6 ) );

		$variants = is_array( $variants_or_color ) ? $variants_or_color : [
			[
				'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
				'props' => [ 'color' => [ '$$type' => 'color', 'value' => $variants_or_color ] ],
				'custom_css' => null,
			],
		];

		Global_Class_Post::create( $class_id, $label, [
			'type' => 'class',
			'variants' => $variants,
		] );

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$existing_order = Global_Classes_Order::make( $kit )->get_order();
		Global_Classes_Order::make( $kit )->set_order( array_merge( $existing_order, [ $class_id ] ) );

		$existing_labels = Global_Classes_Labels::make( $kit )->get_labels();
		Global_Classes_Labels::make( $kit )->set_labels( array_merge( $existing_labels, [ $class_id => $label ] ) );

		return $class_id;
	}
}
