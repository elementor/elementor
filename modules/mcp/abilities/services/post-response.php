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
			$response['unconverted_css'] = $unconverted;
			$response['custom_css_active'] = self::is_custom_css_supported();
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

	private static function edit_url_for( int $post_id ): string {
		$document = Plugin::$instance->documents->get( $post_id );

		if ( $document ) {
			return $document->get_edit_url();
		}

		return (string) admin_url( 'post.php?post=' . $post_id . '&action=edit' );
	}
}
