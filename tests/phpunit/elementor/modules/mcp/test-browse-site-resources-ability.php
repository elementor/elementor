<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Browse_Site_Resources_Ability;
use Elementor\Modules\Mcp\Abilities\Site_Resources_Gallery_Ui_Ability;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Browse_Site_Resources_Ability extends Elementor_Test_Base {

	public function test_ability_id_and_ui_resource_uri_meta() {
		// Arrange
		$ability = new Browse_Site_Resources_Ability();

		// Act
		$definition = $this->get_definition( $ability );

		// Assert
		$this->assertSame( 'elementor/browse-site-resources', $this->get_ability_id( $ability ) );
		$this->assertSame(
			Site_Resources_Gallery_Ui_Ability::URI,
			$definition->meta['mcp']['_meta']['ui']['resourceUri']
		);
	}

	public function test_execute_returns_items_and_counts_with_default_input() {
		// Arrange
		$ability = new Browse_Site_Resources_Ability();

		// Act
		$result = $ability->execute( [] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'items', $result );
		$this->assertArrayHasKey( 'counts_by_type', $result );
		$this->assertIsArray( $result['items'] );
		$this->assertGreaterThan( 0, $result['counts_by_type']['widget'] ?? 0 );

		foreach ( $result['items'] as $item ) {
			$this->assertArrayHasKey( 'id', $item );
			$this->assertArrayHasKey( 'kind', $item );
			$this->assertArrayHasKey( 'title', $item );
			$this->assertArrayHasKey( 'edit_url', $item );
		}
	}

	public function test_execute_filters_widgets_by_type() {
		// Arrange
		$ability = new Browse_Site_Resources_Ability();

		// Act
		$result = $ability->execute( [ 'type' => 'widget', 'limit' => 60 ] );

		// Assert
		foreach ( $result['items'] as $item ) {
			$this->assertSame( 'widget', $item['kind'] );
		}
	}

	public function test_execute_search_narrows_widget_results() {
		// Arrange
		$ability = new Browse_Site_Resources_Ability();
		$all       = $ability->execute( [ 'type' => 'widget', 'limit' => 60 ] );
		$all_count = count( $all['items'] );

		// Act
		$filtered = $ability->execute( [ 'type' => 'widget', 'search' => 'heading', 'limit' => 60 ] );

		// Assert
		$this->assertLessThanOrEqual( $all_count, count( $filtered['items'] ) );
		foreach ( $filtered['items'] as $item ) {
			$haystack = strtolower( $item['title'] . ' ' . $item['subtype'] . ' ' . $item['category'] );
			$this->assertStringContainsString( 'heading', $haystack );
		}
	}

	public function test_execute_respects_limit_cap() {
		// Arrange
		$ability = new Browse_Site_Resources_Ability();

		// Act
		$result = $ability->execute( [ 'type' => 'widget', 'limit' => 999 ] );

		// Assert
		$this->assertLessThanOrEqual( Browse_Site_Resources_Ability::MAX_LIMIT, count( $result['items'] ) );
	}

	private function get_ability_id( Browse_Site_Resources_Ability $ability ): string {
		$reflection = new \ReflectionMethod( $ability, 'get_ability_id' );
		$reflection->setAccessible( true );
		return $reflection->invoke( $ability );
	}

	private function get_definition( Browse_Site_Resources_Ability $ability ) {
		$reflection = new \ReflectionMethod( $ability, 'get_definition' );
		$reflection->setAccessible( true );
		return $reflection->invoke( $ability );
	}
}
