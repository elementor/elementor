<?php

namespace Elementor\Modules\Mcp\RestApi;

use Elementor\Modules\Mcp\Media\Media_Attachment_Service;
use Elementor\Modules\Mcp\Media\Media_Mime_Validator;
use Elementor\Modules\Mcp\Media\Media_Upload_Config;
use Elementor\Modules\Mcp\Media\Media_Upload_Token_Store;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Mcp_Media_Upload_REST_API {

	const API_NAMESPACE = 'elementor/v1';
	const ROUTE = 'mcp-media-upload';

	public function register_hooks(): void {
		add_action( 'rest_api_init', fn() => $this->register_routes() );
	}

	private function register_routes(): void {
		register_rest_route( self::API_NAMESPACE, '/' . self::ROUTE, [
			'methods' => 'POST',
			'callback' => fn( $request ) => $this->handle_upload( $request ),
			'permission_callback' => fn( $request ) => $this->permission_check( $request ),
		] );
	}

	public function permission_check( \WP_REST_Request $request ): bool {
		$token = $this->read_header( $request, Media_Upload_Config::UPLOAD_TOKEN_HEADER );

		if ( '' === $token ) {
			return false;
		}

		return Media_Upload_Token_Store::is_valid_for_request( $token );
	}

	private function handle_upload( \WP_REST_Request $request ) {
		$token = $this->read_header( $request, Media_Upload_Config::UPLOAD_TOKEN_HEADER );
		if ( '' === $token ) {
			return new \WP_Error(
				'missing_upload_token',
				__( 'The upload token header is required.', 'elementor' ),
				[ 'status' => \WP_Http::UNAUTHORIZED ]
			);
		}

		$token_data = Media_Upload_Token_Store::consume( $token );
		if ( is_wp_error( $token_data ) ) {
			return $token_data;
		}

		$user_id = (int) $token_data['user_id'];
		$current_user_id = get_current_user_id();

		if ( $current_user_id > 0 && $current_user_id !== $user_id ) {
			return new \WP_Error(
				'upload_token_user_mismatch',
				__( 'This upload token belongs to another user.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$previous_user = $current_user_id;
		wp_set_current_user( $user_id );

		if ( ! current_user_can( 'upload_files' ) ) {
			if ( $previous_user > 0 ) {
				wp_set_current_user( $previous_user );
			}

			return new \WP_Error(
				'rest_forbidden',
				__( 'You do not have permission to upload files.', 'elementor' ),
				[ 'status' => \WP_Http::FORBIDDEN ]
			);
		}

		$content_length_error = Media_Upload_Config::assert_content_length_within_limit(
			$request->get_header( 'content-length' )
		);
		if ( $content_length_error ) {
			if ( $previous_user > 0 ) {
				wp_set_current_user( $previous_user );
			}

			return $content_length_error;
		}

		$stream_result = $this->stream_body_to_temp( $request );
		if ( is_wp_error( $stream_result ) ) {
			if ( $previous_user > 0 ) {
				wp_set_current_user( $previous_user );
			}

			return $stream_result;
		}

		$expected_sha = $this->read_header( $request, Media_Upload_Config::UPLOAD_SHA256_HEADER );
		if ( '' !== $expected_sha ) {
			$actual_sha = hash_file( 'sha256', $stream_result['tmp_name'] );
			if ( ! hash_equals( strtolower( $expected_sha ), strtolower( (string) $actual_sha ) ) ) {
				wp_delete_file( $stream_result['tmp_name'] );
				if ( $previous_user > 0 ) {
					wp_set_current_user( $previous_user );
				}

				return new \WP_Error(
					'sha256_mismatch',
					__( 'The uploaded file did not match the expected checksum.', 'elementor' ),
					[ 'status' => \WP_Http::BAD_REQUEST ]
				);
			}
		}

		$filename = $this->read_header( $request, Media_Upload_Config::UPLOAD_FILENAME_HEADER );
		if ( '' === $filename ) {
			$filename = 'mcp-upload.' . Media_Mime_Validator::extension_for_mime(
				Media_Mime_Validator::sniff_mime_type( $stream_result['tmp_name'] ) ?? 'image/jpeg'
			);
		}

		$title = $this->read_header( $request, 'X-Elementor-Mcp-Upload-Title' );
		$alt = $this->read_header( $request, 'X-Elementor-Mcp-Upload-Alt' );

		$result = Media_Attachment_Service::create_from_temp_file(
			[
				'tmp_name' => $stream_result['tmp_name'],
				'name' => sanitize_file_name( $filename ),
			],
			'' !== $title ? $title : null,
			'' !== $alt ? $alt : null,
			null
		);

		if ( $previous_user > 0 ) {
			wp_set_current_user( $previous_user );
		}

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$response = new \WP_REST_Response( $result, \WP_Http::CREATED );
		$response->header( 'Cache-Control', 'no-store' );

		return $response;
	}

	/**
	 * @return array{tmp_name:string}|WP_Error
	 */
	private function stream_body_to_temp( \WP_REST_Request $request ) {
		Media_Attachment_Service::load_admin_media_includes();

		$tmp = wp_tempnam( 'mcp-media-upload' );
		if ( ! $tmp ) {
			return new \WP_Error(
				'temp_file_failed',
				__( 'Could not create a temporary file for the upload.', 'elementor' ),
				[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
			);
		}

		$max_bytes = Media_Upload_Config::max_upload_bytes();
		$input = fopen( 'php://input', 'rb' );

		if ( false === $input ) {
			wp_delete_file( $tmp );

			return new \WP_Error(
				'upload_stream_failed',
				__( 'Could not read the upload body.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$first_byte = fread( $input, 1 );
		if ( ( false === $first_byte || '' === $first_byte ) && feof( $input ) ) {
			fclose( $input );

			if ( $this->allow_request_body_string_fallback() ) {
				return $this->write_chunked_string_to_temp( (string) $request->get_body(), $tmp, $max_bytes );
			}

			wp_delete_file( $tmp );

			return new \WP_Error(
				'empty_file',
				__( 'The uploaded file is empty.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$output = fopen( $tmp, 'wb' );
		if ( false === $output ) {
			fclose( $input );
			wp_delete_file( $tmp );

			return new \WP_Error(
				'upload_stream_failed',
				__( 'Could not read the upload body.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$read = 0;
		$chunk_size = 8192;

		if ( false !== $first_byte && '' !== $first_byte ) {
			$read = 1;
			fwrite( $output, $first_byte );
		}

		while ( ! feof( $input ) ) {
			$chunk = fread( $input, $chunk_size );
			if ( false === $chunk ) {
				fclose( $input );
				fclose( $output );
				wp_delete_file( $tmp );

				return new \WP_Error(
					'upload_stream_failed',
					__( 'Could not read the upload body.', 'elementor' ),
					[ 'status' => \WP_Http::BAD_REQUEST ]
				);
			}

			if ( '' === $chunk ) {
				break;
			}

			$read += strlen( $chunk );
			if ( $read > $max_bytes ) {
				fclose( $input );
				fclose( $output );
				wp_delete_file( $tmp );

				return new \WP_Error(
					'file_too_large',
					__( 'The uploaded file exceeds the allowed size limit.', 'elementor' ),
					[ 'status' => \WP_Http::BAD_REQUEST ]
				);
			}

			fwrite( $output, $chunk );
		}

		fclose( $input );
		fclose( $output );

		if ( 0 === $read ) {
			wp_delete_file( $tmp );

			return new \WP_Error(
				'empty_file',
				__( 'The uploaded file is empty.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		return [ 'tmp_name' => $tmp ];
	}

	/**
	 * @return array{tmp_name:string}|WP_Error
	 */
	private function write_chunked_string_to_temp( string $body, string $tmp, int $max_bytes ) {
		if ( '' === $body ) {
			wp_delete_file( $tmp );

			return new \WP_Error(
				'empty_file',
				__( 'The uploaded file is empty.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$output = fopen( $tmp, 'wb' );
		if ( false === $output ) {
			wp_delete_file( $tmp );

			return new \WP_Error(
				'upload_stream_failed',
				__( 'Could not read the upload body.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$length = strlen( $body );
		if ( $length > $max_bytes ) {
			fclose( $output );
			wp_delete_file( $tmp );

			return new \WP_Error(
				'file_too_large',
				__( 'The uploaded file exceeds the allowed size limit.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$offset = 0;
		$chunk_size = 8192;

		while ( $offset < $length ) {
			$chunk = substr( $body, $offset, $chunk_size );
			fwrite( $output, $chunk );
			$offset += strlen( $chunk );
		}

		fclose( $output );

		return [ 'tmp_name' => $tmp ];
	}

	private function allow_request_body_string_fallback(): bool {
		if ( defined( 'WP_TESTS_DOMAIN' ) && WP_TESTS_DOMAIN ) {
			return true;
		}

		/**
		 * @param bool $allow When true, empty php://input may fall back to WP_REST_Request::get_body() (PHPUnit only).
		 */
		return (bool) apply_filters( 'elementor/mcp/media/allow_stream_body_fallback', false );
	}

	private function read_header( \WP_REST_Request $request, string $name ): string {
		$value = $request->get_header( $name );

		if ( ! is_string( $value ) ) {
			return '';
		}

		return trim( sanitize_text_field( wp_unslash( $value ) ) );
	}
}
