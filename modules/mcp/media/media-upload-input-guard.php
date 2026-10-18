<?php

namespace Elementor\Modules\Mcp\Media;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Media_Upload_Input_Guard {

	private const FORBIDDEN_KEYS = [
		'file',
		'file_data',
		'file_base64',
		'base64',
		'data',
		'content',
		'bytes',
		'image_data',
	];

	public static function reject_inline_binary_fields( array $input ): ?\WP_Error {
		foreach ( self::FORBIDDEN_KEYS as $key ) {
			if ( array_key_exists( $key, $input ) ) {
				return new \WP_Error(
					'inline_binary_rejected',
					__( 'Inline file or base64 content is not accepted. Use a source URL or a one-time upload token instead.', 'elementor' ),
					[ 'status' => \WP_Http::BAD_REQUEST ]
				);
			}
		}

		return null;
	}

	public static function require_upload_consent( array $input ): ?\WP_Error {
		if ( true !== ( $input['consent'] ?? null ) ) {
			return new \WP_Error(
				'consent_required',
				__( 'Explicit user consent is required before uploading media.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return null;
	}

	public static function require_upload_capability(): ?\WP_Error {
		if ( ! current_user_can( Media_Upload_Config::REQUIRED_CAPABILITY ) ) {
			return new \WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to upload files.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		return null;
	}
}
