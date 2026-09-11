<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Parsers;

use Elementor\Modules\AtomicWidgets\Parsers\Settings_Variants_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Responsive_Settings;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Settings_Variants_Parser extends TestCase {

	private function schema(): array {
		return [
			'count' => Number_Prop_Type::make()->meta( Responsive_Settings::enable() ),
			'title' => String_Prop_Type::make(),
		];
	}

	public function test_parse__keeps_valid_non_desktop_overrides() {
		$result = Settings_Variants_Parser::make( $this->schema() )->parse( [
			[
				'meta' => [ 'breakpoint' => 'tablet' ],
				'props' => [
					'count' => [ '$$type' => 'number', 'value' => 2 ],
					'title' => [ '$$type' => 'string', 'value' => 'ignored' ],
				],
			],
		] );

		$this->assertTrue( $result->is_valid() );
		$variants = $result->unwrap();
		$this->assertCount( 1, $variants );
		$this->assertSame( 'tablet', $variants[0]['meta']['breakpoint'] );
		$this->assertSame( [ '$$type' => 'number', 'value' => 2 ], $variants[0]['props']['count'] );
		$this->assertArrayNotHasKey( 'title', $variants[0]['props'] );
	}

	public function test_parse__drops_desktop_variants() {
		$result = Settings_Variants_Parser::make( $this->schema() )->parse( [
			[
				'meta' => [ 'breakpoint' => 'desktop' ],
				'props' => [
					'count' => [ '$$type' => 'number', 'value' => 5 ],
				],
			],
		] );

		$this->assertTrue( $result->is_valid() );
		$this->assertSame( [], $result->unwrap() );
	}

	public function test_parse__skips_invalid_breakpoint() {
		$result = Settings_Variants_Parser::make( $this->schema() )->parse( [
			[
				'meta' => [ 'breakpoint' => 'not-a-breakpoint' ],
				'props' => [
					'count' => [ '$$type' => 'number', 'value' => 2 ],
				],
			],
			[
				'meta' => [ 'breakpoint' => 'mobile' ],
				'props' => [
					'count' => [ '$$type' => 'number', 'value' => 1 ],
				],
			],
		] );

		$this->assertFalse( $result->is_valid() );
		$variants = $result->unwrap();
		$this->assertCount( 1, $variants );
		$this->assertSame( 'mobile', $variants[0]['meta']['breakpoint'] );
	}

	public function test_parse__drops_empty_props_after_sanitize() {
		$result = Settings_Variants_Parser::make( $this->schema() )->parse( [
			[
				'meta' => [ 'breakpoint' => 'tablet' ],
				'props' => [
					'title' => [ '$$type' => 'string', 'value' => 'ignored' ],
				],
			],
		] );

		$this->assertTrue( $result->is_valid() );
		$this->assertSame( [], $result->unwrap() );
	}
}
