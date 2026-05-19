<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Styles;

use Elementor\Modules\AtomicWidgets\Styles\Dynamic_Styles_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Dynamic_Styles_Manager extends Elementor_Test_Base {

	public function tearDown(): void {
		Dynamic_Styles_Manager::reset();

		parent::tearDown();
	}

	public function test_register_returns_stable_var_name_for_same_node(): void {
		$manager = Dynamic_Styles_Manager::instance();
		$node = $this->get_sample_dynamic_node();

		$first = $manager->register( $node );
		$second = $manager->register( $node );

		$this->assertNotSame( '', $first );
		$this->assertSame( $first, $second );
		$this->assertStringStartsWith( Dynamic_Styles_Manager::VAR_PREFIX, $first );
	}

	public function test_serialize_and_hydrate_round_trip(): void {
		$manager = Dynamic_Styles_Manager::instance();
		$node = $this->get_sample_dynamic_node();
		$var_name = $manager->register( $node );

		$serialized = $manager->serialize();

		Dynamic_Styles_Manager::reset();
		$hydrated = Dynamic_Styles_Manager::instance();
		$hydrated->hydrate( $serialized );

		$html = $hydrated->render_for_post( 1, '<span>item</span>' );

		$this->assertStringContainsString( $var_name, $serialized );
		$this->assertStringContainsString( '<span>item</span>', $html );
	}

	public function test_render_for_post_returns_html_unchanged_when_registry_empty(): void {
		$manager = Dynamic_Styles_Manager::instance();
		$html = '<p>content</p>';

		$this->assertSame( $html, $manager->render_for_post( 1, $html ) );
	}

	public function test_render_for_post_returns_unchanged_when_tags_do_not_resolve(): void {
		$manager = Dynamic_Styles_Manager::instance();
		$manager->register( $this->get_sample_dynamic_node() );

		$html = '<span>item</span>';

		$this->assertSame( $html, $manager->render_for_post( 1, $html, [ 'class' => 'e-loop-item' ] ) );
	}

	/**
	 * @return array
	 */
	private function get_sample_dynamic_node(): array {
		return [
			'$$type' => 'dynamic',
			'value' => [
				'name' => 'non-existent-tag-for-unit-test',
				'group' => 'post',
				'settings' => [],
			],
		];
	}
}
