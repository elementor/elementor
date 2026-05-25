<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Manage_Post_Ability extends Abstract_Ability {

	private const VALID_OPERATIONS = [
		'create',
		'update',
		'replace_content',
		'append_content',
		'trash',
		'restore',
		'delete',
	];

	private const DEFAULT_POST_TYPE = 'page';
	private const DEFAULT_POST_STATUS = 'draft';
	private const DEFAULT_NEW_POST_TEMPLATE = 'elementor_canvas';

	protected function get_ability_id(): string {
		return 'elementor/manage-post';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Manage Elementor Post', 'elementor' ),
			__( 'Create, update, trash, restore, delete, or write content for an Elementor v4 post in a single call. Operations: create | update | replace_content | append_content | trash | restore | delete. The `elements` field accepts the raw Elementor v4 element tree — build classes first via elementor/manage-global-classes and reference them by id in settings.classes. Breakpoints and pseudo-states are not part of this version.', 'elementor' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'success' => [ 'type' => 'boolean' ],
					'operation' => [ 'type' => 'string' ],
					'post_id' => [ 'type' => 'integer' ],
					'post_status' => [ 'type' => 'string' ],
					'edit_url' => [ 'type' => 'string' ],
					'permalink' => [ 'type' => 'string' ],
					'dry_run' => [ 'type' => 'boolean' ],
					'added' => [ 'type' => 'integer' ],
					'deleted' => [ 'type' => 'boolean' ],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => true,
				],
				'show_in_rest' => true,
			],
			function () {
				return current_user_can( 'edit_posts' );
			},
			[
				'type' => 'object',
				'properties' => [
					'operation' => [
						'type' => 'string',
						'enum' => self::VALID_OPERATIONS,
						'description' => 'Which lifecycle action to take.',
					],
					'post_id' => [
						'type' => 'integer',
						'description' => 'Target post. Required for every operation except create.',
					],
					'title' => [
						'type' => 'string',
						'description' => 'Post title. Required for create.',
					],
					'post_type' => [
						'type' => 'string',
						'description' => 'Post type slug. Only honored on create. Default: page. Must support Elementor.',
					],
					'post_status' => [
						'type' => 'string',
						'description' => 'draft | publish | private (or any registered status). Default on create: draft. Transitioning to publish requires publish_post capability.',
					],
					'slug' => [
						'type' => 'string',
						'description' => 'Post name; WordPress sanitizes and de-duplicates.',
					],
					'post_template' => [
						'type' => 'string',
						'description' => 'Page template slug. New-post default: elementor_canvas. Pass an empty string to use the theme default. On update, only changed when explicitly provided.',
					],
					'elements' => [
						'type' => 'array',
						'description' => 'Raw Elementor v4 element tree. Required for replace_content and append_content; optional on create.',
					],
					'dry_run' => [
						'type' => 'boolean',
						'description' => 'When true, do not write. Only honored when elements is supplied.',
					],
				],
				'required' => [ 'operation' ],
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		$operation = isset( $input['operation'] ) ? (string) $input['operation'] : '';

		if ( ! in_array( $operation, self::VALID_OPERATIONS, true ) ) {
			return new \WP_Error(
				'invalid_operation',
				sprintf(
					/* translators: %s: comma-separated list of allowed operations. */
					__( 'Operation must be one of: %s.', 'elementor' ),
					implode( ', ', self::VALID_OPERATIONS )
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		switch ( $operation ) {
			case 'create':
				return $this->op_create( $input );
			case 'update':
				return $this->op_update( $input );
			case 'replace_content':
				return $this->op_replace_content( $input );
			case 'append_content':
				return $this->op_append_content( $input );
			case 'trash':
				return $this->op_trash( $input );
			case 'restore':
				return $this->op_restore( $input );
			case 'delete':
				return $this->op_delete( $input );
		}

		return new \WP_Error(
			'invalid_operation',
			__( 'Unknown operation.', 'elementor' ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	private function op_create( array $input ) {
		$title = isset( $input['title'] ) && is_string( $input['title'] ) ? $input['title'] : '';

		if ( '' === trim( $title ) ) {
			return new \WP_Error(
				'missing_field',
				__( 'title is required for create.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$post_type = ! empty( $input['post_type'] ) ? sanitize_key( $input['post_type'] ) : self::DEFAULT_POST_TYPE;

		$type_error = $this->validate_post_type( $post_type );
		if ( $type_error ) {
			return $type_error;
		}

		$post_status = isset( $input['post_status'] ) && is_string( $input['post_status'] ) && '' !== $input['post_status']
			? sanitize_key( $input['post_status'] )
			: self::DEFAULT_POST_STATUS;

		$permission_error = $this->check_create_permission( $post_type, $post_status );
		if ( $permission_error ) {
			return $permission_error;
		}

		$elements = isset( $input['elements'] ) && is_array( $input['elements'] ) ? $input['elements'] : null;
		$dry_run = ! empty( $input['dry_run'] ) && null !== $elements;

		if ( $dry_run ) {
			return [
				'success' => true,
				'operation' => 'create',
				'post_id' => 0,
				'post_status' => $post_status,
				'dry_run' => true,
			];
		}

		$insert_args = [
			'post_title' => $title,
			'post_status' => $post_status,
			'post_type' => $post_type,
			'post_author' => get_current_user_id(),
		];

		if ( isset( $input['slug'] ) && is_string( $input['slug'] ) && '' !== $input['slug'] ) {
			$insert_args['post_name'] = sanitize_title( $input['slug'] );
		}

		$post_id = wp_insert_post( $insert_args, true );

		if ( is_wp_error( $post_id ) ) {
			return new \WP_Error(
				'wp_insert_post_failed',
				$post_id->get_error_message(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return new \WP_Error(
				'document_not_found',
				__( 'Document could not be loaded after creation.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		$document->set_is_built_with_elementor( true );

		$template = $this->resolve_post_template( $input, true );

		if ( null !== $template ) {
			update_post_meta( $post_id, '_wp_page_template', sanitize_text_field( $template ) );
		}

		if ( null !== $elements ) {
			$saved = $document->save( [ 'elements' => $elements ] );

			if ( ! $saved ) {
				return new \WP_Error(
					'save_failed',
					__( 'Post was created but elements could not be saved.', 'elementor' ),
					[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
				);
			}
		}

		return $this->build_envelope( 'create', (int) $post_id, [
			'post_status' => (string) get_post_status( $post_id ),
		] );
	}

	private function op_update( array $input ) {
		$post_id = $this->resolve_post_id( $input );
		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return new \WP_Error(
				'rest_cannot_edit',
				__( 'Sorry, you are not allowed to edit this post.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$update_args = [ 'ID' => $post_id ];

		if ( isset( $input['title'] ) && is_string( $input['title'] ) ) {
			$update_args['post_title'] = $input['title'];
		}

		if ( isset( $input['slug'] ) && is_string( $input['slug'] ) ) {
			$update_args['post_name'] = sanitize_title( $input['slug'] );
		}

		if ( isset( $input['post_status'] ) && is_string( $input['post_status'] ) && '' !== $input['post_status'] ) {
			$next_status = sanitize_key( $input['post_status'] );

			$publish_check = $this->check_publish_transition( $post_id, $next_status );
			if ( $publish_check ) {
				return $publish_check;
			}

			$update_args['post_status'] = $next_status;
		}

		if ( count( $update_args ) > 1 ) {
			$result = wp_update_post( $update_args, true );

			if ( is_wp_error( $result ) ) {
				return new \WP_Error(
					'wp_update_post_failed',
					$result->get_error_message(),
					[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
				);
			}
		}

		$template = $this->resolve_post_template( $input, false );

		if ( null !== $template ) {
			update_post_meta( $post_id, '_wp_page_template', sanitize_text_field( $template ) );
		}

		return $this->build_envelope( 'update', $post_id, [
			'post_status' => (string) get_post_status( $post_id ),
		] );
	}

	private function op_replace_content( array $input ) {
		$document = $this->get_editable_document( $input );
		if ( is_wp_error( $document ) ) {
			return $document;
		}

		$elements = isset( $input['elements'] ) && is_array( $input['elements'] ) ? $input['elements'] : null;

		if ( null === $elements ) {
			return new \WP_Error(
				'missing_field',
				__( 'elements is required for replace_content.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$post_id = $document->get_main_id();

		if ( ! empty( $input['dry_run'] ) ) {
			return [
				'success' => true,
				'operation' => 'replace_content',
				'post_id' => $post_id,
				'dry_run' => true,
			];
		}

		$saved = $document->save( [ 'elements' => $elements ] );

		if ( ! $saved ) {
			return new \WP_Error(
				'save_failed',
				__( 'Could not save document elements.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return $this->build_envelope( 'replace_content', $post_id );
	}

	private function op_append_content( array $input ) {
		$document = $this->get_editable_document( $input );
		if ( is_wp_error( $document ) ) {
			return $document;
		}

		$incoming = isset( $input['elements'] ) && is_array( $input['elements'] ) ? $input['elements'] : null;

		if ( null === $incoming ) {
			return new \WP_Error(
				'missing_field',
				__( 'elements is required for append_content.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$post_id = $document->get_main_id();

		if ( ! empty( $input['dry_run'] ) ) {
			return [
				'success' => true,
				'operation' => 'append_content',
				'post_id' => $post_id,
				'added' => count( $incoming ),
				'dry_run' => true,
			];
		}

		$existing = $document->get_elements_data();
		$existing = is_array( $existing ) ? $existing : [];

		$merged = array_merge( $existing, $incoming );

		$saved = $document->save( [ 'elements' => $merged ] );

		if ( ! $saved ) {
			return new \WP_Error(
				'save_failed',
				__( 'Could not save appended elements.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return $this->build_envelope( 'append_content', $post_id, [
			'added' => count( $incoming ),
		] );
	}

	private function op_trash( array $input ) {
		$post_id = $this->resolve_post_id( $input );
		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		if ( ! current_user_can( 'delete_post', $post_id ) ) {
			return new \WP_Error(
				'rest_cannot_delete',
				__( 'Sorry, you are not allowed to trash this post.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$result = wp_trash_post( $post_id );

		if ( ! $result ) {
			return new \WP_Error(
				'trash_failed',
				__( 'Could not trash post.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return $this->build_envelope( 'trash', $post_id, [
			'post_status' => (string) get_post_status( $post_id ),
		] );
	}

	private function op_restore( array $input ) {
		$post_id = $this->resolve_post_id( $input );
		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return new \WP_Error(
				'rest_cannot_edit',
				__( 'Sorry, you are not allowed to restore this post.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$result = wp_untrash_post( $post_id );

		if ( ! $result ) {
			return new \WP_Error(
				'restore_failed',
				__( 'Could not restore post.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return $this->build_envelope( 'restore', $post_id, [
			'post_status' => (string) get_post_status( $post_id ),
		] );
	}

	private function op_delete( array $input ) {
		$post_id = $this->resolve_post_id( $input );
		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		if ( ! current_user_can( 'delete_post', $post_id ) ) {
			return new \WP_Error(
				'rest_cannot_delete',
				__( 'Sorry, you are not allowed to delete this post.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$result = wp_delete_post( $post_id, true );

		if ( ! $result ) {
			return new \WP_Error(
				'delete_failed',
				__( 'Could not delete post.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return [
			'success' => true,
			'operation' => 'delete',
			'post_id' => $post_id,
			'deleted' => true,
		];
	}

	private function resolve_post_id( array $input ) {
		$post_id = isset( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;

		if ( ! $post_id ) {
			return new \WP_Error(
				'invalid_post_id',
				__( 'A valid post_id is required.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! get_post( $post_id ) ) {
			return new \WP_Error(
				'invalid_post_id',
				__( 'Post not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		return $post_id;
	}

	private function get_editable_document( array $input ) {
		$post_id = $this->resolve_post_id( $input );
		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return new \WP_Error(
				'document_not_found',
				__( 'Document not found.', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		if ( ! $document->is_built_with_elementor() ) {
			return new \WP_Error(
				'not_elementor',
				__( 'This post is not built with Elementor.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! $document->is_editable_by_current_user() ) {
			return new \WP_Error(
				'rest_cannot_edit',
				__( 'Sorry, you are not allowed to edit this document.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		return $document;
	}

	private function validate_post_type( string $post_type ): ?\WP_Error {
		if ( ! post_type_exists( $post_type ) || ! post_type_supports( $post_type, 'elementor' ) ) {
			return new \WP_Error(
				'invalid_post_type',
				__( 'This post type does not support Elementor.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return null;
	}

	private function check_create_permission( string $post_type, string $post_status ): ?\WP_Error {
		$post_type_object = get_post_type_object( $post_type );

		if ( ! $post_type_object ) {
			return new \WP_Error(
				'invalid_post_type',
				__( 'Unknown post type.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( ! current_user_can( $post_type_object->cap->create_posts ) ) {
			return new \WP_Error(
				'rest_cannot_create',
				__( 'Sorry, you are not allowed to create posts of this type.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		if ( 'publish' === $post_status && ! current_user_can( $post_type_object->cap->publish_posts ) ) {
			return new \WP_Error(
				'rest_cannot_publish',
				__( 'Sorry, you are not allowed to publish posts of this type.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		return null;
	}

	private function check_publish_transition( int $post_id, string $next_status ): ?\WP_Error {
		if ( 'publish' !== $next_status ) {
			return null;
		}

		if ( current_user_can( 'publish_post', $post_id ) ) {
			return null;
		}

		return new \WP_Error(
			'rest_cannot_publish',
			__( 'Sorry, you are not allowed to publish this post.', 'elementor' ),
			[ 'status' => \WP_Http::FORBIDDEN ]
		);
	}

	private function resolve_post_template( array $input, bool $is_new_post ): ?string {
		if ( array_key_exists( 'post_template', $input ) ) {
			$value = $input['post_template'];

			return is_string( $value ) ? $value : '';
		}

		return $is_new_post ? self::DEFAULT_NEW_POST_TEMPLATE : null;
	}

	private function build_envelope( string $operation, int $post_id, array $extra = [] ): array {
		$envelope = [
			'success' => true,
			'operation' => $operation,
			'post_id' => $post_id,
			'edit_url' => $this->edit_url_for( $post_id ),
			'permalink' => (string) get_permalink( $post_id ),
		];

		return array_merge( $envelope, $extra );
	}

	private function edit_url_for( int $post_id ): string {
		$document = Plugin::$instance->documents->get( $post_id );

		if ( $document ) {
			return $document->get_edit_url();
		}

		return (string) admin_url( 'post.php?post=' . $post_id . '&action=edit' );
	}
}
