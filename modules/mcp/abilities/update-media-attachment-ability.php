<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Media\Media_Attachment_Service;
use Elementor\Modules\Mcp\Media\Mcp_Media_Feature_Gate;
use Elementor\Modules\Mcp\Media\Media_Upload_Config;
use Elementor\Modules\Mcp\Media\Media_Upload_Input_Guard;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Update_Media_Attachment_Ability extends Abstract_Ability {

	// 2^53 - 1 (JS Number.MAX_SAFE_INTEGER): the largest integer a JSON client can send without losing precision.
	const MAX_ATTACHMENT_ID = 9007199254740991;

	protected function get_ability_id(): string {
		return 'elementor/update-media-attachment';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'Update Media Attachment Meta', 'elementor' ),
			Prompt_Loader::load( 'update-media-attachment' ),
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
					'idempotent' => true,
					'destructive' => false,
				],
				'mutates_page' => false,
			],
			fn() => current_user_can( Media_Upload_Config::REQUIRED_CAPABILITY ),
			[
				'type' => 'object',
				'required' => [ 'attachment_id' ],
				'properties' => [
					'attachment_id' => [
						'type' => 'integer',
						'description' => 'Media Library attachment ID.',
					],
					'title' => [
						'type' => 'string',
						'maxLength' => Media_Upload_Config::MAX_METADATA_LENGTH,
						'description' => 'New attachment title. Must not be empty.',
					],
					'alt' => [
						'type' => 'string',
						'maxLength' => Media_Upload_Config::MAX_METADATA_LENGTH,
						'description' => 'New alt text. An empty string clears the alt text.',
					],
				],
				'additionalProperties' => false,
			]
		);
	}

	public function is_available() {
		$gate = parent::is_available();

		if ( is_wp_error( $gate ) ) {
			return $gate;
		}

		return Mcp_Media_Feature_Gate::availability();
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		if ( ! Mcp_Media_Feature_Gate::is_enabled() ) {
			return Mcp_Media_Feature_Gate::disabled_error();
		}

		$capability_error = Media_Upload_Input_Guard::require_upload_capability();
		if ( $capability_error ) {
			return $capability_error;
		}

		$attachment_id = $this->read_attachment_id( $input );
		if ( $attachment_id <= 0 ) {
			return new \WP_Error(
				'invalid_attachment',
				__( 'A valid attachment ID is required.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$title = isset( $input['title'] ) && is_string( $input['title'] ) ? $input['title'] : null;
		$alt = isset( $input['alt'] ) && is_string( $input['alt'] ) ? $input['alt'] : null;

		if ( null !== $title && '' === trim( $title ) ) {
			return new \WP_Error(
				'invalid_title',
				__( 'The title must not be empty.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( null === $title && null === $alt ) {
			return new \WP_Error(
				'nothing_to_update',
				__( 'Provide a title or alt value to update.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return Media_Attachment_Service::update_title_and_alt( $attachment_id, $title, $alt );
	}

	private function read_attachment_id( array $input ): int {
		$value = $input['attachment_id'] ?? null;

		if ( is_int( $value ) ) {
			return $value;
		}

		if ( is_float( $value ) && is_finite( $value ) && $value >= 1 && $value <= self::MAX_ATTACHMENT_ID && floor( $value ) === $value ) {
			return (int) $value;
		}

		if ( is_string( $value ) && ctype_digit( $value ) && strlen( $value ) <= 18 ) {
			return (int) $value;
		}

		return 0;
	}
}
