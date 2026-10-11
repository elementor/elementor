<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Media\Media_Attachment_Service;
use Elementor\Modules\Mcp\Media\Media_Upload_Input_Guard;
use Elementor\Modules\Mcp\Media\Safe_Remote_Image_Fetcher;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Upload_Media_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/upload-media';
	}

	public function is_exposed_via_proxy(): bool {
		return false;
	}

	public function is_exposed_on_server(): bool {
		return false;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Upload Media by URL', 'elementor' ),
			Prompt_Loader::load( 'upload-media' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'attachment_id' => [ 'type' => 'integer' ],
					'url' => [
						'type' => 'string',
						'format' => 'uri',
					],
					'mime' => [ 'type' => 'string' ],
					'width' => [ 'type' => [ 'integer', 'null' ] ],
					'height' => [ 'type' => [ 'integer', 'null' ] ],
					'alt' => [ 'type' => 'string' ],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => false,
				],
			],
			fn() => current_user_can( 'upload_files' ),
			[
				'type' => 'object',
				'required' => [ 'source_url', 'consent' ],
				'properties' => [
					'source_url' => [
						'type' => 'string',
						'format' => 'uri',
						'description' => 'Public HTTPS URL of the image. Never download or base64-encode the image yourself.',
					],
					'title' => [
						'type' => 'string',
						'description' => 'Optional attachment title.',
					],
					'alt' => [
						'type' => 'string',
						'description' => 'Optional alt text for the attachment.',
					],
					'consent' => [
						'type' => 'boolean',
						'description' => 'Must be true when the user has approved importing this image.',
					],
				],
				'additionalProperties' => false,
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		$capability_error = Media_Upload_Input_Guard::require_upload_files_capability();
		if ( $capability_error ) {
			return $capability_error;
		}

		$binary_error = Media_Upload_Input_Guard::reject_inline_binary_fields( $input );
		if ( $binary_error ) {
			return $binary_error;
		}

		$consent_error = Media_Upload_Input_Guard::require_upload_consent( $input );
		if ( $consent_error ) {
			return $consent_error;
		}

		$source_url = isset( $input['source_url'] ) && is_string( $input['source_url'] )
			? esc_url_raw( trim( $input['source_url'] ) )
			: '';

		if ( '' === $source_url ) {
			return new \WP_Error(
				'invalid_source_url',
				__( 'A valid HTTPS source URL is required.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$existing_id = Media_Attachment_Service::find_by_source_url( $source_url );
		if ( $existing_id ) {
			$title = isset( $input['title'] ) && is_string( $input['title'] ) ? $input['title'] : null;
			$alt = isset( $input['alt'] ) && is_string( $input['alt'] ) ? $input['alt'] : null;

			if ( null !== $title || null !== $alt ) {
				$updated = Media_Attachment_Service::update_title_and_alt( $existing_id, $title, $alt );
				if ( ! is_wp_error( $updated ) ) {
					return $updated;
				}
			}

			return Media_Attachment_Service::format_attachment( $existing_id );
		}

		$file = Safe_Remote_Image_Fetcher::fetch_to_temp_file( $source_url );
		if ( is_wp_error( $file ) ) {
			return $file;
		}

		$title = isset( $input['title'] ) && is_string( $input['title'] ) ? $input['title'] : null;
		$alt = isset( $input['alt'] ) && is_string( $input['alt'] ) ? $input['alt'] : null;

		return Media_Attachment_Service::create_from_temp_file( $file, $title, $alt, $source_url );
	}
}
