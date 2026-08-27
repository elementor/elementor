<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Auto_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Widget_Map_Loader;
use Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Fixtures\V3_Widget_Fixtures;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/fixtures/v3-widget-fixtures.php';

class Test_V3_Widget_Map_Loader extends TestCase {

	public function test_search_field__accepts_padding_and_color_from_map_overrides() {
		// Arrange.
		$config = V3_Widget_Fixtures::widget_config( 'search' );
		$scope = V3_Widget_Map_Loader::get_inner_elements( 'search', $config['controls'] )['search-field'];

		// Act.
		$accepted = V3_Auto_Mapper::accepted_css_properties( $config, $scope );
		$states = V3_Auto_Mapper::supported_states( $config, $scope );

		// Assert.
		$this->assertContains( 'padding', $accepted );
		$this->assertContains( 'padding-top', $accepted );
		$this->assertContains( 'color', $accepted );
		$this->assertContains( 'focus', $states );
	}

	public function test_spacing_overrides_for__maps_shorthand_and_longhands() {
		// Arrange / Act.
		$overrides = V3_Widget_Map_Loader::spacing_overrides_for( 'search_field_padding' );

		// Assert.
		$this->assertSame( 'search_field_padding', $overrides['padding']['setting'] );
		$this->assertSame( 'sides', $overrides['padding']['resolver'] );
		$this->assertSame( 'top', $overrides['padding-top']['side'] );
	}
}
