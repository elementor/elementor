<?php
namespace Elementor\App\Modules\KitLibrary\Connect;

use Elementor\Core\Common\Modules\Connect\Apps\Library;
use Elementor\Core\Utils\Exceptions;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Cloud_Kits extends Library {
	const THRESHOLD_UNLIMITED = -1;
	const FAILED_TO_FETCH_QUOTA_KEY = 'failed-to-fetch-quota';
	const INSUFFICIENT_QUOTA_KEY = 'insufficient-quota';

	public function get_title() {
		return esc_html__( 'Cloud Kits', 'elementor' );
	}

	protected function get_api_url(): string {
		return 'https://cloud-library.prod.builder.elementor.red/api/v1/cloud-library';
	}

	/**
	 * @return array|\WP_Error
	 */
	public function get_all( $args = [] ) {
		return $this->http_request( 'GET', 'kits', [], [
			'return_type' => static::HTTP_RETURN_TYPE_ARRAY,
		] );
	}

	/**
	 * @return array|\WP_Error
	 */
	public function get_quota() {
		return $this->http_request( 'GET', 'quota/kits', [], [
			'return_type' => static::HTTP_RETURN_TYPE_ARRAY,
		] );
	}

	public function validate_quota() {
		$quota = $this->get_quota();

		if ( is_wp_error( $quota ) ) {
			throw new \Error( static::FAILED_TO_FETCH_QUOTA_KEY ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		$is_unlimited = self::THRESHOLD_UNLIMITED === $quota['threshold'];
		$has_quota = $quota['currentUsage'] < $quota['threshold'];

		if ( ! $is_unlimited && ! $has_quota ) {
			throw new \Error( static::INSUFFICIENT_QUOTA_KEY ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}
	}

	public function is_eligible() {
		$quota = $this->get_quota();

		if ( is_wp_error( $quota ) ) {
			return false;
		}

		return isset( $quota['threshold'] ) && 0 !== $quota['threshold'];
	}

	public function create_kit( $title, $description, $content_file_data, $preview_file_data, array $includes ) {
		$this->validate_quota();

		$endpoint = 'kits';

		$boundary = wp_generate_password( 24, false );

		$headers = [
			'Content-Type' => 'multipart/form-data; boundary=' . $boundary,
		];

		$body = $this->create_multipart_body(
			[
				'title' => $title,
				'description' => $description,
				'includes' => wp_json_encode( $includes ),
			],
			[
				'file' => [
					'filename' => 'content.zip',
					'content' => $content_file_data,
					'content_type' => 'application/zip',
				],
				'previewFile' => [
					'filename' => 'preview.png',
					'content' => $preview_file_data,
					'content_type' => 'image/png',
				],
			],
			$boundary
		);

		$payload = [
			'headers' => $headers,
			'body' => $body,
			'timeout' => 120,
		];

		$response = $this->http_request( 'POST', $endpoint, $payload, [
			'return_type' => static::HTTP_RETURN_TYPE_ARRAY,
		] );

		if ( empty( $response['id'] ) ) {
			$error_message = esc_html__( 'Failed to create kit: Invalid response', 'elementor' );
			throw new \Exception( $error_message, Exceptions::INTERNAL_SERVER_ERROR ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		return $response;
	}

	public function get_kit( array $args ) {
		$args = array_merge_recursive( $args, [
			'timeout' => 60, // just in case if zip is big
		] );

		return $this->http_request( 'GET', 'kits/' . $args['id'], $args, [
			'return_type' => static::HTTP_RETURN_TYPE_ARRAY,
		] );
	}

	public function delete_kit( int $id ) {
		return $this->http_request( 'DELETE', 'kits/' . $id, [], [
			'return_type' => static::HTTP_RETURN_TYPE_ARRAY,
		] );
	}

	private function create_multipart_body( $fields, $files, $boundary ): string {
		$eol = "\r\n";
		$body = '';

		foreach ( $fields as $name => $value ) {
			$body .= "--{$boundary}{$eol}";
			$body .= "Content-Disposition: form-data; name=\"{$name}\"{$eol}{$eol}";
			$body .= "{$value}{$eol}";
		}

		foreach ( $files as $name => $file ) {
			$filename = basename( $file['filename'] );
			$content_type = $file['content_type'];
			$content = $file['content'];

			$body .= "--{$boundary}{$eol}";
			$body .= "Content-Disposition: form-data; name=\"{$name}\"; filename=\"{$filename}\"{$eol}";
			$body .= "Content-Type: {$content_type}{$eol}{$eol}";
			$body .= $content . $eol;
		}

		$body .= "--{$boundary}--{$eol}";

		return $body;
	}

	protected function init() {}
}
