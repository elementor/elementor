<?php

use Elementor\Modules\DataFlow\State_Params;
use Elementor\Modules\DataFlow\State_Scopes;
use PHPUnit\Framework\TestCase;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\DataFlow
 */
class Test_State_Scopes extends TestCase {

	public function test_merged_state__falls_back_to_the_page_state_outside_any_scope() {
		// Arrange
		$scopes = new State_Scopes( [ 'site' => 'My Site' ] );

		// Act
		$tag = $scopes->enter( 'plain', [] );
		$state = $scopes->merged_state();
		$scopes->leave();

		// Assert
		$this->assertNull( $tag );
		$this->assertSame( [ 'site' => 'My Site' ], $state );
		$this->assertSame( [], $scopes->get_scopes() );
	}

	public function test_enter__nested_containers_open_scopes_where_the_nearest_wins() {
		// Arrange
		$scopes = new State_Scopes( [ 'count' => 100, 'site' => 'My Site' ] );

		// Act
		$outer_tag = $scopes->enter( 'outer', $this->container_with_params( [
			[ 'key' => 'count', 'type' => 'number', 'default' => 1 ],
			[ 'key' => 'step', 'type' => 'number', 'default' => 2 ],
		] ) );
		$inner_tag = $scopes->enter( 'inner', $this->container_with_params( [
			[ 'key' => 'count', 'type' => 'number', 'default' => '{{state.step}}' ],
		] ) );
		$inner_state = $scopes->merged_state();
		$scopes->leave();
		$outer_state = $scopes->merged_state();
		$scopes->leave();
		$page_state = $scopes->merged_state();

		// Assert
		$this->assertSame( 'outer', $outer_tag );
		$this->assertSame( 'inner', $inner_tag );
		$this->assertSame( [ 'count' => 2, 'site' => 'My Site', 'step' => 2 ], $inner_state );
		$this->assertSame( [ 'count' => 1, 'site' => 'My Site', 'step' => 2 ], $outer_state );
		$this->assertSame( [ 'count' => 100, 'site' => 'My Site' ], $page_state );
		$this->assertSame( [
			[ 'id' => 'outer', 'parentId' => null, 'state' => [ 'count' => 1, 'step' => 2 ] ],
			[ 'id' => 'inner', 'parentId' => 'outer', 'state' => [ 'count' => 2 ] ],
		], $scopes->get_scopes() );
	}

	public function test_enter__component_instances_scope_their_roots_with_merged_instance_state() {
		// Arrange
		$scopes = new State_Scopes( [ 'initial' => 7 ] );
		$component_params = [
			[ 'key' => 'start', 'label' => 'Start', 'type' => 'number', 'default' => 0 ],
			[ 'key' => 'label', 'label' => 'Label', 'type' => 'string', 'default' => 'Count' ],
		];

		// Act
		$first_instance_tag = $scopes->enter( 'instance-a', [ 'state' => [ 'start' => '5' ] ], $component_params );
		$first_root_tag = $scopes->enter( 'root-a', $this->container_with_params( $component_params ) );
		$first_child_tag = $scopes->enter( 'child-a', [] );
		$first_state = $scopes->merged_state();
		$scopes->leave();
		$scopes->leave();
		$scopes->leave();

		$second_instance_tag = $scopes->enter( 'instance-b', [ 'state' => [ 'start' => '{{state.initial}}' ] ], $component_params );
		$second_root_tag = $scopes->enter( 'root-b', [] );
		$second_state = $scopes->merged_state();
		$scopes->leave();
		$scopes->leave();

		// Assert
		$this->assertNull( $first_instance_tag );
		$this->assertSame( 'instance-a', $first_root_tag );
		$this->assertNull( $first_child_tag );
		$this->assertSame( 5, $first_state['start'] );
		$this->assertNull( $second_instance_tag );
		$this->assertSame( 'instance-b', $second_root_tag );
		$this->assertSame( 7, $second_state['start'] );
		$this->assertSame( [
			[ 'id' => 'instance-a', 'parentId' => null, 'state' => [ 'start' => 5, 'label' => 'Count' ] ],
			[ 'id' => 'instance-b', 'parentId' => null, 'state' => [ 'start' => 7, 'label' => 'Count' ] ],
		], $scopes->get_scopes() );
	}

	public function test_enter__component_instance_inside_a_scope_uses_it_as_parent() {
		// Arrange
		$scopes = new State_Scopes( [] );
		$component_params = [ [ 'key' => 'start', 'label' => 'Start', 'type' => 'number', 'default' => '{{state.base}}' ] ];

		// Act
		$scopes->enter( 'section', $this->container_with_params( [ [ 'key' => 'base', 'type' => 'number', 'default' => 3 ] ] ) );
		$scopes->enter( 'instance', [], $component_params );
		$scopes->leave();
		$scopes->leave();

		// Assert
		$this->assertSame( [ 'id' => 'instance', 'parentId' => 'section', 'state' => [ 'start' => 3 ] ], $scopes->get_scopes()[1] );
	}

	public function test_tag_root_element__adds_the_scope_attribute_to_the_first_opening_tag() {
		// Arrange
		$html = "\n<!-- comment --><div class=\"e-con\"><p>Text</p></div>";

		// Act
		$result = State_Scopes::tag_root_element( $html, 'abc"1' );

		// Assert
		$this->assertSame( "\n<!-- comment --><div data-e-scope=\"abc&quot;1\" class=\"e-con\"><p>Text</p></div>", $result );
	}

	private function container_with_params( array $params ): array {
		return [ State_Params::DATA_KEY => $params ];
	}
}
