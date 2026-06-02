<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Manage_Post_Ability;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Full create → save → update_element flow for e-svg, exercising the inline
 * upload + surgical patch paths against a real document.
 *
 * @group Elementor\Modules\Mcp
 */
class Test_Manage_Post_Svg extends Elementor_Test_Base {

	private Manage_Post_Ability $ability;

	private array $created_posts = [];

	private array $created_attachments = [];

	public function setUp(): void {
		parent::setUp();
		$this->ability = new Manage_Post_Ability();
		$this->act_as_admin();
	}

	public function tearDown(): void {
		foreach ( $this->created_posts as $id ) {
			wp_delete_post( $id, true );
		}
		foreach ( $this->created_attachments as $id ) {
			wp_delete_attachment( $id, true );
		}
		$this->created_posts = [];
		$this->created_attachments = [];
		parent::tearDown();
	}

	private function find_svg_node( array $tree ): ?array {
		foreach ( $tree as $node ) {
			if ( ( $node['widgetType'] ?? '' ) === 'e-svg' ) {
				return $node;
			}
			if ( ! empty( $node['elements'] ) && is_array( $node['elements'] ) ) {
				$found = $this->find_svg_node( $node['elements'] );
				if ( null !== $found ) {
					return $found;
				}
			}
		}
		return null;
	}

	public function test_create_inline_svg_then_update_element_link__full_flow() {
		$create = $this->ability->execute( [
			'operation' => 'create',
			'title' => 'SVG flow',
			'elements' => [
				[
					'widget' => 'div',
					'children' => [
						[
							'widget' => 'svg',
							'svg_markup' => '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"><rect width="12" height="12"/></svg>',
						],
					],
				],
			],
		] );

		$this->assertIsArray( $create );
		$this->assertTrue( $create['success'] );
		$post_id = $create['post_id'];
		$this->created_posts[] = $post_id;

		$tree = Plugin::$instance->documents->get( $post_id )->get_elements_data();
		$svg_node = $this->find_svg_node( $tree );
		$this->assertNotNull( $svg_node, 'e-svg node should be saved in the tree' );

		$attachment_id = $svg_node['settings']['svg']['value']['id']['value'];
		$this->created_attachments[] = $attachment_id;
		$this->assertIsInt( $attachment_id );
		$this->assertSame( 'image/svg+xml', get_post_mime_type( $attachment_id ) );

		$update = $this->ability->execute( [
			'operation' => 'update_element',
			'post_id' => $post_id,
			'element_id' => $svg_node['id'],
			'patch' => [
				'link_url' => 'https://example.com',
				'link_target_blank' => true,
			],
		] );

		$this->assertTrue( $update['success'] );
		$this->assertContains( 'link', $update['changed_settings_keys'] );

		$link = $update['patched_element']['settings']['link'];
		$this->assertSame( 'https://example.com', $link['value']['destination']['value'] );
	}

	public function test_update_element__svg_legacy_url_key_is_warned_and_ignored() {
		$create = $this->ability->execute( [
			'operation' => 'create',
			'title' => 'SVG legacy link',
			'elements' => [
				[
					'widget' => 'div',
					'children' => [ [ 'widget' => 'svg' ] ],
				],
			],
		] );
		$post_id = $create['post_id'];
		$this->created_posts[] = $post_id;

		$tree = Plugin::$instance->documents->get( $post_id )->get_elements_data();
		$svg_node = $this->find_svg_node( $tree );

		$result = $this->ability->execute( [
			'operation' => 'update_element',
			'post_id' => $post_id,
			'element_id' => $svg_node['id'],
			'patch' => [ 'url' => 'https://example.com' ],
		] );

		$this->assertTrue( $result['success'] );
		$this->assertArrayHasKey( 'warnings', $result );
		$reasons = array_column( $result['warnings'], 'reason' );
		$this->assertContains( 'legacy_link_keys_ignored', $reasons );
	}
}
