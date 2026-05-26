<?php

namespace Elementor\Modules\Mcp\Abilities\Post;

use Elementor\Modules\Mcp\Abilities\Services\Element_Css_Transformer;
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

		$operation = 'replace' === $this->mode ? 'replace_content' : 'append_content';

		if ( ! isset( $input['elements'] ) || ! is_array( $input['elements'] ) ) {
			return new \WP_Error(
				'missing_field',
				sprintf(
					/* translators: %s: operation name. */
					__( 'elements is required for %s.', 'elementor' ),
					$operation
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$resolved = Element_Spec_Resolver::make()->resolve( $input['elements'] );
		$transformer = Element_Css_Transformer::make();
		$incoming = $transformer->transform( $resolved );

		$post_id = $document->get_main_id();

		if ( ! empty( $input['dry_run'] ) ) {
			$response = [
				'success' => true,
				'operation' => $operation,
				'post_id' => $post_id,
				'dry_run' => true,
			];

			if ( 'append' === $this->mode ) {
				$response['added'] = count( $incoming );
			}

			return Post_Response::with_css_gaps( $response, $transformer->get_css_gaps() );
		}

		if ( 'append' === $this->mode ) {
			$existing = $document->get_elements_data();
			$existing = is_array( $existing ) ? $existing : [];
			$to_save = array_merge( $existing, $incoming );
		} else {
			$to_save = $incoming;
		}

		$saved = $document->save( [ 'elements' => $to_save ] );

		if ( ! $saved ) {
			return new \WP_Error(
				'save_failed',
				__( 'Could not save document elements.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		$extras = [];
		if ( 'append' === $this->mode ) {
			$extras['added'] = count( $incoming );
		}

		return Post_Response::with_css_gaps(
			Post_Response::envelope( $operation, $post_id, $extras ),
			$transformer->get_css_gaps()
		);
	}
}
