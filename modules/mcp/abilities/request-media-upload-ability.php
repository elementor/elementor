<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Media\Media_Upload_Config;
use Elementor\Modules\Mcp\Media\Mcp_Media_Feature_Gate;
use Elementor\Modules\Mcp\Media\Media_Upload_Input_Guard;
use Elementor\Modules\Mcp\Media\Media_Upload_Token_Store;
use Elementor\Modules\Mcp\RestApi\Mcp_Media_Upload_REST_API;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Request_Media_Upload_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/request-media-upload';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Request One-Time Media Upload', 'elementor' ),
			Prompt_Loader::load( 'request-media-upload' ),
			'elementor',
			[
				'type' => 'object',
				'properties' => [
					'upload_url' => [
						'type' => 'string',
						'format' => 'uri',
					],
					'token_header' => [ 'type' => 'string' ],
					'upload_token' => [ 'type' => 'string' ],
					'curl_command' => [ 'type' => 'string' ],
					'expires_at' => [
						'type' => 'string',
						'format' => 'date-time',
					],
					'expires_at_unix' => [ 'type' => 'integer' ],
					'uploads' => [
						'type' => 'array',
						'description' => 'One entry per requested file. Each upload_token is single-use. The top-level fields repeat the first entry.',
						'items' => [
							'type' => 'object',
							'properties' => [
								'upload_url' => [
									'type' => 'string',
									'format' => 'uri',
								],
								'token_header' => [ 'type' => 'string' ],
								'upload_token' => [ 'type' => 'string' ],
								'curl_command' => [ 'type' => 'string' ],
								'expires_at' => [
									'type' => 'string',
									'format' => 'date-time',
								],
								'expires_at_unix' => [ 'type' => 'integer' ],
							],
						],
					],
				],
			],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => false,
				],
				'mutates_page' => false,
			],
			fn() => current_user_can( 'upload_files' ),
			[
				'type' => 'object',
				'required' => [ 'consent' ],
				'properties' => [
					'consent' => [
						'type' => 'boolean',
						'description' => 'Must be true when the user has approved uploading a local file.',
					],
					'count' => [
						'type' => 'integer',
						'minimum' => 1,
						'maximum' => Media_Upload_Config::MAX_UPLOADS_PER_REQUEST,
						'default' => 1,
						'description' => 'Number of files to upload. One single-use upload token is issued per file. Defaults to 1.',
					],
				],
				'additionalProperties' => false,
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		if ( ! Mcp_Media_Feature_Gate::is_enabled() ) {
			return Mcp_Media_Feature_Gate::disabled_error();
		}

		$capability_error = Media_Upload_Input_Guard::require_upload_files_capability();
		if ( $capability_error ) {
			return $capability_error;
		}

		$consent_error = Media_Upload_Input_Guard::require_upload_consent( $input );
		if ( $consent_error ) {
			return $consent_error;
		}

		$count = $this->read_count( $input );
		if ( is_wp_error( $count ) ) {
			return $count;
		}

		$user_id = get_current_user_id();

		if ( ! Media_Upload_Token_Store::has_capacity_for( $user_id, $count ) ) {
			return new \WP_Error(
				'too_many_pending_uploads',
				__( 'There are too many unused upload tokens. Use or wait for the existing ones to expire, then try again.', 'elementor' ),
				[ 'status' => \WP_Http::TOO_MANY_REQUESTS ]
			);
		}

		$upload_url = rest_url( Mcp_Media_Upload_REST_API::API_NAMESPACE . '/' . Mcp_Media_Upload_REST_API::ROUTE );
		$uploads = [];

		for ( $index = 0; $index < $count; $index++ ) {
			$uploads[] = $this->issue_upload( $user_id, $upload_url );
		}

		return array_merge( $uploads[0], [ 'uploads' => $uploads ] );
	}

	/**
	 * @return int|\WP_Error
	 */
	private function read_count( array $input ) {
		if ( ! array_key_exists( 'count', $input ) || null === $input['count'] ) {
			return 1;
		}

		$max = Media_Upload_Config::MAX_UPLOADS_PER_REQUEST;

		if ( ! is_int( $input['count'] ) || $input['count'] < 1 || $input['count'] > $max ) {
			return new \WP_Error(
				'invalid_upload_count',
				sprintf(
					/* translators: %d: maximum number of files per request. */
					__( 'The count must be a whole number between 1 and %d.', 'elementor' ),
					$max
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return $input['count'];
	}

	private function issue_upload( int $user_id, string $upload_url ): array {
		$issued = Media_Upload_Token_Store::issue_for_user( $user_id );
		$header = Media_Upload_Config::UPLOAD_TOKEN_HEADER;
		$token = $issued['token'];

		$curl_command = sprintf(
			"curl -X POST '%s' -H '%s: %s' -H 'Content-Type: application/octet-stream' --data-binary @/path/to/your/image-file",
			$upload_url,
			$header,
			$token
		);

		return [
			'upload_url' => $upload_url,
			'token_header' => $header,
			'upload_token' => $token,
			'curl_command' => $curl_command,
			'expires_at' => gmdate( 'c', $issued['expires_at'] ),
			'expires_at_unix' => $issued['expires_at'],
		];
	}
}
