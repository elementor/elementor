<?php

namespace Elementor\Core\Abilities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Upload_Media_Ability extends Abstract_Ability {

	protected function get_name(): string {
		return 'wordpress/upload-media';
	}

	protected function get_config(): array {
		return [
			'label'       => 'WordPress Upload Media',
			'description' => 'Sideloads an image (or other file) from a remote URL into the WordPress media library and returns its attachment ID.',
			'category'    => 'elementor',
			'input_schema' => [
				'type'       => 'object',
				'properties' => [
					'url' => [
						'type'        => 'string',
						'description' => 'Publicly accessible URL of the file to download and import.',
					],
					'title' => [
						'type'        => 'string',
						'description' => 'Attachment title. Defaults to the filename derived from the URL.',
					],
					'alt' => [
						'type'        => 'string',
						'description' => 'Alt text for the attachment.',
					],
					'post_id' => [
						'type'        => 'integer',
						'description' => 'Optional. Attach the uploaded file to this post. Omit to create an unattached media item.',
					],
				],
				'required'             => [ 'url' ],
				'additionalProperties' => false,
			],
			'output_schema' => [
				'type'       => 'object',
				'properties' => [
					'id'        => [ 'type' => 'integer' ],
					'title'     => [ 'type' => 'string' ],
					'url'       => [ 'type' => 'string' ],
					'filename'  => [ 'type' => 'string' ],
					'mime_type' => [ 'type' => 'string' ],
					'width'     => [ 'type' => [ 'integer', 'null' ] ],
					'height'    => [ 'type' => [ 'integer', 'null' ] ],
				],
			],
			'meta' => [
				'show_in_rest' => true,
				'mcp'          => [ 'public' => true ],
				'annotations'  => [
					'instructions' => implode( "\n", [
						'Downloads a file from url and adds it to the WordPress media library (sideload).',
						'Returns the new attachment id — use it as image-src.id in Elementor image props.',
						'url must be publicly reachable from the server (not localhost).',
						'title defaults to the filename derived from the URL; set it explicitly for cleaner library management.',
						'post_id is optional — attach to a post if the image belongs to a specific page.',
					] ),
					'readonly'    => false,
					'destructive' => false,
					'idempotent'  => false,
				],
			],
		];
	}

	public function execute( array $input ): array {
		$url     = $input['url'];
		$title   = $input['title'] ?? '';
		$alt     = $input['alt'] ?? '';
		$post_id = isset( $input['post_id'] ) ? (int) $input['post_id'] : 0;

		if ( ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
			throw new \InvalidArgumentException( 'Invalid URL provided.' ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$attachment_id = media_sideload_image( $url, $post_id, $title, 'id' );

		if ( is_wp_error( $attachment_id ) ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			throw new \RuntimeException( 'Media sideload failed: ' . $attachment_id->get_error_message() );
		}

		if ( '' !== $alt ) {
			update_post_meta( $attachment_id, '_wp_attachment_image_alt', sanitize_text_field( $alt ) );
		}

		$meta     = wp_get_attachment_metadata( $attachment_id );
		$file_url = wp_get_attachment_url( $attachment_id );
		$post     = get_post( $attachment_id );

		return [
			'id'        => $attachment_id,
			'title'     => $post ? $post->post_title : '',
			'url'       => $file_url ? $file_url : '',
			'filename'  => basename( get_attached_file( $attachment_id ) ?? '' ),
			'mime_type' => $post ? $post->post_mime_type : '',
			'width'     => isset( $meta['width'] ) ? (int) $meta['width'] : null,
			'height'    => isset( $meta['height'] ) ? (int) $meta['height'] : null,
		];
	}
}
