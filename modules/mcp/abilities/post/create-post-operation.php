<?php

namespace Elementor\Modules\Mcp\Abilities\Post;

use Elementor\Modules\Mcp\Abilities\Services\Element_Css_Transformer;
use Elementor\Modules\Mcp\Abilities\Services\Element_Root_Normalizer;
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
		$title = $this->resolve_title( $input );
		if ( is_wp_error( $title ) ) {
			return $title;
		}

		$post_type = $this->resolve_post_type( $input );
		$post_status = $this->resolve_post_status( $input );

		$auth_error = $this->authorize( $post_type, $post_status );
		if ( $auth_error ) {
			return $auth_error;
		}

		$transformer = $this->prepare_transformer( $input );
		$normalizations = [];
		$elements = null;
		$preview_elements = [];
		$warnings = [];

		if ( $transformer ) {
			$resolver = Element_Spec_Resolver::make( ! empty( $input['dry_run'] ) );
			$resolved = $resolver->resolve( $input['elements'] );
			$unresolved_error = Post_Response::unresolved_error( $resolver->get_unresolved() );
			if ( $unresolved_error ) {
				return $unresolved_error;
			}
			$warnings = $resolver->get_warnings();
			$normalized = Element_Root_Normalizer::make()->normalize( $resolved );
			$normalizations = $normalized['normalizations'];
			$preview_elements = $normalized['elements'];
			$elements = $transformer->transform( $normalized['elements'] );
		}

		if ( ! empty( $input['dry_run'] ) && null !== $elements ) {
			return $this->dry_run_response( $post_type, $post_status, $transformer, $normalizations, $preview_elements, $warnings );
		}

		$post_id = $this->insert_post( $title, $post_type, $post_status, $input['slug'] ?? null );
		if ( is_wp_error( $post_id ) ) {
			return $post_id;
		}

		$document = $this->load_document( $post_id );
		if ( is_wp_error( $document ) ) {
			return $document;
		}

		$document->set_is_built_with_elementor( true );

		$template = Post_Template_Resolver::resolve( $input, true );
		if ( null !== $template ) {
			update_post_meta( $post_id, '_wp_page_template', sanitize_text_field( $template ) );
		}

		if ( null !== $elements ) {
			$save_error = $this->save_elements( $document, $elements );
			if ( $save_error ) {
				return $save_error;
			}
		}

		$envelope = Post_Response::envelope( 'create', $post_id, [
			'post_status' => (string) get_post_status( $post_id ),
		] );

		$envelope = Post_Response::with_unconverted_css( $envelope, $transformer ? $transformer->get_unconverted_css() : [] );

		$envelope = Post_Response::with_normalized( $envelope, $normalizations );

		if ( null !== $elements ) {
			$envelope = Post_Response::with_element_index( $envelope, $elements );
		}

		return Post_Response::with_warnings( $envelope, $warnings );
	}

	private function resolve_title( array $input ) {
		$title = isset( $input['title'] ) && is_string( $input['title'] ) ? trim( $input['title'] ) : '';

		if ( '' === $title ) {
			return new \WP_Error(
				'missing_field',
				__( 'title is required for create.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return $title;
	}

	private function resolve_post_type( array $input ): string {
		return ! empty( $input['post_type'] ) ? sanitize_key( $input['post_type'] ) : self::DEFAULT_POST_TYPE;
	}

	private function resolve_post_status( array $input ): string {
		return isset( $input['post_status'] ) && is_string( $input['post_status'] ) && '' !== $input['post_status']
			? sanitize_key( $input['post_status'] )
			: self::DEFAULT_POST_STATUS;
	}

	private function authorize( string $post_type, string $post_status ): ?\WP_Error {
		$type_error = Post_Permissions::validate_post_type( $post_type );
		if ( $type_error ) {
			return $type_error;
		}

		return Post_Permissions::check_create( $post_type, $post_status );
	}

	private function prepare_transformer( array $input ): ?Element_Css_Transformer {
		if ( ! isset( $input['elements'] ) || ! is_array( $input['elements'] ) ) {
			return null;
		}

		return Element_Css_Transformer::make();
	}

	private function dry_run_response( string $post_type, string $post_status, ?Element_Css_Transformer $transformer, array $normalizations, array $preview_elements, array $warnings ): array {
		$response = Post_Response::with_unconverted_css( [
			'success' => true,
			'operation' => 'create',
			'post_id' => 0,
			'post_type' => $post_type,
			'post_status' => $post_status,
			'dry_run' => true,
		], $transformer ? $transformer->get_unconverted_css() : [] );

		$response = Post_Response::with_normalized( $response, $normalizations );

		$response = Post_Response::with_warnings( $response, $warnings );

		return Post_Response::with_preview( $response, $preview_elements );
	}

	private function insert_post( string $title, string $post_type, string $post_status, $slug ) {
		$args = [
			'post_title' => $title,
			'post_status' => $post_status,
			'post_type' => $post_type,
			'post_author' => get_current_user_id(),
		];

		if ( is_string( $slug ) && '' !== $slug ) {
			$args['post_name'] = sanitize_title( $slug );
		}

		$post_id = wp_insert_post( $args, true );

		if ( is_wp_error( $post_id ) ) {
			return new \WP_Error(
				'wp_insert_post_failed',
				$post_id->get_error_message(),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return (int) $post_id;
	}

	private function load_document( int $post_id ) {
		$document = Plugin::$instance->documents->get( $post_id );

		if ( ! $document ) {
			return new \WP_Error(
				'document_not_found',
				__( 'Document could not be loaded after creation.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return $document;
	}

	private function save_elements( $document, array $elements ): ?\WP_Error {
		$saved = $document->save( [ 'elements' => $elements ] );

		if ( ! $saved ) {
			return new \WP_Error(
				'save_failed',
				__( 'Post was created but elements could not be saved.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return null;
	}
}
