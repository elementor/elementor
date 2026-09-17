<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Converter;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters\Border_Shorthand_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters\Box_Shadow_Prefix_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters\Generic_Index_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters\Simple_Setting_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters\Typography_Group_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Context_Meta;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Conversion_Context;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Converters extends TestCase {

	private function rule( string $property, string $value, ?string $state = null, string $breakpoint = 'desktop' ): array {
		return compact( 'property', 'value', 'state', 'breakpoint' );
	}

	private function meta( array $overrides, array $generic_index = [], array $controls = [] ): V3_Context_Meta {
		return new V3_Context_Meta( 'theme-post-title', [ 'controls' => $controls ], $overrides, $generic_index );
	}

	public function test_simple_setting_converter__writes_setting_key() {
		$converter = new Simple_Setting_Converter( new Responsive_Key_Resolver() );
		$meta = $this->meta( [ 'color' => [ 'setting' => 'title_color', 'resolver' => 'color' ] ] );
		$ctx = new V3_Conversion_Context();

		$this->assertTrue( $converter->is_supported( $this->rule( 'color', '#111' ), $meta ) );
		$this->assertTrue( $converter->convert( $ctx, $this->rule( 'color', '#111' ), $meta ) );
		$this->assertSame( [ 'title_color' => '#111' ], $ctx->settings_patch() );
	}

	public function test_simple_setting_converter__responsive_writes_suffixed_key_when_control_exists() {
		$converter = new Simple_Setting_Converter( new Responsive_Key_Resolver() );
		$meta = $this->meta(
			[ 'font-size' => [ 'setting' => 'title_size', 'resolver' => 'dimension', 'responsive' => true ] ],
			[],
			[ 'title_size' => [], 'title_size_tablet' => [] ]
		);
		$ctx = new V3_Conversion_Context();

		$converter->convert( $ctx, $this->rule( 'font-size', '20px', null, 'tablet' ), $meta );

		$this->assertArrayHasKey( 'title_size_tablet', $ctx->settings_patch() );
	}

	public function test_simple_setting_converter__responsive_drops_when_variant_missing_but_base_exists() {
		$converter = new Simple_Setting_Converter( new Responsive_Key_Resolver() );
		$meta = $this->meta(
			[ 'font-size' => [ 'setting' => 'title_size', 'resolver' => 'dimension', 'responsive' => true ] ],
			[],
			[ 'title_size' => [] ]
		);
		$ctx = new V3_Conversion_Context();

		$result = $converter->convert( $ctx, $this->rule( 'font-size', '20px', null, 'tablet' ), $meta );

		$this->assertFalse( $result );
		$this->assertSame( [], $ctx->settings_patch() );
	}

	public function test_typography_group_converter__pushes_declaration_into_bucket() {
		$converter = new Typography_Group_Converter();
		$meta = $this->meta( [ 'font-size' => [ 'typography_prefix' => 'typography', 'responsive' => true ] ] );
		$ctx = new V3_Conversion_Context();

		$converter->convert( $ctx, $this->rule( 'font-size', '18px' ), $meta );

		$buckets = $ctx->typography_buckets();
		$this->assertCount( 1, $buckets );
		$bucket = array_values( $buckets )[0];
		$this->assertSame( 'typography', $bucket['prefix'] );
		$this->assertSame( 'desktop', $bucket['breakpoint'] );
		$this->assertSame( [ 'font-size' => '18px' ], $bucket['declarations'] );
	}

	public function test_border_shorthand_converter__explodes_border_shorthand() {
		$converter = new Border_Shorthand_Converter();
		$meta = $this->meta( [ 'border' => [ 'border_prefix' => 'image_border' ] ] );
		$ctx = new V3_Conversion_Context();

		$this->assertTrue( $converter->convert( $ctx, $this->rule( 'border', '2px solid #000' ), $meta ) );

		$patch = $ctx->settings_patch();
		$this->assertSame( 'solid', $patch['image_border_border'] );
		$this->assertSame( '#000', $patch['image_border_color'] );
		$this->assertArrayHasKey( 'image_border_width', $patch );
	}

	public function test_box_shadow_prefix_converter__writes_toggle_and_shape() {
		$converter = new Box_Shadow_Prefix_Converter();
		$meta = $this->meta( [ 'box-shadow' => [ 'box_shadow_prefix' => 'image' ] ] );
		$ctx = new V3_Conversion_Context();

		$this->assertTrue( $converter->convert( $ctx, $this->rule( 'box-shadow', '2px 4px 8px rgba(0,0,0,0.3)' ), $meta ) );

		$patch = $ctx->settings_patch();
		$this->assertSame( 'yes', $patch['image_box_shadow_type'] );
		$this->assertIsArray( $patch['image_box_shadow'] );
	}

	public function test_generic_index_converter__falls_back_on_index_entry() {
		$converter = new Generic_Index_Converter();
		$meta = $this->meta(
			[],
			[ 'gap' => [ 'setting' => 'extra_gap', 'resolver' => 'dimension', 'responsive' => false ] ]
		);
		$ctx = new V3_Conversion_Context();

		$this->assertTrue( $converter->is_supported( $this->rule( 'gap', '12px' ), $meta ) );
		$this->assertTrue( $converter->convert( $ctx, $this->rule( 'gap', '12px' ), $meta ) );
		$this->assertSame( [ 'unit' => 'px', 'size' => 12.0 ], $ctx->settings_patch()['extra_gap'] );
	}

	public function test_generic_index_converter__drops_when_non_desktop_variant_missing() {
		$converter = new Generic_Index_Converter();
		$meta = $this->meta(
			[],
			[ 'gap' => [ 'setting' => 'extra_gap', 'resolver' => 'dimension', 'responsive' => false ] ]
		);
		$ctx = new V3_Conversion_Context();

		$result = $converter->convert( $ctx, $this->rule( 'gap', '12px', null, 'tablet' ), $meta );

		$this->assertFalse( $result );
		$this->assertSame( [], $ctx->settings_patch() );
	}
}
