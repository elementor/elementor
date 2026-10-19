<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Media\Media_Attachment_Service;
use Elementor\Modules\Mcp\Media\Mcp_Media_Feature_Gate;
use Elementor\Modules\Mcp\Media\Media_Upload_Config;
use Elementor\Modules\Mcp\Media\Media_Upload_Input_Guard;
use Elementor\Modules\Mcp\Media\Remote_Image_Fetcher;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Upload_Media_Ability extends Abstract_Ability {

	protected function get_ability_id(): string {
		return 'elementor/upload-media';
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
					'total' => [ 'type' => 'integer' ],
					'succeeded' => [ 'type' => 'integer' ],
					'failed' => [ 'type' => 'integer' ],
					'uploads' => [
						'type' => 'array',
						'items' => [
							'type' => 'object',
							'properties' => [
								'index' => [ 'type' => 'integer' ],
								'source_url' => [ 'type' => 'string' ],
								'status' => [
									'type' => 'string',
									'enum' => [ 'ok', 'error' ],
								],
								'attachment_id' => [ 'type' => 'integer' ],
								'url' => [ 'type' => 'string' ],
								'mime' => [ 'type' => 'string' ],
								'width' => [ 'type' => [ 'integer', 'null' ] ],
								'height' => [ 'type' => [ 'integer', 'null' ] ],
								'alt' => [ 'type' => 'string' ],
								'error' => [
									'type' => 'object',
									'properties' => [
										'code' => [ 'type' => 'string' ],
										'message' => [ 'type' => 'string' ],
									],
								],
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
			fn() => current_user_can( Media_Upload_Config::REQUIRED_CAPABILITY ),
			[
				'type' => 'object',
				'required' => [ 'consent' ],
				'properties' => [
					'source_url' => [
						'type' => 'string',
						'format' => 'uri',
						'description' => 'Public HTTPS URL of a single image. Use either source_url or images. Never download or base64-encode the image yourself.',
					],
					'title' => [
						'type' => 'string',
						'maxLength' => Media_Upload_Config::MAX_METADATA_LENGTH,
						'description' => 'Optional attachment title for source_url.',
					],
					'alt' => [
						'type' => 'string',
						'maxLength' => Media_Upload_Config::MAX_METADATA_LENGTH,
						'description' => 'Optional alt text for source_url.',
					],
					'images' => [
						'type' => 'array',
						'minItems' => 1,
						'maxItems' => Media_Upload_Config::MAX_URL_IMPORTS_PER_REQUEST,
						'items' => self::image_item_schema(),
						'description' => 'Several images (1 to ' . Media_Upload_Config::MAX_URL_IMPORTS_PER_REQUEST . '), each with its own source_url and optional title and alt. Use either source_url or images. Every image is imported independently and gets its own result entry.',
					],
					'consent' => [
						'type' => 'boolean',
						'description' => 'Must be true when the user has approved importing the image or images.',
					],
				],
				'additionalProperties' => false,
			]
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		$capability_error = Media_Upload_Input_Guard::require_upload_capability();
		if ( $capability_error ) {
			return $capability_error;
		}

		$consent_error = Media_Upload_Input_Guard::require_upload_consent( $input );
		if ( $consent_error ) {
			return $consent_error;
		}

		$has_single = array_key_exists( 'source_url', $input ) && null !== $input['source_url'];
		$has_list = array_key_exists( 'images', $input ) && null !== $input['images'];

		if ( $has_single && $has_list ) {
			return new \WP_Error(
				'conflicting_source_inputs',
				__( 'Provide either source_url or images, not both.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( $has_list ) {
			return $this->import_list( $input );
		}

		$source_url = isset( $input['source_url'] ) && is_string( $input['source_url'] )
			? esc_url_raw( trim( $input['source_url'] ) )
			: '';

		if ( '' === $source_url ) {
			return self::invalid_source_url_error();
		}

		return $this->import_one( $source_url, self::read_string( $input, 'title' ), self::read_string( $input, 'alt' ) );
	}

	private static function image_item_schema(): array {
		return [
			'type' => 'object',
			'required' => [ 'source_url' ],
			'properties' => [
				'source_url' => [
					'type' => 'string',
					'format' => 'uri',
					'description' => 'Public HTTPS URL of the image.',
				],
				'title' => [
					'type' => 'string',
					'maxLength' => Media_Upload_Config::MAX_METADATA_LENGTH,
					'description' => 'Optional attachment title.',
				],
				'alt' => [
					'type' => 'string',
					'maxLength' => Media_Upload_Config::MAX_METADATA_LENGTH,
					'description' => 'Optional alt text.',
				],
			],
			'additionalProperties' => false,
		];
	}

	/**
	 * @return array|\WP_Error
	 */
	private function import_list( array $input ) {
		if ( array_key_exists( 'title', $input ) || array_key_exists( 'alt', $input ) ) {
			return new \WP_Error(
				'unsupported_with_images',
				__( 'Set title and alt on each entry in images instead of at the top level.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$images = $input['images'];
		$max = Media_Upload_Config::MAX_URL_IMPORTS_PER_REQUEST;

		if ( ! is_array( $images ) || array_values( $images ) !== $images || count( $images ) < 1 || count( $images ) > $max ) {
			return new \WP_Error(
				'invalid_upload_count',
				sprintf(
					/* translators: %d: maximum number of images per request. */
					__( 'images must be a list with at least 1 and at most %d entries.', 'elementor' ),
					$max
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		foreach ( $images as $image ) {
			if ( ! is_array( $image ) || ! is_string( $image['source_url'] ?? null ) || '' === trim( $image['source_url'] ) ) {
				return new \WP_Error(
					'invalid_source_url',
					__( 'Every entry in images must have a non-empty source_url.', 'elementor' ),
					[ 'status' => \WP_Http::BAD_REQUEST ]
				);
			}
		}

		return $this->import_batch( $images );
	}

	/**
	 * Imports each image independently. A failure on one image never stops the others.
	 *
	 * The whole batch has a hard time limit (TOTAL_BATCH_TIMEOUT_SECONDS) that also bounds each
	 * download; images not started before it is reached are reported as `fetch_timeout`.
	 *
	 * @param array<int,array{source_url:string,title?:string,alt?:string}> $images Non-empty list of images.
	 * @param callable|null                                                 $clock  Returns the current time in seconds; defaults to microtime( true ).
	 */
	public function import_batch( array $images, ?callable $clock = null ): array {
		$clock = $clock ?? static fn(): float => microtime( true );
		$deadline = $clock() + Media_Upload_Config::TOTAL_BATCH_TIMEOUT_SECONDS;
		$uploads = [];
		$succeeded = 0;

		foreach ( $images as $index => $image ) {
			$source_url = esc_url_raw( trim( (string) ( $image['source_url'] ?? '' ) ) );
			$entry = [
				'index' => $index,
				'source_url' => self::display_url( $source_url ),
			];

			if ( '' === $source_url ) {
				$result = self::invalid_source_url_error();
			} elseif ( $clock() >= $deadline ) {
				$result = new \WP_Error(
					'fetch_timeout',
					__( 'Downloading the image took too long.', 'elementor' ),
					[ 'status' => \WP_Http::GATEWAY_TIMEOUT ]
				);
			} else {
				$result = $this->import_one(
					$source_url,
					self::read_string( $image, 'title' ),
					self::read_string( $image, 'alt' ),
					$deadline,
					$clock
				);
			}

			if ( is_wp_error( $result ) ) {
				$entry['status'] = 'error';
				$entry['error'] = [
					'code' => $result->get_error_code(),
					'message' => $result->get_error_message(),
				];
			} else {
				$entry['status'] = 'ok';
				$entry = array_merge( $entry, $result );
				++$succeeded;
			}

			$uploads[] = $entry;
		}

		return [
			'total' => count( $uploads ),
			'succeeded' => $succeeded,
			'failed' => count( $uploads ) - $succeeded,
			'uploads' => $uploads,
		];
	}

	private static function read_string( array $input, string $key ): ?string {
		return isset( $input[ $key ] ) && is_string( $input[ $key ] ) ? $input[ $key ] : null;
	}

	private static function invalid_source_url_error(): \WP_Error {
		return new \WP_Error(
			'invalid_source_url',
			__( 'A valid HTTPS source URL is required.', 'elementor' ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	private static function display_url( string $url ): string {
		return substr( (string) preg_replace( '/[?#].*$/s', '', $url ), 0, 300 );
	}

	/**
	 * @return array|\WP_Error
	 */
	private function import_one( string $source_url, ?string $title, ?string $alt, ?float $deadline = null, ?callable $clock = null ) {
		$existing_id = Media_Attachment_Service::find_by_source_url( $source_url );
		if ( $existing_id ) {
			if ( null !== $title || null !== $alt ) {
				return Media_Attachment_Service::update_title_and_alt( $existing_id, $title, $alt );
			}

			return Media_Attachment_Service::format_attachment( $existing_id );
		}

		$file = Remote_Image_Fetcher::fetch_to_temp_file( $source_url, $deadline, $clock );
		if ( is_wp_error( $file ) ) {
			return $file;
		}

		return Media_Attachment_Service::create_from_temp_file( $file, $title, $alt, $source_url );
	}
}
