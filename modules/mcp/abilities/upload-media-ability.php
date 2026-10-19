<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Media\Media_Attachment_Service;
use Elementor\Modules\Mcp\Media\Mcp_Media_Feature_Gate;
use Elementor\Modules\Mcp\Media\Media_Upload_Config;
use Elementor\Modules\Mcp\Media\Media_Upload_Input_Guard;
use Elementor\Modules\Mcp\Media\Safe_Remote_Image_Fetcher;

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
						'description' => 'Public HTTPS URL of a single image. Use either source_url or source_urls. Never download or base64-encode the image yourself.',
					],
					'source_urls' => [
						'type' => 'array',
						'minItems' => 1,
						'maxItems' => Media_Upload_Config::MAX_UPLOADS_PER_REQUEST,
						'items' => [
							'type' => 'string',
							'format' => 'uri',
						],
						'description' => 'Public HTTPS URLs of several images (1 to ' . Media_Upload_Config::MAX_UPLOADS_PER_REQUEST . '). Use either source_url or source_urls. Every URL is imported independently and gets its own result entry. title and alt are not supported with this list.',
					],
					'title' => [
						'type' => 'string',
						'maxLength' => Media_Upload_Config::MAX_METADATA_LENGTH,
						'description' => 'Optional attachment title (single source_url only).',
					],
					'alt' => [
						'type' => 'string',
						'maxLength' => Media_Upload_Config::MAX_METADATA_LENGTH,
						'description' => 'Optional alt text for the attachment (single source_url only).',
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

		$binary_error = Media_Upload_Input_Guard::reject_inline_binary_fields( $input );
		if ( $binary_error ) {
			return $binary_error;
		}

		$consent_error = Media_Upload_Input_Guard::require_upload_consent( $input );
		if ( $consent_error ) {
			return $consent_error;
		}

		$has_single = array_key_exists( 'source_url', $input ) && null !== $input['source_url'];
		$has_list = array_key_exists( 'source_urls', $input ) && null !== $input['source_urls'];

		if ( $has_single && $has_list ) {
			return new \WP_Error(
				'conflicting_source_inputs',
				__( 'Provide either source_url or source_urls, not both.', 'elementor' ),
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
			return new \WP_Error(
				'invalid_source_url',
				__( 'A valid HTTPS source URL is required.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$title = isset( $input['title'] ) && is_string( $input['title'] ) ? $input['title'] : null;
		$alt = isset( $input['alt'] ) && is_string( $input['alt'] ) ? $input['alt'] : null;

		return $this->import_one( $source_url, $title, $alt );
	}

	/**
	 * @return array|\WP_Error
	 */
	private function import_list( array $input ) {
		if ( array_key_exists( 'title', $input ) || array_key_exists( 'alt', $input ) ) {
			return new \WP_Error(
				'unsupported_with_source_urls',
				__( 'title and alt are only supported with a single source_url.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$urls = $input['source_urls'];
		$max = Media_Upload_Config::MAX_UPLOADS_PER_REQUEST;

		if ( ! is_array( $urls ) || array_values( $urls ) !== $urls || count( $urls ) < 1 || count( $urls ) > $max ) {
			return new \WP_Error(
				'invalid_upload_count',
				sprintf(
					/* translators: %d: maximum number of URLs per request. */
					__( 'source_urls must be a list with at least 1 and at most %d URLs.', 'elementor' ),
					$max
				),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		foreach ( $urls as $url ) {
			if ( ! is_string( $url ) || '' === trim( $url ) ) {
				return new \WP_Error(
					'invalid_source_url',
					__( 'Every entry in source_urls must be a non-empty string.', 'elementor' ),
					[ 'status' => \WP_Http::BAD_REQUEST ]
				);
			}
		}

		return $this->import_batch( $urls );
	}

	/**
	 * Imports each URL independently. A failure on one URL never stops the others.
	 *
	 * The whole batch has a hard time limit (TOTAL_BATCH_TIMEOUT_SECONDS); URLs not
	 * started before it is reached are reported as `fetch_timeout`.
	 *
	 * @param string[]      $urls  Non-empty list of URL strings.
	 * @param callable|null $clock Returns the current time in seconds; defaults to microtime( true ).
	 */
	public function import_batch( array $urls, ?callable $clock = null ): array {
		$clock = $clock ?? static fn(): float => microtime( true );
		$deadline = $clock() + Media_Upload_Config::TOTAL_BATCH_TIMEOUT_SECONDS;
		$uploads = [];
		$succeeded = 0;

		foreach ( $urls as $index => $raw_url ) {
			$source_url = esc_url_raw( trim( (string) $raw_url ) );
			$entry = [
				'index' => $index,
				'source_url' => self::display_url( $source_url ),
			];

			if ( '' === $source_url ) {
				$result = new \WP_Error(
					'invalid_source_url',
					__( 'A valid HTTPS source URL is required.', 'elementor' ),
					[ 'status' => \WP_Http::BAD_REQUEST ]
				);
			} elseif ( $clock() >= $deadline ) {
				$result = new \WP_Error(
					'fetch_timeout',
					__( 'Downloading the image took too long.', 'elementor' ),
					[ 'status' => \WP_Http::GATEWAY_TIMEOUT ]
				);
			} else {
				$result = $this->import_one( $source_url, null, null );
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

	private static function display_url( string $url ): string {
		return substr( (string) preg_replace( '/[?#].*$/s', '', $url ), 0, 300 );
	}

	/**
	 * @return array|\WP_Error
	 */
	private function import_one( string $source_url, ?string $title, ?string $alt ) {
		$existing_id = Media_Attachment_Service::find_by_source_url( $source_url );
		if ( $existing_id ) {
			if ( null !== $title || null !== $alt ) {
				return Media_Attachment_Service::update_title_and_alt( $existing_id, $title, $alt );
			}

			return Media_Attachment_Service::format_attachment( $existing_id );
		}

		$file = Safe_Remote_Image_Fetcher::fetch_to_temp_file( $source_url );
		if ( is_wp_error( $file ) ) {
			return $file;
		}

		return Media_Attachment_Service::create_from_temp_file( $file, $title, $alt, $source_url );
	}
}
