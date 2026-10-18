<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Media\Media_Attachment_Service;
use Elementor\Modules\Mcp\Media\Mcp_Media_Feature_Gate;
use Elementor\Modules\Mcp\Media\Media_Upload_Input_Guard;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Update_Media_Attachment_Ability extends Abstract_Ability {

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
			fn() => current_user_can( 'upload_files' ),
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
						'description' => 'New attachment title.',
					],
					'alt' => [
						'type' => 'string',
						'description' => 'New alt text.',
					],
				],
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

		$attachment_id = isset( $input['attachment_id'] ) ? (int) $input['attachment_id'] : 0;
		if ( $attachment_id <= 0 ) {
			return new \WP_Error(
				'invalid_attachment',
				__( 'A valid attachment ID is required.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$title = isset( $input['title'] ) && is_string( $input['title'] ) ? $input['title'] : null;
		$alt = isset( $input['alt'] ) && is_string( $input['alt'] ) ? $input['alt'] : null;

		if ( null === $title && null === $alt ) {
			return new \WP_Error(
				'nothing_to_update',
				__( 'Provide a title or alt value to update.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return Media_Attachment_Service::update_title_and_alt( $attachment_id, $title, $alt );
	}
}
