<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Elements_Manager;
use Elementor\Modules\Mcp\Abilities\List_Widget_Schemas_Ability;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;
use Elementor\Plugin;
use Elementor\Widgets_Manager;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_List_Widget_Schemas_Ability extends Elementor_Test_Base {

	private List_Widget_Schemas_Ability $ability;
	private Widgets_Manager $original_widgets_manager;
	private Elements_Manager $original_elements_manager;

	public function setUp(): void {
		parent::setUp();
		$this->ability = new List_Widget_Schemas_Ability();
		$this->original_widgets_manager = Plugin::$instance->widgets_manager;
		$this->original_elements_manager = Plugin::$instance->elements_manager;
	}

	public function tearDown(): void {
		Plugin::$instance->widgets_manager = $this->original_widgets_manager;
		Plugin::$instance->elements_manager = $this->original_elements_manager;
		parent::tearDown();
	}

	public function test_execute__includes_allowlisted_v3_and_excludes_other_v3() {
		$this->act_as_admin();
		$this->given_widget_manager_with_v3_widgets( [
			'nav-menu' => [ 'menu' => [ 'type' => 'select' ] ],
			'fake-v3' => [ 'title' => [ 'type' => 'text' ] ],
		] );

		$result = $this->ability->execute( [] );

		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'nav-menu', $result );
		$this->assertSame( Widget_Context_Helper::VERSION_V3, $result['nav-menu']['widget_version'] );
		$this->assertArrayNotHasKey( 'fake-v3', $result );
	}

	public function test_execute__summary_falls_back_to_registry_description_for_v3_post_widgets() {
		$this->act_as_admin();
		$this->given_widget_manager_with_v3_widgets_no_description( [
			'theme-post-title' => [ 'title' => [ 'type' => 'text' ] ],
			'theme-post-featured-image' => [ 'image' => [ 'type' => 'media' ] ],
			'theme-post-excerpt' => [ 'excerpt' => [ 'type' => 'text' ] ],
			'theme-post-content' => [ 'align' => [ 'type' => 'select' ] ],
		] );

		$result = $this->ability->execute( [ 'summary' => true ] );

		$descriptions_by_type = [];
		foreach ( $result['widgets'] as $summary ) {
			$descriptions_by_type[ $summary['type'] ] = $summary['description'] ?? null;
		}

		$this->assertStringContainsString( 'e-heading', $descriptions_by_type['theme-post-title'] );
		$this->assertStringContainsString( 'e-image', $descriptions_by_type['theme-post-featured-image'] );
		$this->assertStringContainsString( 'post-excerpt', $descriptions_by_type['theme-post-excerpt'] );
		$this->assertStringContainsString( 'single-template', $descriptions_by_type['theme-post-content'] );
		$this->assertStringContainsString( 'loop', $descriptions_by_type['theme-post-content'] );
	}

	public function test_execute__schema_falls_back_to_registry_description_for_v3_post_widgets() {
		$this->act_as_admin();
		$this->given_widget_manager_with_v3_widgets_no_description( [
			'theme-post-title' => [ 'title' => [ 'type' => 'text' ] ],
		] );

		$result = $this->ability->execute( [] );

		$this->assertArrayHasKey( 'theme-post-title', $result );
		$this->assertStringContainsString( 'e-heading', $result['theme-post-title']['description'] );
	}

	public function test_execute__summary_includes_allowlisted_v3_type() {
		$this->act_as_admin();
		$this->given_widget_manager_with_v3_widgets( [
			'nav-menu' => [ 'menu' => [ 'type' => 'select' ] ],
			'fake-v3' => [ 'title' => [ 'type' => 'text' ] ],
		] );

		$result = $this->ability->execute( [ 'summary' => true ] );

		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'widgets', $result );

		$types = array_column( $result['widgets'], 'type' );
		$this->assertContains( 'nav-menu', $types );
		$this->assertNotContains( 'fake-v3', $types );
	}

	/**
	 * @param array<string, array> $widgets_by_type widget_type => controls
	 */
	private function given_widget_manager_with_v3_widgets_no_description( array $widgets_by_type ): void {
		$this->given_widget_manager_with_v3_widgets( $widgets_by_type, null );
	}

	/**
	 * @param array<string, array> $widgets_by_type widget_type => controls
	 */
	private function given_widget_manager_with_v3_widgets( array $widgets_by_type, ?string $description = 'Fake V3 widget' ): void {
		$instances = [];

		foreach ( $widgets_by_type as $type => $controls ) {
			$instances[ $type ] = new class( $controls, $description ) {
				private array $controls;
				private ?string $description;

				public function __construct( array $controls, ?string $description ) {
					$this->controls = $controls;
					$this->description = $description;
				}

				public function get_config(): array {
					$meta = null === $this->description ? [] : [ 'description' => $this->description ];

					return [
						'controls' => $this->controls,
						'atomic_props_schema' => null,
						'title' => 'Fake V3',
						'meta' => $meta,
					];
				}
			};
		}

		$widgets_manager = $this->createMock( Widgets_Manager::class );
		$widgets_manager->method( 'get_widget_types' )->willReturnCallback(
			static function ( $name = null ) use ( $instances ) {
				if ( null === $name ) {
					return $instances;
				}

				return $instances[ $name ] ?? null;
			}
		);
		Plugin::$instance->widgets_manager = $widgets_manager;

		$elements_manager = $this->createMock( Elements_Manager::class );
		$elements_manager->method( 'get_element_types' )->willReturn( [] );
		Plugin::$instance->elements_manager = $elements_manager;
	}
}
