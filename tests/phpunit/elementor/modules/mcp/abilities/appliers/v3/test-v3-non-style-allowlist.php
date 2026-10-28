<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Non_Style_Allowlist;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Non_Style_Allowlist extends TestCase {

	const WIDGET_TYPE = 'nav-menu';

	const UNMAPPED_WIDGET_TYPE = 'theme-post-content';

	protected function setUp(): void {
		parent::setUp();

		V3_Widget_Map_Registry::set_instance( $this->registry() );
	}

	protected function tearDown(): void {
		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	public function test_filter__allows_the_map_setting_keys() {
		// Arrange.
		$settings = [ 'menu_name' => 'primary' ];

		// Act.
		$result = V3_Non_Style_Allowlist::filter( self::WIDGET_TYPE, $settings );

		// Assert.
		$this->assertNull( $result['error'] );
		$this->assertSame( $settings, $result['allowed'] );
		$this->assertEmpty( $result['rejected'] );
	}

	public function test_filter__rejects_keys_outside_the_map() {
		// Arrange.
		$settings = [
			'menu_name' => 'primary',
			'title_color' => '#ff0000',
		];

		// Act.
		$result = V3_Non_Style_Allowlist::filter( self::WIDGET_TYPE, $settings );

		// Assert.
		$this->assertSame( 'elementor_invalid_settings', $result['error']->get_error_code() );
		$this->assertSame( [ 'menu_name' => 'primary' ], $result['allowed'] );
		$this->assertSame( [ 'title_color' ], $result['rejected'] );
	}

	public function test_filter__rejects_every_key_of_a_widget_without_a_map() {
		// Act.
		$result = V3_Non_Style_Allowlist::filter( self::UNMAPPED_WIDGET_TYPE, [ 'align' => 'center' ] );

		// Assert.
		$this->assertNotNull( $result['error'] );
		$this->assertEmpty( $result['allowed'] );
		$this->assertSame( [ 'align' ], $result['rejected'] );
	}

	private function registry(): V3_Widget_Map_Registry {
		$map = V3_Widget_Map::make( self::WIDGET_TYPE )
			->description( 'Nav menu.' )
			->settings( [ 'menu_name' => V3_Setting::bind_to( 'menu_name' )->string() ] )
			->default_target( Style_Target::make( 'menu' ) );

		return new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler( [] ),
			static fn() => [ 'menu_name' => [ 'type' => 'text' ] ],
			[ self::WIDGET_TYPE => $map ],
			static fn() => false
		);
	}
}
