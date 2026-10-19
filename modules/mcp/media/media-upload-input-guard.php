<?php

namespace Elementor\Modules\Mcp\Media;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Media_Upload_Input_Guard {

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
