<?php

namespace Elementor\Modules\Mcp\Media;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Safe_Remote_Image_Fetcher {

	/**
	 * @return array{tmp_name:string,name:string}|WP_Error
	 */
	public static function fetch_to_temp_file( string $source_url ) {
		$current_url = $source_url;

		for ( $hop = 0; $hop <= Media_Upload_Config::MAX_REDIRECT_HOPS; $hop++ ) {
			$scheme_error = Public_Host_Validator::assert_https_url( $current_url );
			if ( $scheme_error ) {
				return $scheme_error;
			}

			$host = wp_parse_url( $current_url, PHP_URL_HOST );
			if ( ! is_string( $host ) || '' === $host ) {
				return new \WP_Error(
					'invalid_url',
					__( 'The source URL is not valid.', 'elementor' ),
					[ 'status' => \WP_Http::BAD_REQUEST ]
				);
			}

			$host_error = Public_Host_Validator::assert_host_resolves_publicly( $host );
			if ( $host_error ) {
				return $host_error;
			}

			$response = wp_remote_get(
				$current_url,
				[
					'timeout' => Media_Upload_Config::FETCH_TIMEOUT_SECONDS,
					'redirection' => 0,
					'reject_unsafe_urls' => true,
					'limit_response_size' => Media_Upload_Config::max_upload_bytes() + 1,
				]
			);

			if ( is_wp_error( $response ) ) {
				return $response;
			}

			$status = (int) wp_remote_retrieve_response_code( $response );

			if ( in_array( $status, [ 301, 302, 303, 307, 308 ], true ) ) {
				$location = wp_remote_retrieve_header( $response, 'location' );
				if ( ! is_string( $location ) || '' === $location ) {
					return new \WP_Error(
						'invalid_redirect',
						__( 'The source URL returned an invalid redirect.', 'elementor' ),
						[ 'status' => \WP_Http::BAD_REQUEST ]
					);
				}

				$current_url = self::resolve_redirect_location( $current_url, $location );
				if ( is_wp_error( $current_url ) ) {
					return $current_url;
				}

				continue;
			}

			if ( 200 !== $status ) {
				return new \WP_Error(
					'fetch_failed',
					__( 'Could not download the image from the source URL.', 'elementor' ),
					[ 'status' => \WP_Http::BAD_REQUEST ]
				);
			}

			$content_length_error = Media_Upload_Config::assert_content_length_within_limit(
				wp_remote_retrieve_header( $response, 'content-length' )
			);
			if ( $content_length_error ) {
				return $content_length_error;
			}

			$body = wp_remote_retrieve_body( $response );
			$size = strlen( $body );

			if ( $size > Media_Upload_Config::max_upload_bytes() ) {
				return new \WP_Error(
					'file_too_large',
					__( 'The downloaded image exceeds the allowed size limit.', 'elementor' ),
					[ 'status' => \WP_Http::BAD_REQUEST ]
				);
			}

			if ( 0 === $size ) {
				return new \WP_Error(
					'empty_file',
					__( 'The downloaded image is empty.', 'elementor' ),
					[ 'status' => \WP_Http::BAD_REQUEST ]
				);
			}

			$filename = self::filename_from_url( $current_url );
			$tmp = wp_tempnam( $filename );

			if ( ! $tmp ) {
				return new \WP_Error(
					'temp_file_failed',
					__( 'Could not create a temporary file for the download.', 'elementor' ),
					[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
				);
			}

			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			if ( false === file_put_contents( $tmp, $body ) ) {
				wp_delete_file( $tmp );

				return new \WP_Error(
					'temp_file_failed',
					__( 'Could not write the downloaded image to disk.', 'elementor' ),
					[ 'status' => \WP_Http::INTERNAL_SERVER_ERROR ]
				);
			}

			return [
				'tmp_name' => $tmp,
				'name' => $filename,
			];
		}

		return new \WP_Error(
			'too_many_redirects',
			__( 'The source URL redirected too many times.', 'elementor' ),
			[ 'status' => \WP_Http::BAD_REQUEST ]
		);
	}

	private static function resolve_redirect_location( string $base_url, string $location ) {
		$location = trim( $location );

		if ( '' === $location ) {
			return new \WP_Error(
				'invalid_redirect',
				__( 'The source URL returned an invalid redirect.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		if ( str_starts_with( $location, '//' ) ) {
			$scheme = wp_parse_url( $base_url, PHP_URL_SCHEME );
			$location = ( is_string( $scheme ) ? $scheme : 'https' ) . ':' . $location;
		} elseif ( ! preg_match( '#^https?://#i', $location ) ) {
			$base = wp_parse_url( $base_url );
			if ( ! is_array( $base ) || empty( $base['scheme'] ) || empty( $base['host'] ) ) {
				return new \WP_Error(
					'invalid_redirect',
					__( 'The source URL returned an invalid redirect.', 'elementor' ),
					[ 'status' => \WP_Http::BAD_REQUEST ]
				);
			}

			$port = isset( $base['port'] ) ? ':' . $base['port'] : '';
			$prefix = $base['scheme'] . '://' . $base['host'] . $port;

			if ( str_starts_with( $location, '/' ) ) {
				$location = $prefix . $location;
			} else {
				$path = wp_parse_url( $base_url, PHP_URL_PATH );
				$dir = is_string( $path ) ? trailingslashit( dirname( $path ) ) : '/';
				$location = $prefix . $dir . $location;
			}
		}

		$scheme_error = Public_Host_Validator::assert_https_url( $location );
		if ( $scheme_error ) {
			return $scheme_error;
		}

		$host = wp_parse_url( $location, PHP_URL_HOST );
		if ( ! is_string( $host ) || '' === $host ) {
			return new \WP_Error(
				'invalid_redirect',
				__( 'The source URL returned an invalid redirect.', 'elementor' ),
				[ 'status' => \WP_Http::BAD_REQUEST ]
			);
		}

		$host_error = Public_Host_Validator::assert_host_resolves_publicly( $host );
		if ( $host_error ) {
			return $host_error;
		}

		return $location;
	}

	private static function filename_from_url( string $url ): string {
		$path = wp_parse_url( $url, PHP_URL_PATH );
		$basename = is_string( $path ) ? wp_basename( $path ) : '';

		if ( '' === $basename || '.' === $basename || '..' === $basename ) {
			return 'mcp-sideload-' . wp_generate_password( 8, false ) . '.img';
		}

		return sanitize_file_name( $basename );
	}
}
