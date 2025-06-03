<?php
namespace Elementor\App\Modules\KitLibrary\Connect;

use Elementor\Core\Common\Modules\Connect\Apps\Base_App;
use Elementor\Core\Common\Modules\Connect\Apps\Library;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Cloud_Kits extends Library {

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

	public function create_kit( $title, $description, $content_file_data, $preview_file_data, array $includes ) {
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
