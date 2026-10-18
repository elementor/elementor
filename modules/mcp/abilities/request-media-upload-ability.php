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

		$user_id = get_current_user_id();
		$issued = Media_Upload_Token_Store::issue_for_user( $user_id );

		$upload_url = rest_url( Mcp_Media_Upload_REST_API::API_NAMESPACE . '/' . Mcp_Media_Upload_REST_API::ROUTE );
		$header = Media_Upload_Config::UPLOAD_TOKEN_HEADER;
		$token = $issued['token'];

		$curl_command = sprintf(
			"curl -X POST '%s' -H '%s: %s' --data-binary @/path/to/your/image.jpg",
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
