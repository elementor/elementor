<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Control_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Widget_Map_Registry extends TestCase {

	private int $compile_calls;

	public function setUp(): void {
		parent::setUp();

		$this->compile_calls = 0;
	}

	public function test_get_compiled_map__does_not_compile_when_experiment_inactive() {
		$registry = $this->registry( false, true, [
			'heading' => $this->valid_heading_map(),
		] );

		$result = $registry->get_compiled_map( 'heading' );

		$this->assertNull( $result );
		$this->assertSame( 0, $this->compile_calls );
	}

	public function test_get_compiled_map__returns_compiled_map_when_experiment_active() {
		$registry = $this->registry( true, false, [
			'heading' => $this->valid_heading_map(),
		] );

		$result = $registry->get_compiled_map( 'heading' );

		$this->assertFalse( is_wp_error( $result ) );
		$this->assertSame( 'heading', $result['widget_type'] );
		$this->assertGreaterThan( 0, $this->compile_calls );
	}

	public function test_get_compiled_map__caches_invalid_map_as_wp_error() {
		$map = $this->valid_heading_map();
		unset( $map['description'] );

		$registry = $this->registry( true, false, [
			'heading' => $map,
		] );

		$first = $registry->get_compiled_map( 'heading' );
		$second = $registry->get_compiled_map( 'heading' );

		$this->assertTrue( is_wp_error( $first ) );
		$this->assertSame( $first, $second );
		$this->assertSame( 1, $this->compile_calls );
	}

	public function test_is_supported__returns_false_for_missing_map() {
		$registry = $this->registry( true, false, [] );

		$this->assertFalse( $registry->is_supported( 'heading' ) );
		$this->assertNull( $registry->get_compiled_map( 'heading' ) );
	}

	public function test_is_supported__returns_false_for_v4_disabled_when_atomic_active() {
		$registry = $this->registry( true, true, [
			'heading' => $this->valid_heading_map(),
		] );

		$this->assertFalse( $registry->is_supported( 'heading' ) );
	}

	public function test_is_supported__allows_always_visibility_when_atomic_active() {
		$map = $this->valid_heading_map();
		$map['catalog_visibility'] = 'always';

		$registry = $this->registry( true, true, [
			'heading' => $map,
		] );

		$this->assertTrue( $registry->is_supported( 'heading' ) );
	}

	public function test_get_compiled_map__isolates_invalid_map_from_valid_sibling() {
		$invalid = $this->valid_heading_map();
		unset( $invalid['description'] );

		$registry = $this->registry( true, false, [
			'heading' => $invalid,
			'nav-menu' => $this->valid_nav_menu_map(),
		] );

		$heading = $registry->get_compiled_map( 'heading' );
		$nav_menu = $registry->get_compiled_map( 'nav-menu' );

		$this->assertTrue( is_wp_error( $heading ) );
		$this->assertFalse( is_wp_error( $nav_menu ) );
		$this->assertSame( 'nav-menu', $nav_menu['widget_type'] );
	}

	private function registry( bool $experiment_active, bool $atomic_active, array $maps ): V3_Widget_Map_Registry {
		$compiler = new V3_Widget_Map_Compiler();
		$controls = [
			'heading' => [
				'title' => [ 'type' => 'text' ],
				'title_color' => [ 'type' => 'color' ],
			],
			'nav-menu' => [
				'layout' => [ 'type' => 'select' ],
				'color_menu_item' => [ 'type' => 'color' ],
			],
		];

		return new V3_Widget_Map_Registry(
			$compiler,
			static function () use ( $experiment_active ): bool {
				return $experiment_active;
			},
			static function () use ( $atomic_active ): bool {
				return $atomic_active;
			},
			function ( string $widget_type ) use ( $controls ): ?array {
				++$this->compile_calls;
				return $controls[ $widget_type ] ?? null;
			},
			$maps
		);
	}

	private function valid_heading_map(): array {
		return [
			'widget_type' => 'heading',
			'description' => 'Heading widget.',
			'catalog_visibility' => 'v4_disabled',
			'settings' => [
				'title' => [ 'type' => 'text' ],
			],
			'default_style_target' => 'heading',
			'style_targets' => [
				'heading' => [
					'label' => 'Heading',
					'css_properties' => [
						'color' => [
							'default' => Style_Control_Target::control( 'title_color', 'color' ),
						],
					],
				],
			],
		];
	}

	private function valid_nav_menu_map(): array {
		return [
			'widget_type' => 'nav-menu',
			'description' => 'Navigation menu.',
			'catalog_visibility' => 'always',
			'settings' => [
				'layout' => [ 'type' => 'select' ],
			],
			'default_style_target' => 'main-menu',
			'style_targets' => [
				'main-menu' => [
					'label' => 'Main menu',
					'css_properties' => [
						'color' => [
							'default' => Style_Control_Target::control( 'color_menu_item', 'color' ),
						],
					],
				],
			],
		];
	}
}
