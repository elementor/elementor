<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Build_Composition;

use Elementor\Modules\Mcp\Abilities\Build_Composition\Subtree_Builder;
use Elementor\Modules\Mcp\Abilities\Build_Composition\Xml_Parser;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Subtree_Builder_V3_Seed extends TestCase {

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

	public function test_build__leaves_v4_atomic_widgets_untouched() {
		$xml_parser = new Xml_Parser();
		$builder = new Subtree_Builder( $xml_parser );

		$dom = $xml_parser->parse( '<e-heading configuration-id="h1"></e-heading>' );

		$widget_configs = [
			'e-heading' => [
				'elType' => 'widget',
				'widgetType' => 'e-heading',
				'allowed_child_types' => [],
				'class' => 'FakeAtomicHeadingWidget',
			],
		];

		$subtrees = $builder->build( $dom, $widget_configs );

		$this->assertSame( [], $subtrees[0]['settings'] );
	}
}
