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

	public function is_exposed_via_proxy(): bool {
		return false;
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
					'fixtures' => [
						'type' => 'object',
						'description' => 'The fixtures the preview renders with, as normalized. Omitted when none were sent.',
					],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => false,
				],
				'mutates_page' => false,
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
					'fixtures' => [
						'type' => 'object',
						'description' => 'Optional WooCommerce state for this preview only (requires WooCommerce). Nothing is saved: the cart is filled in memory for the preview request.',
						'properties' => [
							'cart_products' => [
								'type' => 'array',
								'description' => 'Products to put in the cart, so cart, checkout and menu-cart widgets render their filled state instead of the empty one.',
								'items' => [
									'type' => 'object',
									'required' => [ 'product_id' ],
									'properties' => [
										'product_id' => [ 'type' => 'integer' ],
										'quantity' => [
											'type' => 'integer',
											'minimum' => 1,
											'default' => 1,
										],
									],
								],
							],
							'logged_in' => [
								'type' => 'boolean',
								'description' => 'Only false is supported: render as a logged-out visitor even when the browser holds a WordPress session. Previews cannot log in, so the logged-in My Account view cannot be previewed.',
							],
							'product_id' => [
								'type' => 'integer',
								'description' => 'Product to render a single product site part with, instead of its "Preview Dynamic Content as" product.',
							],
						],
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

		$fixtures = $this->normalize_fixtures( is_array( $input['fixtures'] ?? null ) ? $input['fixtures'] : [] );
		if ( is_wp_error( $fixtures ) ) {
			return $fixtures;
		}

		$revision_id = $this->snapshot_revision( $post_id );
		if ( is_wp_error( $revision_id ) ) {
			return $revision_id;
		}

		$expires_at = time() + self::TTL_MINUTES * MINUTE_IN_SECONDS;
		$token = Preview_Token::encode( $post_id, $revision_id, $expires_at, Preview_Token::secret(), $fixtures );
		$document = Plugin::$instance->documents->get( $post_id );

		$result = [
			'url' => add_query_arg( Preview_Token::QUERY_ARG, $token, home_url( '/' ) ),
			'edit_url' => $document ? $document->get_edit_url() : '',
			'post_id' => $post_id,
			'revision_id' => $revision_id,
			'expires_at' => gmdate( 'c', $expires_at ),
			'expires_at_unix' => $expires_at,
		];

		if ( ! empty( $fixtures ) ) {
			$result['fixtures'] = $fixtures;
		}

		return $result;
	}

	/**
	 * @return array|\WP_Error
	 */
	private function normalize_fixtures( array $input ) {
		if ( true === ( $input['logged_in'] ?? null ) ) {
			return new \WP_Error(
				'invalid_fixtures',
				__( 'fixtures.logged_in only supports false: previews are anonymous and cannot log in.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$fixtures = [];

		if ( ! empty( $input['cart_products'] ) && is_array( $input['cart_products'] ) ) {
			$fixtures['cart_products'] = array_map(
				fn( $item ) => [
					'product_id' => (int) ( $item['product_id'] ?? 0 ),
					'quantity' => max( 1, (int) ( $item['quantity'] ?? 1 ) ),
				],
				array_values( array_filter( $input['cart_products'], 'is_array' ) )
			);
		}

		if ( false === ( $input['logged_in'] ?? null ) ) {
			$fixtures['logged_in'] = false;
		}

		if ( ! empty( $input['product_id'] ) ) {
			$fixtures['product_id'] = (int) $input['product_id'];
		}

		return $fixtures;
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
