<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\History\Revisions_Manager;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Revision_Snapshots;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Revisions_Ability extends Abstract_Ability {

	const DEFAULT_LIMIT = 10;

	const SOURCE_MCP = 'mcp';
	const SOURCE_EDITOR = 'editor';

	protected function get_ability_id(): string {
		return 'elementor/list-revisions';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Elementor Revisions', 'elementor' ),
			__( 'Lists the revisions of an Elementor document (page, post, template, component), newest first. source "mcp" marks revisions created while an MCP tool was running, and ability names that tool; source "editor" marks everything else, such as saves from the Elementor editor. Every MCP write already returns an undo_revision_id for undoing that change, so use this tool when the user wants to go further back or pick a specific earlier version. Pass a revision_id to elementor/manage-revisions with action=restore to restore it.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'post_id' => [ 'type' => 'integer' ],
					'revisions' => [
						'type' => 'array',
						'items' => [
							'type' => 'object',
							'properties' => [
								'revision_id' => [ 'type' => 'integer' ],
								'created_at' => [ 'type' => 'string' ],
								'author' => [ 'type' => 'string' ],
								'source' => [
									'type' => 'string',
									'enum' => [ self::SOURCE_MCP, self::SOURCE_EDITOR ],
								],
								'ability' => [ 'type' => [ 'string', 'null' ] ],
							],
						],
					],
					'llm_instructions' => [ 'type' => 'string' ],
				],
			],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
			],
			fn() => current_user_can( 'edit_posts' ),
			[
				'type' => 'object',
				'required' => [ 'post_id' ],
				'properties' => [
					'post_id' => [
						'type' => 'integer',
						'description' => 'WordPress post ID of the Elementor document.',
					],
					'limit' => [
						'type' => 'integer',
						'minimum' => 1,
						'maximum' => Revisions_Manager::MAX_REVISIONS_TO_DISPLAY,
						'default' => self::DEFAULT_LIMIT,
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];
		$post_id = isset( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;

		if ( ! $post_id ) {
			return new \WP_Error( 'invalid_input', __( 'post_id is required.', 'elementor' ), [ 'status' => \WP_Http::BAD_REQUEST ] );
		}

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return new \WP_Error( 'document_not_found', __( 'Document not found.', 'elementor' ), [ 'status' => \WP_Http::NOT_FOUND ] );
		}

		$main_id = (int) $document->get_main_id();

		if ( ! current_user_can( 'edit_post', $main_id ) ) {
			return new \WP_Error( 'rest_cannot_edit', __( 'Sorry, you are not allowed to view the revisions of this document.', 'elementor' ), [ 'status' => \WP_Http::FORBIDDEN ] );
		}

		if ( ! wp_revisions_enabled( get_post( $main_id ) ) ) {
			return [
				'post_id' => $main_id,
				'revisions' => [],
				'llm_instructions' => __( 'Revisions are disabled for this post, so there is nothing to restore.', 'elementor' ),
			];
		}

		$revisions = array_map(
			fn( int $revision_id ) => $this->format_revision( $revision_id ),
			$this->find_revision_ids( $main_id, $this->resolve_limit( $input ) )
		);

		$response = [
			'post_id' => $main_id,
			'revisions' => $revisions,
		];

		if ( empty( $revisions ) ) {
			$response['llm_instructions'] = __( 'This document has no revisions yet.', 'elementor' );
		}

		return $response;
	}

	/**
	 * @return int[]
	 */
	private function find_revision_ids( int $main_id, int $limit ): array {
		$revision_ids = wp_get_post_revisions( $main_id, [
			'posts_per_page' => Revisions_Manager::MAX_REVISIONS_TO_DISPLAY,
			'orderby' => 'ID',
			'order' => 'DESC',
			'fields' => 'ids',
		] );

		$regular_revision_ids = array_filter(
			array_map( 'intval', $revision_ids ),
			fn( int $revision_id ) => ! wp_is_post_autosave( $revision_id )
		);

		return array_slice( array_values( $regular_revision_ids ), 0, $limit );
	}

	private function format_revision( int $revision_id ): array {
		$revision = get_post( $revision_id );
		$ability = Document_Revision_Snapshots::get_ability( $revision_id );

		return [
			'revision_id' => $revision_id,
			'created_at' => mysql_to_rfc3339( $revision->post_modified_gmt ),
			'author' => (string) get_the_author_meta( 'display_name', $revision->post_author ),
			'source' => $ability ? self::SOURCE_MCP : self::SOURCE_EDITOR,
			'ability' => $ability,
		];
	}

	private function resolve_limit( array $input ): int {
		$limit = isset( $input['limit'] ) ? (int) $input['limit'] : self::DEFAULT_LIMIT;

		return max( 1, min( Revisions_Manager::MAX_REVISIONS_TO_DISPLAY, $limit ) );
	}
}
