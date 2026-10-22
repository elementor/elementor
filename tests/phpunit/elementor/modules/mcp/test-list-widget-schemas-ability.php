<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Elements_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Get_Widget_Schema_Ability;
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
	private Get_Widget_Schema_Ability $get_schema_ability;
	private Widgets_Manager $original_widgets_manager;
	private Elements_Manager $original_elements_manager;

	/**
	 * @var array<string, string>
	 */
	private array $original_experiment_states = [];

	public function setUp(): void {
		parent::setUp();
		$this->ability = new List_Widget_Schemas_Ability();
		$this->get_schema_ability = new Get_Widget_Schema_Ability();
		$this->original_widgets_manager = Plugin::$instance->widgets_manager;
		$this->original_elements_manager = Plugin::$instance->elements_manager;
	}

	public function tearDown(): void {
		foreach ( $this->original_experiment_states as $experiment_name => $default_state ) {
			Plugin::$instance->experiments->set_feature_default_state( $experiment_name, $default_state );
			delete_option( Experiments_Manager::OPTION_PREFIX . $experiment_name );
		}

		V3_Widget_Map_Registry::reset_instance();
		Plugin::$instance->widgets_manager = $this->original_widgets_manager;
		Plugin::$instance->elements_manager = $this->original_elements_manager;
		parent::tearDown();
	}

	public function test_execute__includes_mapped_v3_and_excludes_other_v3() {
		$this->act_as_admin();
		$this->given_widget_manager_with_v3_widgets( [
			'nav-menu' => [ 'menu' => [ 'type' => 'select' ] ],
			'fake-v3' => [ 'title' => [ 'type' => 'text' ] ],
		] );
		$this->given_v3_maps_compiled_against_fixtures( [ 'nav-menu' ] );

		$result = $this->ability->execute( [] );

		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'nav-menu', $result );
		$this->assertSame( Widget_Context_Helper::VERSION_V3, $result['nav-menu']['widget_version'] );
		$this->assertArrayNotHasKey( 'fake-v3', $result );
	}

	public function test_execute__summary_uses_map_description_for_v3_post_widgets() {
		$this->act_as_admin();
		$this->given_widget_manager_with_v3_widgets_no_description( [
			'theme-post-title' => [ 'title' => [ 'type' => 'text' ] ],
			'theme-post-featured-image' => [ 'image' => [ 'type' => 'media' ] ],
			'theme-post-excerpt' => [ 'excerpt' => [ 'type' => 'text' ] ],
			'theme-post-content' => [ 'align' => [ 'type' => 'select' ] ],
		] );
		$this->given_v3_maps_compiled_against_fixtures( [ 'theme-post-title', 'theme-post-featured-image', 'theme-post-excerpt', 'theme-post-content' ] );

		$result = $this->ability->execute( [ 'summary' => true ] );

		$descriptions_by_type = [];
		foreach ( $result['widgets'] as $summary ) {
			$descriptions_by_type[ $summary['type'] ] = $summary['description'] ?? null;
		}

		$this->assertStringContainsString( 'e-heading', $descriptions_by_type['theme-post-title'] );
		$this->assertStringContainsString( 'e-image', $descriptions_by_type['theme-post-featured-image'] );
		$this->assertStringContainsString( 'post-excerpt', $descriptions_by_type['theme-post-excerpt'] );
		$this->assertStringContainsStringIgnoringCase( 'single-template', $descriptions_by_type['theme-post-content'] );
		$this->assertStringContainsString( 'loop', $descriptions_by_type['theme-post-content'] );
	}

	public function test_execute__schema_uses_map_description_for_v3_post_widgets() {
		$this->act_as_admin();
		$this->given_widget_manager_with_v3_widgets_no_description( [
			'theme-post-title' => [ 'title' => [ 'type' => 'text' ] ],
		] );
		$this->given_v3_maps_compiled_against_fixtures( [ 'theme-post-title' ] );

		$result = $this->ability->execute( [] );

		$this->assertArrayHasKey( 'theme-post-title', $result );
		$this->assertStringContainsString( 'e-heading', $result['theme-post-title']['description'] );
	}

	public function test_execute__summary_includes_mapped_v3_type() {
		$this->act_as_admin();
		$this->given_widget_manager_with_v3_widgets( [
			'nav-menu' => [ 'menu' => [ 'type' => 'select' ] ],
			'fake-v3' => [ 'title' => [ 'type' => 'text' ] ],
		] );
		$this->given_v3_maps_compiled_against_fixtures( [ 'nav-menu' ] );

		$result = $this->ability->execute( [ 'summary' => true ] );

		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'widgets', $result );

		$types = array_column( $result['widgets'], 'type' );
		$this->assertContains( 'nav-menu', $types );
		$this->assertNotContains( 'fake-v3', $types );
	}

	public function test_execute__does_not_promote_e_flexbox_in_list_but_get_widget_schema_succeeds() {
		$this->act_as_admin();
		$this->set_experiment_state( Atomic_Widgets_Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );

		$result = $this->ability->execute( [] );

		$this->assertArrayNotHasKey( 'e-flexbox', $result );

		$summary = $this->ability->execute( [ 'summary' => true ] );
		$types = array_column( $summary['widgets'], 'type' );
		$this->assertNotContains( 'e-flexbox', $types );

		$get_result = $this->get_schema_ability->execute( [ 'widget_type' => [ 'e-flexbox' ] ] )['schemas']['e-flexbox'];
		$this->assertIsArray( $get_result );
		$this->assertArrayHasKey( 'properties', $get_result );
		$this->assertStringContainsString( 'flex-direction to column', $get_result['description'] );
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

	/**
	 * @param string[] $widget_types
	 */
	private function given_v3_maps_compiled_against_fixtures( array $widget_types ): void {
		$map_files = require V3_Widget_Map_Registry::REGISTERED_MAPS_FILE;
		$advanced_controls = require self::fixture_path( 'advanced-tab-controls.php' );
		$maps = [];
		$controls = [];

		foreach ( $widget_types as $widget_type ) {
			$maps[ $widget_type ] = require $map_files[ $widget_type ];
			$controls[ $widget_type ] = ( require self::fixture_path( $widget_type . '-controls.php' ) ) + $advanced_controls;
		}

		V3_Widget_Map_Registry::set_instance( new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
			static fn( string $widget_type ) => $controls[ $widget_type ] ?? null,
			$maps,
			static fn() => true
		) );
	}

	private static function fixture_path( string $file ): string {
		return __DIR__ . '/fixtures/' . $file;
	}

	private function set_experiment_state( string $experiment_name, string $state ): void {
		if ( ! array_key_exists( $experiment_name, $this->original_experiment_states ) ) {
			$features = Plugin::$instance->experiments->get_features( $experiment_name );

			$this->original_experiment_states[ $experiment_name ] = $features['default'] ?? Experiments_Manager::STATE_DEFAULT;
		}

		Plugin::$instance->experiments->set_feature_default_state( $experiment_name, $state );
		delete_option( Experiments_Manager::OPTION_PREFIX . $experiment_name );
		V3_Widget_Map_Registry::reset_instance();
	}
}
