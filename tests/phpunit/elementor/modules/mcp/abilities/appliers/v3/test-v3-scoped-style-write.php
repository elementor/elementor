<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Auto_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Scoped_Css_Splitter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper_Factory;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Widget_Map_Loader;
use Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Fixtures\V3_Widget_Fixtures;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/fixtures/v3-widget-fixtures.php';

/**
 * End-to-end write path for scoped CSS: what an LLM sends as `alias { ... }` has to land on the
 * widget's own native controls, which is what makes the styles editable in the V3 panel.
 */
class Test_V3_Scoped_Style_Write extends TestCase {

	private function mapper(): V3_Style_Mapper {
		return V3_Style_Mapper_Factory::create(
			new Css_Converter( new Converter_Registry(), new Null_Failure_Reporter() ),
			[ 'desktop', 'tablet', 'mobile' ]
		);
	}

	/**
	 * @return array{settings_patch: array<string, mixed>, unmapped: array<string, string>}
	 */
	private function apply_scoped_css( string $widget_type, string $css ): array {
		$config = V3_Widget_Fixtures::widget_config( $widget_type );
		$inner_elements = V3_Widget_Map_Loader::get_inner_elements( $widget_type, $config['controls'] );
		$split = V3_Scoped_Css_Splitter::split( $css, array_keys( $inner_elements ) );
		$mapper = $this->mapper();

		$settings_patch = [];
		$unmapped = [];

		foreach ( $split['scopes'] as $scope_key => $scope_css ) {
			$alias = explode( ':', $scope_key, 2 )[0];
			$result = $mapper->apply(
				V3_Scoped_Css_Splitter::scope_to_mapper_css( $scope_key, $scope_css ),
				$widget_type,
				$config,
				V3_Auto_Mapper::for_scope( $config, $inner_elements[ $alias ] )
			);

			$settings_patch = array_merge( $settings_patch, $result['settings_patch'] );

			if ( '' !== trim( $result['unmapped_css'] ?? '' ) ) {
				$unmapped[ $scope_key ] = $result['unmapped_css'];
			}
		}

		return [
			'settings_patch' => $settings_patch,
			'unmapped' => $unmapped,
		];
	}

	public function test_nav_menu__writes_each_alias_to_its_own_native_controls() {
		// Arrange.
		$css = 'main-menu { color: #1a3d2b; font-size: 1.125rem; padding-left: 1rem; } '
			. 'main-menu:hover { color: #4b9b6e; } '
			. 'dropdown { background-color: #f5f7fa; border-radius: 0.5rem; } '
			. 'toggle { font-size: 1.5rem; }';

		// Act.
		$patch = $this->apply_scoped_css( 'nav-menu', $css )['settings_patch'];

		// Assert.
		$this->assertSame( '#1a3d2b', $patch['color_menu_item'] );
		$this->assertSame( '#4b9b6e', $patch['color_menu_item_hover'] );
		$this->assertSame( '#f5f7fa', $patch['background_color_dropdown_item'] );
		$this->assertSame( 1.125, $patch['menu_typography_font_size']['size'] );
		$this->assertSame( 'rem', $patch['menu_typography_font_size']['unit'] );
		$this->assertSame( 'custom', $patch['menu_typography_typography'] );
		$this->assertSame( 1.0, $patch['padding_horizontal_menu_item']['size'] );
		$this->assertSame( '0.5', $patch['dropdown_border_radius']['top'] );
		$this->assertSame( 1.5, $patch['toggle_size']['size'] );
	}

	public function test_nav_menu__writes_a_media_wrapped_alias_block_to_the_responsive_setting() {
		// Arrange.
		$css = 'main-menu { font-size: 1.125rem; } @media(--mobile) { main-menu { font-size: 1rem; } }';

		// Act.
		$patch = $this->apply_scoped_css( 'nav-menu', $css )['settings_patch'];

		// Assert.
		$this->assertSame( 1.125, $patch['menu_typography_font_size']['size'] );
		$this->assertSame( 1.0, $patch['menu_typography_font_size_mobile']['size'] );
	}

	public function test_search__writes_group_control_siblings_per_alias() {
		// Arrange.
		$css = 'search-field { border-radius: 2rem; background-color: #ffffff; } submit { background-color: #1a3d2b; }';

		// Act.
		$patch = $this->apply_scoped_css( 'search', $css )['settings_patch'];

		// Assert.
		$this->assertSame( '2', $patch['search_field_border_radius']['top'] );
		$this->assertSame( '#ffffff', $patch['search_field_background_normal_color'] );
		$this->assertSame( 'classic', $patch['search_field_background_normal_background'] );
		$this->assertSame( '#1a3d2b', $patch['submit_background_normal_color'] );
		$this->assertSame( 'classic', $patch['submit_background_normal_background'] );
	}

	public function test_search__writes_padding_and_text_color_via_map_overrides() {
		// Arrange.
		$css = 'search-field { padding-top: 0.75rem; color: #1a3d2b; } submit { padding: 0.875rem 1.5rem; border-radius: 0.5rem; color: #ffffff; }';

		// Act.
		$patch = $this->apply_scoped_css( 'search', $css )['settings_patch'];

		// Assert.
		$this->assertSame( '0.75', $patch['search_field_padding']['top'] );
		$this->assertSame( '#1a3d2b', $patch['search_field_input_text_color_normal'] );
		$this->assertSame( '0.875', $patch['submit_padding']['top'] );
		$this->assertSame( '1.5', $patch['submit_padding']['right'] );
		$this->assertSame( '0.5', $patch['submit_border_radius']['top'] );
		$this->assertSame( '#ffffff', $patch['submit_text_color_normal'] );
	}

	public function test_unsupported_property__is_reported_as_unmapped_instead_of_written() {
		// Arrange.
		$css = 'main-menu { color: #1a3d2b; backdrop-filter: blur(4px); }';

		// Act.
		$result = $this->apply_scoped_css( 'nav-menu', $css );

		// Assert.
		$this->assertSame( '#1a3d2b', $result['settings_patch']['color_menu_item'] );
		$this->assertStringContainsString( 'backdrop-filter', $result['unmapped']['main-menu'] );
	}
}
