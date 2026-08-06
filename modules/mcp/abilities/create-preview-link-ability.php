<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Preview\Preview_Token;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Create_Preview_Link_Ability extends Abstract_Ability {

	const TTL_MINUTES = 5;

	protected function get_ability_id(): string {
		return 'elementor/create-preview-link';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Create Elementor Public Preview Link', 'elementor' ),
			Prompt_Loader::load( 'create-preview-link' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'url' => [
						'type' => 'string',
						'format' => 'uri',
						'description' => 'Anonymous, time-limited preview URL. For the agent to self-validate rendering. DO NOT share with the user.',
					],
					'edit_url' => [
						'type' => 'string',
						'format' => 'uri',
						'description' => 'Elementor editor URL for the post. Share THIS with the user when they need a link (they must be logged into WordPress as an editor).',
					],
					'post_id' => [ 'type' => 'integer' ],
					'revision_id' => [ 'type' => 'integer' ],
					'expires_at' => [
						'type' => 'string',
						'format' => 'date-time',
					],
					'expires_at_unix' => [ 'type' => 'integer' ],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => false,
				],
			],
			function ( $input = [] ) {
				$post_id = is_array( $input ) && isset( $input['post_id'] ) ? (int) $input['post_id'] : 0;

				return $post_id > 0 && current_user_can( 'edit_post', $post_id );
			},
			[
				'type' => 'object',
				'required' => [ 'post_id' ],
				'properties' => [
					'post_id' => [
						'type' => 'integer',
						'description' => 'Post ID to snapshot and share.',
					],
				],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		$post_id = isset( $input['post_id'] ) ? (int) $input['post_id'] : 0;

		$post_error = $this->validate_post( $post_id );
		if ( $post_error ) {
			return $post_error;
		}

		$permission_error = $this->check_edit_permission( $post_id );
		if ( $permission_error ) {
			return $permission_error;
		}

		$revision_id = $this->snapshot_revision( $post_id );
		if ( is_wp_error( $revision_id ) ) {
			return $revision_id;
		}

		$expires_at = time() + self::TTL_MINUTES * MINUTE_IN_SECONDS;
		$token = Preview_Token::encode( $post_id, $revision_id, $expires_at, Preview_Token::secret() );
		$document = Plugin::$instance->documents->get( $post_id );

		return [
			'url' => add_query_arg( Preview_Token::QUERY_ARG, $token, home_url( '/' ) ),
			'edit_url' => $document ? $document->get_edit_url() : '',
			'post_id' => $post_id,
			'revision_id' => $revision_id,
			'expires_at' => gmdate( 'c', $expires_at ),
			'expires_at_unix' => $expires_at,
		];
	}

	private function validate_post( int $post_id ): ?\WP_Error {
		if ( $post_id <= 0 || ! get_post( $post_id ) ) {
			return new \WP_Error(
				'invalid_post',
				__( 'Post not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document || ! $document->is_built_with_elementor() ) {
			return new \WP_Error(
				'not_elementor_post',
				__( 'This post is not built with Elementor.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return null;
	}

	private function check_edit_permission( int $post_id ): ?\WP_Error {
		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return new \WP_Error(
				'rest_cannot_edit',
				__( 'Sorry, you are not allowed to share a preview of this post.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		return null;
	}

	private function snapshot_revision( int $post_id ) {
		$revision_id = wp_save_post_revision( $post_id );

		if ( is_wp_error( $revision_id ) ) {
			return $revision_id;
		}

		if ( ! $revision_id ) {
			$latest = wp_get_post_revisions( $post_id, [
				'posts_per_page' => 1,
				'orderby' => 'ID',
				'order' => 'DESC',
			] );

			$revision_id = $latest ? (int) array_key_first( $latest ) : 0;
		}

		if ( ! $revision_id ) {
			return new \WP_Error(
				'revision_failed',
				__( 'Could not create a revision snapshot for this post.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return (int) $revision_id;
	}
}
