<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Browse_Site_Resources_Ability;
use Elementor\Modules\Mcp\Abilities\Site_Resources_Gallery_Ui_Ability;
use Elementor\Modules\Mcp\Preview\Site_Resource_Preview_Token;
use Elementor\Plugin;
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

	public function test_execute_widget_items_match_editor_panel_visibility() {
		// Arrange
		$ability = new Browse_Site_Resources_Ability();

		// Act
		$result = $ability->execute( [ 'type' => 'widget', 'limit' => Browse_Site_Resources_Ability::MAX_LIMIT ] );

		// Assert
		$widget_types = Plugin::$instance->widgets_manager->get_widget_types();

		foreach ( $result['items'] as $item ) {
			$this->assertSame( 'widget', $item['kind'] );
			$this->assertNotSame( '', trim( (string) $item['title'] ) );
			$this->assertArrayHasKey( $item['id'], $widget_types );
			$this->assertTrue( $widget_types[ $item['id'] ]->show_in_panel() );
		}

		if ( isset( $widget_types['common-base'] ) ) {
			$ids = wp_list_pluck( $result['items'], 'id' );
			$this->assertNotContains( 'common-base', $ids );
		}
	}

	public function test_execute_includes_preview_url_for_elementor_posts_user_can_edit() {
		// Arrange
		$admin_id = $this->factory()->user->create( [ 'role' => 'administrator' ] );
		wp_set_current_user( $admin_id );

		$post_id = $this->factory()->post->create(
			[
				'post_type' => 'elementor_library',
				'post_status' => 'publish',
				'post_author' => $admin_id,
			]
		);
		update_post_meta( $post_id, '_elementor_edit_mode', 'builder' );
		update_post_meta( $post_id, '_elementor_data', '[]' );
		update_post_meta( $post_id, '_elementor_template_type', 'section' );

		$ability  = new Browse_Site_Resources_Ability();
		$preview  = new \ReflectionMethod( $ability, 'preview_url_for_post' );
		$preview->setAccessible( true );

		// Act
		$preview_url = $preview->invoke( $ability, $post_id );

		// Assert
		$this->assertNotSame( '', $preview_url );
		$this->assertStringContainsString( Site_Resource_Preview_Token::QUERY_ARG . '=', $preview_url );

		$query = wp_parse_url( $preview_url, PHP_URL_QUERY );
		parse_str( (string) $query, $params );
		$claims = Site_Resource_Preview_Token::decode(
			$params[ Site_Resource_Preview_Token::QUERY_ARG ],
			Site_Resource_Preview_Token::secret()
		);

		$this->assertSame( $post_id, $claims['post_id'] );
	}

	public function test_execute_widget_items_have_empty_preview_url() {
		// Arrange
		$ability = new Browse_Site_Resources_Ability();

		// Act
		$result = $ability->execute( [ 'type' => 'widget', 'limit' => 10 ] );

		// Assert
		foreach ( $result['items'] as $item ) {
			$this->assertSame( '', $item['preview_url'] );
		}
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
