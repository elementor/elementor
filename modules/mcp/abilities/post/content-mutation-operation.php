<?php

namespace Elementor\Modules\Mcp\Abilities\Post;

use Elementor\Modules\Mcp\Abilities\Services\Element_Css_Transformer;
use Elementor\Modules\Mcp\Abilities\Services\Element_Root_Normalizer;
use Elementor\Modules\Mcp\Abilities\Services\Element_Spec_Resolver;
use Elementor\Modules\Mcp\Abilities\Services\Post_Context;
use Elementor\Modules\Mcp\Abilities\Services\Post_Response;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Content_Mutation_Operation extends Post_Operation {

	private const VALID_MODES = [ 'replace', 'append' ];

	private string $mode;

	public function __construct( string $mode ) {
		if ( ! in_array( $mode, self::VALID_MODES, true ) ) {
			throw new \InvalidArgumentException( 'Invalid content mutation mode: ' . esc_html( $mode ) );
		}

		$this->mode = $mode;
	}

	public function handle( array $input ) {
		$document = Post_Context::get_editable_document( $input );
		if ( is_wp_error( $document ) ) {
			return $document;
		}

		if ( ! isset( $input['elements'] ) || ! is_array( $input['elements'] ) ) {
			return new \WP_Error(
				'missing_field',
				sprintf(
					/* translators: %s: operation name. */
					__( 'elements is required for %s.', 'elementor' ),
					$this->operation_name()
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$transformer = Element_Css_Transformer::make();
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
		$incoming = $transformer->transform( $normalized['elements'] );

		$post_id = $document->get_main_id();

		if ( ! empty( $input['dry_run'] ) ) {
			return $this->dry_run_response( $post_id, $incoming, $transformer, $normalizations, $preview_elements, $warnings );
		}

		$payload = $this->build_save_payload( $document, $incoming );

		$save_error = $this->save_elements( $document, $payload );
		if ( $save_error ) {
			return $save_error;
		}

		$extras = 'append' === $this->mode ? [ 'added' => count( $incoming ) ] : [];

		$response = Post_Response::with_unconverted_css(
			Post_Response::envelope( $this->operation_name(), $post_id, $extras ),
			$transformer->get_unconverted_css()
		);

		$response = Post_Response::with_normalized( $response, $normalizations );

		return Post_Response::with_warnings( $response, $warnings );
	}

	private function operation_name(): string {
		return 'replace' === $this->mode ? 'replace_content' : 'append_content';
	}

	private function dry_run_response( int $post_id, array $incoming, Element_Css_Transformer $transformer, array $normalizations, array $preview_elements, array $warnings ): array {
		$response = [
			'success' => true,
			'operation' => $this->operation_name(),
			'post_id' => $post_id,
			'dry_run' => true,
		];

		if ( 'append' === $this->mode ) {
			$response['added'] = count( $incoming );
		}

		$response = Post_Response::with_unconverted_css( $response, $transformer->get_unconverted_css() );

		$response = Post_Response::with_normalized( $response, $normalizations );

		$response = Post_Response::with_warnings( $response, $warnings );

		return Post_Response::with_preview( $response, $preview_elements );
	}

	private function build_save_payload( $document, array $incoming ): array {
		if ( 'replace' === $this->mode ) {
			return $incoming;
		}

		$existing = $document->get_elements_data();
		$existing = is_array( $existing ) ? $existing : [];

		return array_merge( $existing, $incoming );
	}

	private function save_elements( $document, array $elements ): ?\WP_Error {
		$saved = $document->save( [ 'elements' => $elements ] );

		if ( ! $saved ) {
			return new \WP_Error(
				'save_failed',
				__( 'Could not save document elements.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		return null;
	}
}
