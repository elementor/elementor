<?php

namespace Elementor\Testing\Modules\AtomicWidgets\ChildrenDependencies;

use Elementor\Modules\AtomicWidgets\ChildrenDependencies\Child_Dependency;
use Elementor\Modules\AtomicWidgets\Elements\Base\Element_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\Utils\Element_Position;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_With_No_Dependencies extends Div_Block {}

class Widget_With_Builder_Rule extends Div_Block {
	protected function define_children_dependencies(): array {
		return [
			Child_Dependency::for( 'e-pagination' )
				->when(
					Dependency_Manager::make()->where( [
						'operator' => 'eq',
						'path' => [ 'pagination' ],
						'value' => true,
					] )
				)
				->position( Element_Position::after_type( 'e-collection-loop-layout' ) )
				->stash( true )
				->default_model( [ 'elType' => 'e-pagination', 'isLocked' => true ] ),
		];
	}
}

class Widget_With_Hydrated_Default_Model extends Div_Block {
	protected function define_children_dependencies(): array {
		return [
			Child_Dependency::for( 'e-pagination' )
				->when(
					Dependency_Manager::make()->where( [
						'operator' => 'eq',
						'path' => [ 'pagination' ],
						'value' => true,
					] )
				)
				->position( Element_Position::last() )
				->stash( false )
				->default_model(
					Element_Builder::make( 'e-pagination' )
						->is_locked( true )
						->hydrate_default_children( true )
						->build()
				),
		];
	}
}

class Widget_With_Raw_Rule extends Div_Block {
	protected function define_children_dependencies(): array {
		return [
			[
				'child_type' => 'e-pagination',
				'when' => [ 'relation' => 'or', 'terms' => [] ],
				'position' => [ 'kind' => 'last', 'value' => null ],
				'stash' => false,
				'default_model' => null,
			],
		];
	}
}

class Test_Children_Dependencies_In_Config extends Elementor_Test_Base {

	private function get_initial_config( $widget ): array {
		$reflection = new \ReflectionMethod( get_class( $widget ), 'get_initial_config' );
		$reflection->setAccessible( true );

		return $reflection->invoke( $widget );
	}

	private function make_widget( string $class ) {
		return new $class( [
			'id' => 'test',
			'elType' => 'widget',
			'widgetType' => Div_Block::get_element_type(),
			'settings' => [],
		], null );
	}

	public function test_default_widget_emits_empty_children_dependencies() {
		// Act.
		$config = $this->get_initial_config( $this->make_widget( Widget_With_No_Dependencies::class ) );

		// Assert.
		$this->assertArrayHasKey( 'children_dependencies', $config );
		$this->assertSame( [], $config['children_dependencies'] );
	}

	public function test_builder_rules_are_built_into_config() {
		// Act.
		$config = $this->get_initial_config( $this->make_widget( Widget_With_Builder_Rule::class ) );

		// Assert.
		$this->assertCount( 1, $config['children_dependencies'] );

		$rule = $config['children_dependencies'][0];
		$this->assertSame( 'e-pagination', $rule['child_type'] );
		$this->assertSame( 'after_type', $rule['position']['kind'] );
		$this->assertSame( 'e-collection-loop-layout', $rule['position']['value'] );
		$this->assertTrue( $rule['stash'] );
		$this->assertSame( [ 'elType' => 'e-pagination', 'isLocked' => true ], $rule['default_model'] );
		$this->assertSame( [ 'pagination' ], $rule['when']['terms'][0]['path'] );
	}

	public function test_default_model_carries_hydrate_flag_when_opted_in_via_builder() {
		// Act.
		$config = $this->get_initial_config( $this->make_widget( Widget_With_Hydrated_Default_Model::class ) );

		// Assert.
		$default_model = $config['children_dependencies'][0]['default_model'];
		$this->assertSame( 'e-pagination', $default_model['elType'] );
		$this->assertTrue( $default_model['hydrateDefaultChildren'] );
	}

	public function test_default_model_omits_hydrate_flag_by_default() {
		// Act.
		$config = $this->get_initial_config( $this->make_widget( Widget_With_Builder_Rule::class ) );

		// Assert.
		$default_model = $config['children_dependencies'][0]['default_model'];
		$this->assertArrayNotHasKey( 'hydrateDefaultChildren', $default_model );
	}

	public function test_raw_array_rules_are_rejected() {
		// Arrange.
		$widget = $this->make_widget( Widget_With_Raw_Rule::class );

		// Assert.
		$this->expectException( \InvalidArgumentException::class );
		$this->expectExceptionMessageMatches( '/must return Child_Dependency instances/' );

		// Act.
		$this->get_initial_config( $widget );
	}
}
