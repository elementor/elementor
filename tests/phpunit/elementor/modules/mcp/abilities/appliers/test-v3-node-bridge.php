<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3_Node_Bridge;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Node_Bridge extends TestCase {

	const MAPPED_WIDGET_TYPE = 'nav-menu';

	const UNMAPPED_WIDGET_TYPE = 'button';

	protected function setUp(): void {
		parent::setUp();

		V3_Widget_Map_Registry::set_instance( $this->registry() );
	}

	protected function tearDown(): void {
		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	public function test_is_v3_node__true_for_mapped_widget() {
		// Arrange.
		$node = [
			'elType' => 'widget',
			'widgetType' => self::MAPPED_WIDGET_TYPE,
			'settings' => [],
		];

		// Act & Assert.
		$this->assertTrue( V3_Node_Bridge::is_v3_node( $node ) );
	}

	public function test_is_v3_node__false_for_section_element() {
		// Arrange: section is always rejected — only widget and container elements can be routed.
		$node = [
			'elType' => 'section',
			'settings' => [],
		];

		// Act & Assert.
		$this->assertFalse( V3_Node_Bridge::is_v3_node( $node ) );
	}

	public function test_is_v3_node__false_for_column_element() {
		// Arrange: column is always rejected — only widget elements can be routed.
		$node = [
			'elType' => 'column',
			'settings' => [],
		];

		// Act & Assert.
		$this->assertFalse( V3_Node_Bridge::is_v3_node( $node ) );
	}

	public function test_is_v3_node__false_for_container_element() {
		// Arrange.
		$node = [
			'elType' => 'container',
			'settings' => [],
		];

		// Act & Assert.
		$this->assertFalse( V3_Node_Bridge::is_v3_node( $node ) );
	}

	public function test_is_v3_node__false_for_widget_without_a_map() {
		// Arrange.
		$node = [
			'elType' => 'widget',
			'widgetType' => self::UNMAPPED_WIDGET_TYPE,
			'settings' => [],
		];

		// Act & Assert.
		$this->assertFalse( V3_Node_Bridge::is_v3_node( $node ) );
	}

	public function test_apply_classes__merges_with_existing_and_dedupes() {
		// Arrange.
		$node = [
			'elType' => 'widget',
			'widgetType' => self::MAPPED_WIDGET_TYPE,
			'settings' => [
				V3_Node_Bridge::V3_CSS_CLASSES_SETTING => 'existing shared',
			],
		];

		// Act.
		V3_Node_Bridge::apply_classes( $node, [ 'new', 'shared' ] );

		// Assert.
		$this->assertSame(
			'new shared existing',
			$node['settings'][ V3_Node_Bridge::V3_CSS_CLASSES_SETTING ]
		);
	}

	public function test_clear_classes__removes_css_classes_setting() {
		// Arrange.
		$node = [
			'settings' => [
				V3_Node_Bridge::V3_CSS_CLASSES_SETTING => 'menu-primary',
			],
		];

		// Act.
		V3_Node_Bridge::clear_classes( $node );

		// Assert.
		$this->assertArrayNotHasKey( V3_Node_Bridge::V3_CSS_CLASSES_SETTING, $node['settings'] );
	}

	private function registry(): V3_Widget_Map_Registry {
		$map = V3_Widget_Map::make( self::MAPPED_WIDGET_TYPE )
			->description( 'Nav menu.' )
			->default_target( Style_Target::make( 'menu' ) );

		return new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler( [] ),
			static fn() => [],
			[ self::MAPPED_WIDGET_TYPE => $map ],
			static fn() => false
		);
	}
}
