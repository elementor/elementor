<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3_Node_Bridge;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Subtree_Builder;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Subtree_Builder_V3_Seed extends TestCase {

	const MAPPED_WIDGET_TYPE = 'theme-post-title';

	protected function setUp(): void {
		parent::setUp();

		V3_Widget_Map_Registry::set_instance( $this->registry() );
	}

	protected function tearDown(): void {
		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	public function test_build__seeds_v3_dynamic_defaults_from_widget_config_controls() {
		$xml_parser = new Xml_Parser();
		$builder = new Subtree_Builder( $xml_parser );

		$dom = $xml_parser->parse( '<theme-post-title configuration-id="t1"></theme-post-title>' );

		$widget_configs = [
			'theme-post-title' => [
				'elType' => 'widget',
				'widgetType' => 'theme-post-title',
				'allowed_child_types' => [],
				'class' => 'FakeThemePostTitleWidget',
				'controls' => [
					'title' => [
						'type' => 'text',
						'dynamic' => [ 'default' => '[elementor-tag id="post-title"]' ],
					],
					'body' => [ 'type' => 'text' ],
				],
			],
		];

		$subtrees = $builder->build( $dom, $widget_configs );

		$this->assertCount( 1, $subtrees );
		$this->assertSame(
			[ 'title' => '[elementor-tag id="post-title"]' ],
			$subtrees[0]['settings']['__dynamic__'] ?? []
		);
	}

	public function test_seed_dynamic_defaults__preserves_caller_provided_dynamic_overrides() {
		$node = [
			'elType' => 'widget',
			'widgetType' => 'theme-post-title',
			'settings' => [
				'__dynamic__' => [ 'title' => '[elementor-tag id="custom-title"]' ],
			],
		];
		$controls = [
			'title' => [
				'type' => 'text',
				'dynamic' => [ 'default' => '[elementor-tag id="post-title"]' ],
			],
		];

		V3_Node_Bridge::seed_dynamic_defaults( $node, $controls );

		$this->assertSame(
			[ 'title' => '[elementor-tag id="custom-title"]' ],
			$node['settings']['__dynamic__']
		);
	}

	public function test_build__skips_v4_atomic_widgets_even_when_controls_are_present() {
		$xml_parser = new Xml_Parser();
		$builder = new Subtree_Builder( $xml_parser );

		$dom = $xml_parser->parse( '<e-heading configuration-id="h1"></e-heading>' );

		$widget_configs = [
			'e-heading' => [
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'allowed_child_types' => [],
				'class' => 'FakeAtomicHeadingWidget',
				'controls' => [
					'title' => [
						'type' => 'text',
						'dynamic' => [ 'default' => '[elementor-tag id="post-title"]' ],
					],
				],
			],
		];

		$subtrees = $builder->build( $dom, $widget_configs );

		$this->assertSame( [], $subtrees[0]['settings'] );
	}

	private function registry(): V3_Widget_Map_Registry {
		$map = V3_Widget_Map::make( self::MAPPED_WIDGET_TYPE )
			->description( 'Theme post title.' )
			->default_target( Style_Target::make( 'title' ) );

		return new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler( [] ),
			static fn() => [],
			[ self::MAPPED_WIDGET_TYPE => $map ],
			static fn() => false
		);
	}
}
