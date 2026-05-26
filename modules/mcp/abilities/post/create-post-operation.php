<?php

namespace Elementor\Modules\Mcp\Abilities\Post;

use Elementor\Modules\Mcp\Abilities\Services\Element_Css_Transformer;
use Elementor\Modules\Mcp\Abilities\Services\Element_Spec_Resolver;
use Elementor\Modules\Mcp\Abilities\Services\Post_Permissions;
use Elementor\Modules\Mcp\Abilities\Services\Post_Response;
use Elementor\Modules\Mcp\Abilities\Services\Post_Template_Resolver;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Create_Post_Operation extends Post_Operation {

	private const DEFAULT_POST_TYPE = 'page';
	private const DEFAULT_POST_STATUS = 'draft';

	public function handle( array $input ) {
		$title = isset( $input['title'] ) && is_string( $input['title'] ) ? $input['title'] : '';

		if ( '' === trim( $title ) ) {
			return new \WP_Error(
				'missing_field',
				__( 'title is required for create.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$post_type = ! empty( $input['post_type'] ) ? sanitize_key( $input['post_type'] ) : self::DEFAULT_POST_TYPE;

		$type_error = Post_Permissions::validate_post_type( $post_type );
		if ( $type_error ) {
			return $type_error;
		}

		$post_status = isset( $input['post_status'] ) && is_string( $input['post_status'] ) && '' !== $input['post_status']
			? sanitize_key( $input['post_status'] )
			: self::DEFAULT_POST_STATUS;

		$permission_error = Post_Permissions::check_create( $post_type, $post_status );
		if ( $permission_error ) {
			return $permission_error;
		}

		$transformer = null;
		$elements = null;
		if ( isset( $input['elements'] ) && is_array( $input['elements'] ) ) {
			$resolved = Element_Spec_Resolver::make()->resolve( $input['elements'] );
			$transformer = Element_Css_Transformer::make();
			$elements = $transformer->transform( $resolved );
		}

		$dry_run = ! empty( $input['dry_run'] ) && null !== $elements;

		if ( $dry_run ) {
			$response = [
				'success' => true,
				'operation' => 'create',
				'post_id' => 0,
				'post_type' => $post_type,
				'post_status' => $post_status,
				'dry_run' => true,
			];

			return Post_Response::with_css_gaps( $response, $transformer ? $transformer->get_css_gaps() : [] );
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

		$template = Post_Template_Resolver::resolve( $input, true );

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

		$envelope = Post_Response::envelope( 'create', (int) $post_id, [
			'post_status' => (string) get_post_status( $post_id ),
		] );

		return Post_Response::with_css_gaps( $envelope, $transformer ? $transformer->get_css_gaps() : [] );
	}
}
