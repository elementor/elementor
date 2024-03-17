<?php
namespace Elementor\Modules\Ai\Connect;

use Elementor\Core\Common\Modules\Connect\Apps\Library;
use Elementor\Modules\Ai\Module;
use Elementor\Utils as ElementorUtils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Ai extends Library {
	const API_URL = 'https://my.elementor.com/api/v2/ai/';

	const STYLE_PRESET = 'style_preset';
	const IMAGE_TYPE = 'image_type';
	const IMAGE_STRENGTH = 'image_strength';
	const ASPECT_RATIO = 'ratio';
	const IMAGE_RESOLUTION = 'image_resolution';

	const PROMPT = 'prompt';

	public function get_title() {
		return esc_html__( 'AI', 'elementor' );
	}

	protected function get_api_url() {
		return static::API_URL . '/';
	}

	public function get_usage() {
		return $this->ai_request(
			'POST',
			'status/check',
			[
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			]
		);
	}

	public function get_cached_usage() {
		$cache_key = 'elementor_ai_usage';
		$cache_time = 24 * HOUR_IN_SECONDS;
		$usage = get_site_transient( $cache_key );

		if ( ! $usage ) {
			$usage = $this->get_usage();
			set_site_transient( $cache_key, $usage, $cache_time );
		}

		return $usage;
	}

	public function get_remote_config() {
		return $this->ai_request(
			'GET',
			'remote-config/config',
			[
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			]
		);
	}

	/**
	 * get_file_payload
	 * @param $filename
	 * @param $file_type
	 * @param $file_path
	 * @param $boundary
	 *
	 * @return string
	 */
	private function get_file_payload( $filename, $file_type, $file_path, $boundary ) {
		$name = $filename ?? basename( $file_path );
		$mine_type = 'image' === $file_type ? image_type_to_mime_type( exif_imagetype( $file_path ) ) : $file_type;
		$payload = '';
		// Upload the file
		$payload .= '--' . $boundary;
		$payload .= "\r\n";
		$payload .= 'Content-Disposition: form-data; name="' . esc_attr( $name ) . '"; filename="' . esc_attr( $name ) . '"' . "\r\n";
		$payload .= 'Content-Type: ' . $mine_type . "\r\n";
		$payload .= "\r\n";
		$payload .= file_get_contents( $file_path );
		$payload .= "\r\n";

		return $payload;
	}

	private function get_upload_request_body( $body, $file, $boundary, $file_name = '' ) {
		$payload = '';
		// add all body fields as standard POST fields:
		foreach ( $body as $name => $value ) {
			$payload .= '--' . $boundary;
			$payload .= "\r\n";
			$payload .= 'Content-Disposition: form-data; name="' . esc_attr( $name ) . '"' . "\r\n\r\n";
			$payload .= $value;
			$payload .= "\r\n";
		}

		if ( is_array( $file ) ) {
			foreach ( $file as $key => $file_data ) {
				$payload .= $this->get_file_payload( $file_data['name'], $file_data['type'], $file_data['path'], $boundary );
			}
		} else {
			$image_mime = image_type_to_mime_type( exif_imagetype( $file ) );
			// @todo: add validation for supported image types

			if ( empty( $file_name ) ) {
				$file_name = basename( $file );
			}
			$payload .= $this->get_file_payload( $file_name, $image_mime, $file, $boundary );
		}

		$payload .= '--' . $boundary . '--';

		return $payload;
	}

	private function ai_request( $method, $endpoint, $body, $file = false, $file_name = '', $format = 'default' ) {
		$headers = [
			'x-elementor-ai-version' => '2',
		];

		if ( $file ) {
			$boundary = wp_generate_password( 24, false );
			$body = $this->get_upload_request_body( $body, $file, $boundary, $file_name );
			// add content type header
			$headers['Content-Type'] = 'multipart/form-data; boundary=' . $boundary;
		} elseif ( 'json' === $format ) {
			$headers['Content-Type'] = 'application/json';
			$body = wp_json_encode( $body );
		}

		return $this->http_request(
			$method,
			$endpoint,
			[
				'timeout' => 100,
				'headers' => $headers,
				'body' => $body,

			],
			[
				'return_type' => static::HTTP_RETURN_TYPE_ARRAY,
				'with_error_data' => true,
			]
		);
	}

	public function set_get_started() {
		return $this->ai_request(
			'POST',
			'status/get-started',
			[
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			]
		);
	}

	public function set_status_feedback( $response_id ) {
		return $this->ai_request(
			'POST',
			'status/feedback/' . $response_id,
			[
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			]
		);
	}

	public function set_used_gallery_image( $image_id ) {
		return $this->ai_request(
			'POST',
			'status/used-gallery-image/' . $image_id,
			[
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			]
		);
	}

	public function get_completion_text( $prompt, $context, $request_ids ) {
		return $this->ai_request(
			'POST',
			'text/completion',
			[
				'prompt' => $prompt,
				'context' => wp_json_encode( $context ),
				'ids' => $request_ids,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			]
		);
	}

	/**
	 * get_image_prompt_enhanced
	 * @param $prompt
	 *
	 * @return mixed|\WP_Error
	 */
	public function get_image_prompt_enhanced( $prompt, $context, $request_ids ) {
		return $this->ai_request(
			'POST',
			'text/enhance-image-prompt',
			[
				'prompt' => $prompt,
				'context' => wp_json_encode( $context ),
				'ids' => $request_ids,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			]
		);
	}

	public function get_edit_text( $data, $context, $request_ids ) {
		return $this->ai_request(
			'POST',
			'text/edit',
			[
				'input' => $data['payload']['input'],
				'instruction' => $data['payload']['instruction'],
				'context' => wp_json_encode( $context ),
				'ids' => $request_ids,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			]
		);
	}

	public function get_custom_code( $data, $context, $request_ids ) {
		return $this->ai_request(
			'POST',
			'text/custom-code',
			[
				'prompt' => $data['payload']['prompt'],
				'language' => $data['payload']['language'],
				'context' => wp_json_encode( $context ),
				'ids' => $request_ids,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			]
		);
	}

	public function get_custom_css( $data, $context, $request_ids ) {
		return $this->ai_request(
			'POST',
			'text/custom-css',
			[
				'prompt' => $data['payload']['prompt'],
				'html_markup' => $data['payload']['html_markup'],
				'element_id' => $data['payload']['element_id'],
				'context' => wp_json_encode( $context ),
				'ids' => $request_ids,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			]
		);
	}

	/**
	 * get_text_to_image
	 * @param $prompt
	 * @param $prompt_settings
	 *
	 * @return mixed|\WP_Error
	 */
	public function get_text_to_image( $data, $context, $request_ids ) {
		return $this->ai_request(
			'POST',
			'image/text-to-image',
			[
				self::PROMPT => $data['payload']['prompt'],
				self::IMAGE_TYPE => $data['payload']['promptSettings'][ self::IMAGE_TYPE ] . '/' . $data['payload']['promptSettings'][ self::STYLE_PRESET ],
				self::ASPECT_RATIO => $data['payload']['promptSettings'][ self::ASPECT_RATIO ],
				'context' => wp_json_encode( $context ),
				'ids' => $request_ids,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			]
		);
	}

	/**
	 * get_image_to_image
	 * @param $image_data
	 *
	 * @return mixed|\WP_Error
	 * @throws \Exception
	 */
	public function get_image_to_image( $image_data, $context, $request_ids ) {
		$image_file = get_attached_file( $image_data['attachment_id'] );

		if ( ! $image_file ) {
			throw new \Exception( 'Image file not found' );
		}

		$result = $this->ai_request(
			'POST',
			'image/image-to-image',
			[
				self::PROMPT => $image_data[ self::PROMPT ],
				self::IMAGE_TYPE => $image_data['promptSettings'][ self::IMAGE_TYPE ] . '/' . $image_data['promptSettings'][ self::STYLE_PRESET ],
				self::IMAGE_STRENGTH => $image_data['promptSettings'][ self::IMAGE_STRENGTH ],
				self::ASPECT_RATIO => $image_data['promptSettings'][ self::ASPECT_RATIO ],
				'context' => wp_json_encode( $context ),
				'ids' => $request_ids,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			],
			$image_file,
			'image'
		);

		return $result;
	}

	/**
	 * get_image_to_image_upscale
	 * @param $image_data
	 *
	 * @return mixed|\WP_Error
	 * @throws \Exception
	 */
	public function get_image_to_image_upscale( $image_data, $context, $request_ids ) {
		$image_file = get_attached_file( $image_data['attachment_id'] );

		if ( ! $image_file ) {
			throw new \Exception( 'Image file not found' );
		}

		$result = $this->ai_request(
			'POST',
			'image/image-to-image/upscale',
			[
				self::IMAGE_RESOLUTION => $image_data['promptSettings']['upscale_to'],
				'context' => wp_json_encode( $context ),
				'ids' => $request_ids,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			],
			$image_file,
			'image'
		);

		return $result;
	}

	/**
	 * get_image_to_image_remove_background
	 * @param $image_data
	 *
	 * @return mixed|\WP_Error
	 * @throws \Exception
	 */
	public function get_image_to_image_remove_background( $image_data, $context, $request_ids ) {
		$image_file = get_attached_file( $image_data['attachment_id'] );

		if ( ! $image_file ) {
			throw new \Exception( 'Image file not found' );
		}

		$result = $this->ai_request(
			'POST',
			'image/image-to-image/remove-background',
			[
				'context' => wp_json_encode( $context ),
				'ids' => $request_ids,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			],
			$image_file,
			'image'
		);

		return $result;
	}

	/**
	 * get_image_to_image_remove_text
	 * @param $image_data
	 *
	 * @return mixed|\WP_Error
	 * @throws \Exception
	 */
	public function get_image_to_image_replace_background( $image_data, $context, $request_ids ) {
		$image_file = get_attached_file( $image_data['attachment_id'] );

		if ( ! $image_file ) {
			throw new \Exception( 'Image file not found' );
		}

		$result = $this->ai_request(
			'POST',
			'image/image-to-image/replace-background',
			[
				self::PROMPT => $image_data[ self::PROMPT ],
				'context' => wp_json_encode( $context ),
				'ids' => $request_ids,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			],
			$image_file,
			'image'
		);

		return $result;
	}

	/**
	 * store_temp_file
	 * used to store a temp file for the AI request and deletes it once the request is done
	 * @param $file_content
	 * @param $file_ext
	 *
	 * @return string
	 */
	private function store_temp_file( $file_content, $file_ext = '' ) {
		$temp_file = str_replace( '.tmp', '', wp_tempnam() . $file_ext );
		file_put_contents( $temp_file, $file_content );
		// make sure the temp file is deleted on shutdown
		register_shutdown_function( function () use ( $temp_file ) {
			if ( file_exists( $temp_file ) ) {
				unlink( $temp_file );
			}
		} );
		return $temp_file;
	}

	/**
	 * get_image_to_image_out_painting
	 * @param $image_data
	 *
	 * @return mixed|\WP_Error
	 * @throws \Exception
	 */
	public function get_image_to_image_out_painting( $image_data, $context, $request_ids ) {
		$img_content = str_replace( ' ', '+', $image_data['mask'] );
		$img_content = substr( $img_content, strpos( $img_content, ',' ) + 1 );
		$img_content = base64_decode( $img_content );
		$mask_file = $this->store_temp_file( $img_content, '.png' );

		if ( ! $mask_file ) {
			throw new \Exception( 'Expended Image file not found' );
		}

		$result = $this->ai_request(
			'POST',
			'image/image-to-image/outpainting',
			[
				self::PROMPT => $image_data[ self::PROMPT ],
				self::IMAGE_TYPE => '',
				'context' => wp_json_encode( $context ),
				'ids' => $request_ids,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			],
			[
				[
					'name' => 'image',
					'type' => 'image',
					'path' => $mask_file,
				],
			]
		);

		return $result;
	}

	/**
	 * get_image_to_image_mask
	 * @param $image_data
	 *
	 * @return mixed|\WP_Error
	 * @throws \Exception
	 */
	public function get_image_to_image_mask( $image_data, $context, $request_ids ) {
		$image_file = get_attached_file( $image_data['attachment_id'] );
		$mask_file = $this->store_temp_file( $image_data['mask'], '.svg' );

		if ( ! $image_file ) {
			throw new \Exception( 'Image file not found' );
		}

		if ( ! $mask_file ) {
			throw new \Exception( 'Mask file not found' );
		}

		$result = $this->ai_request(
			'POST',
			'image/image-to-image/inpainting',
			[
				self::PROMPT => $image_data[ self::PROMPT ],
				self::IMAGE_TYPE => $image_data['promptSettings'][ self::IMAGE_TYPE ] . '/' . $image_data['promptSettings'][ self::STYLE_PRESET ],
				self::IMAGE_STRENGTH => $image_data['promptSettings'][ self::IMAGE_STRENGTH ],
				'context' => wp_json_encode( $context ),
				'ids' => $request_ids,
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			],
			[
				[
					'name' => 'image',
					'type' => 'image',
					'path' => $image_file,
				],
				[
					'name' => 'mask_image',
					'type' => 'image/svg+xml',
					'path' => $mask_file,
				],
			]
		);

		return $result;
	}

	public function generate_layout( $data, $context ) {
		$endpoint = 'generate/layout';

		$body = [
			'prompt' => $data['prompt'],
			'variationType' => (int) $data['variationType'],
			'ids' => $data['ids'],
		];

		if ( ! empty( $data['prevGeneratedIds'] ) ) {
			$body['generatedBaseTemplatesIds'] = $data['prevGeneratedIds'];
		}

		if ( ! empty( $data['attachments'] ) ) {
			$attachment = $data['attachments'][0];

			switch ( $attachment['type'] ) {
				case 'json':
					$endpoint = 'generate/generate-json-variation';

					$body['json'] = [
						'type' => 'elementor',
						'elements' => [ $attachment['content'] ],
						'label' => $attachment['label'],
						'source' => $attachment['source'],
					];
					break;
				case 'url':
					$endpoint = 'generate/html-to-elementor';

					$html = wp_json_encode( $attachment['content'] );

					$body['html'] = $html;

					break;
			}
		}

		$context['currentContext'] = $data['currentContext'];

		if ( ElementorUtils::has_pro() ) {
			$context['features'] = [
				'subscriptions' => [ 'Pro' ],
			];
		}

		$metadata = [
			'context' => $context,
			'api_version' => ELEMENTOR_VERSION,
			'site_lang' => get_bloginfo( 'language' ),
			'config' => [
				'generate' => [
					'all' => true,
				],
			],
		];

		$body = array_merge( $body, $metadata );

		// Temp hack for platforms that filters the http_request_args, and it breaks JSON requests.
		remove_all_filters( 'http_request_args' );

		return $this->ai_request(
			'POST',
			$endpoint,
			$body,
			false,
			'',
			'json'
		);
	}

	public function get_layout_prompt_enhanced( $prompt, $enhance_type, $context ) {
		return $this->ai_request(
			'POST',
			'generate/enhance-prompt',
			[
				'prompt' => $prompt,
				'enhance_type' => $enhance_type,
				'context' => wp_json_encode( $context ),
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			]
		);
	}

	public function get_history_by_type( $type, $page, $limit, $context = [] ) {
		$endpoint = Module::HISTORY_TYPE_ALL === $type
			? 'history'
			: add_query_arg( [
				'page' => $page,
				'limit' => $limit,
			], "history/{$type}" );

		return $this->ai_request(
			'POST',
			$endpoint,
			[
				'context' => wp_json_encode( $context ),
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			]
		);
	}

	public function delete_history_item( $id, $context = [] ) {
		return $this->ai_request(
			'DELETE', 'history/' . $id,
			[
				'context' => wp_json_encode( $context ),
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			]
		);
	}

	public function toggle_favorite_history_item( $id, $context = [] ) {
		return $this->ai_request(
			'POST', sprintf( 'history/%s/favorite', $id ),
			[
				'context' => wp_json_encode( $context ),
				'api_version' => ELEMENTOR_VERSION,
				'site_lang' => get_bloginfo( 'language' ),
			]
		);
	}

	protected function init() {}
}
