<?php

namespace Elementor\Modules\Mcp\Abilities\Services;

use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Post_Response {

	public static function envelope( string $operation, int $post_id, array $extras = [] ): array {
		$envelope = [
			'success' => true,
			'operation' => $operation,
			'post_id' => $post_id,
		];

		if ( $post_id > 0 ) {
			$envelope['post_type'] = (string) get_post_type( $post_id );
			$envelope['edit_url'] = self::edit_url_for( $post_id );
			$envelope['permalink'] = (string) get_permalink( $post_id );
		}

		return array_merge( $envelope, $extras );
	}

	public static function with_unconverted_css( array $response, array $unconverted ): array {
		if ( ! empty( $unconverted ) ) {
			if ( self::is_custom_css_supported() ) {
				$response['css_via_custom_css'] = $unconverted;
			} else {
				$response['css_not_rendered'] = $unconverted;
				$response['warning'] = __( 'Some CSS declarations could not be converted to typed style props and Elementor Pro atomic-custom-css is not active. These declarations are stored but will NOT render on the published page. See css_not_rendered for the list.', 'elementor' );
			}
		}

		return $response;
	}

	private static function is_custom_css_supported(): bool {
		if ( ! Utils::has_pro() ) {
			return false;
		}

		if ( ! class_exists( '\ElementorPro\License\API' ) ) {
			return false;
		}

		return \ElementorPro\License\API::is_license_active() &&
			\ElementorPro\License\API::is_licence_has_feature( 'atomic-custom-css' );
	}

	public static function with_normalized( array $response, array $normalizations ): array {
		if ( ! empty( $normalizations ) ) {
			$response['normalized'] = $normalizations;
		}

		return $response;
	}

	public static function with_preview( array $response, array $elements ): array {
		$response['preview'] = Element_Tree_Preview::render( $elements );

		return $response;
	}

	public static function with_element_index( array $response, array $elements ): array {
		$index = Element_Tree::index( $elements );

		if ( ! empty( $index ) ) {
			$response['element_index'] = $index;
		}

		return $response;
	}

	public static function with_warnings( array $response, array $warnings ): array {
		if ( ! empty( $warnings ) ) {
			$response['warnings'] = $warnings;
		}

		return $response;
	}

	public static function with_patched_element( array $response, ?array $node ): array {
		if ( null !== $node ) {
			$response['patched_element'] = $node;
		}

		return $response;
	}

	public static function unresolved_error( array $unresolved ): ?\WP_Error {
		if ( empty( $unresolved ) ) {
			return null;
		}

		$details = [];
		foreach ( $unresolved as $entry ) {
			if ( ( $entry['reason'] ?? '' ) === 'unknown_widget' ) {
				$details[] = sprintf( 'unknown widget "%s"', (string) ( $entry['widget'] ?? '' ) );
			} else {
				$details[] = 'node missing required "widget" key';
			}
		}

		return new \WP_Error(
			'unresolved_elements',
			sprintf(
				/* translators: 1: list of unresolved element problems, 2: supported widget names. */
				__( 'Could not resolve %1$d element(s): %2$s. Use one of: container | div | flex | heading | paragraph | button | image | svg (or the e- prefixed equivalents: e-div-block | e-flexbox | e-heading | e-paragraph | e-button | e-image | e-svg).', 'elementor' ),
				count( $unresolved ),
				implode( '; ', $details )
			),
			[
				'status' => \WP_Http::BAD_REQUEST,
				'unresolved_elements' => $unresolved,
			]
		);
	}

	private static function edit_url_for( int $post_id ): string {
		$document = Plugin::$instance->documents->get( $post_id );

		if ( $document ) {
			return $document->get_edit_url();
		}

		return (string) admin_url( 'post.php?post=' . $post_id . '&action=edit' );
	}
}
