<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Build_Composition_Ability;
use Elementor\Modules\Mcp\Abilities\Render_Page_Ability;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Render_Page_Ability extends Elementor_Test_Base {

	public function test_execute__returns_rendered_text_for_document() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		( new Build_Composition_Ability() )->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'element_config' => [
				'h1' => [
					'title' => [
						'content' => 'Render Snapshot Heading',
						'children' => [],
					],
				],
			],
		] );

		$result = ( new Render_Page_Ability() )->execute( [
			'post_id' => $post_id,
		] );

		$this->assertIsArray( $result );
		$this->assertSame( $post_id, $result['post_id'] );
		$this->assertNotEmpty( $result['html'] );
		$this->assertStringContainsString( '<style>', $result['html'] );
		$this->assertStringContainsString( 'Render Snapshot Heading', $result['text'] );
		$this->assertStringContainsString( 'Render Snapshot Heading', $result['html'] );
	}

	public function test_execute__rejects_published_document_without_draft() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		wp_update_post( [
			'ID' => $post_id,
			'post_status' => 'publish',
		] );

		$result = ( new Render_Page_Ability() )->execute( [
			'post_id' => $post_id,
		] );

		$this->assertWPError( $result );
		$this->assertSame( 'no_draft_preview', $result->get_error_code() );
	}

	public function test_execute__scopes_render_to_element_id() {
		$this->act_as_admin();
		$post_id = $this->create_real_document();
		$root_id = $this->given_heading_on_document( $post_id, 'Scoped Heading Text' );

		$result = ( new Render_Page_Ability() )->execute( [
			'post_id' => $post_id,
			'element_id' => $root_id,
		] );

		$this->assertIsArray( $result );
		$this->assertSame( $root_id, $result['element_id'] );
		$this->assertStringContainsString( 'Scoped Heading Text', $result['text'] );
	}

	private function given_heading_on_document( int $post_id, string $title ): string {
		$result = ( new Build_Composition_Ability() )->execute( [
			'post_id' => $post_id,
			'xml_structure' => '<e-heading configuration-id="h1"/>',
			'element_config' => [
				'h1' => [
					'title' => [
						'content' => $title,
						'children' => [],
					],
				],
			],
		] );

		$this->assertIsArray( $result );

		return $result['root_element_ids'][0];
	}
}
