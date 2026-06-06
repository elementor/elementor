<?php

namespace Elementor\Modules\Audits\Data\Endpoints;

use Elementor\Control_Media;
use Elementor\Data\V2\Base\Endpoint as Endpoint_Base;
use Elementor\Core\Utils\Hints;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Page_Context extends Endpoint_Base {

	public function get_name(): string {
		return 'page-context';
	}

	public function get_format(): string {
		return 'audits/page-context';
	}

	public function get_items( $request ) {
		$document_id = (int) $request->get_param( 'document_id' );
		$attachment_ids = array_map( 'intval', (array) $request->get_param( 'attachment_ids' ) );

		$post = get_post( $document_id );
		$thumbnail_id = $post ? (int) get_post_thumbnail_id( $post ) : 0;

		return [
			'site_identity' => [
				'site_name_set' => $this->is_site_name_set(),
				'site_description_set' => $this->is_site_description_set(),
				'site_logo_set' => has_custom_logo(),
				'site_favicon_set' => $this->is_site_favicon_set(),
			],
			'kit_id' => (int) get_option( 'elementor_active_kit' ),
			'kit_is_default_unchanged' => $this->is_default_kit_unchanged(),

			'post_title' => $post && '' !== $post->post_title ? $post->post_title : null,
			'post_excerpt' => $post && '' !== $post->post_excerpt ? $post->post_excerpt : null,
			'featured_image_id' => $thumbnail_id > 0 ? $thumbnail_id : null,

			'image_sizes' => $this->collect_image_sizes( $attachment_ids ),

			'is_noindex' => ! (bool) get_option( 'blog_public' ),
			'reading_settings_url' => admin_url( 'options-reading.php' ),

			'privacy_policy_url' => get_privacy_policy_url() ?: null,
			'privacy_settings_url' => admin_url( 'options-privacy.php' ),
			'ally_plugin_active' => Hints::is_plugin_active( 'pojo-accessibility/pojo-accessibility.php' ),
			'ally_plugin_url' => admin_url( 'plugin-install.php?tab=plugin-information&plugin=pojo-accessibility' ),
			'cookiez_plugin_active' => Hints::is_plugin_active( 'cookiez/cookiez.php' ),
			'cookiez_plugin_url' => admin_url( 'plugin-install.php?tab=plugin-information&plugin=cookiez' ),
			'image_optimization_plugin_active' => Hints::is_plugin_active( 'image-optimization/image-optimization.php' ),
			'image_optimization_plugin_url' => Hints::get_plugin_action_url( 'image-optimization' ),
		];
	}

	protected function register() {
		parent::register();
		$this->register_items_route();
	}

	private function collect_image_sizes( array $attachment_ids ): array {
		$result = [];

		foreach ( $attachment_ids as $attachment_id ) {
			if ( ! wp_attachment_is_image( $attachment_id ) ) {
				continue;
			}

			$metadata = wp_get_attachment_metadata( $attachment_id );
			$file_path = get_attached_file( $attachment_id );
			$mime = get_post_mime_type( $attachment_id );
			$src = wp_get_attachment_url( $attachment_id );

			$result[ $attachment_id ] = [
				'width' => isset( $metadata['width'] ) ? (int) $metadata['width'] : 0,
				'height' => isset( $metadata['height'] ) ? (int) $metadata['height'] : 0,
				'filesize_bytes' => $file_path && file_exists( $file_path ) ? (int) filesize( $file_path ) : 0,
				'mime' => $mime ? $mime : '',
				'src' => $src ? $src : '',
				'alt' => Control_Media::get_image_alt( [ 'id' => $attachment_id ] ),
			];
		}

		return $result;
	}

	private function is_default_kit_unchanged(): bool {
		$kit_id = (int) get_option( 'elementor_active_kit' );

		if ( ! $kit_id ) {
			return false;
		}

		$kit_post = get_post( $kit_id );

		if ( ! $kit_post ) {
			return false;
		}

		return $kit_post->post_date_gmt === $kit_post->post_modified_gmt;
	}

	private function is_site_name_set(): bool {
		return $this->is_non_default_string(
			(string) get_option( 'blogname' ),
			[ 'WordPress' ]
		);
	}

	private function is_site_description_set(): bool {
		return $this->is_non_default_string(
			(string) get_option( 'blogdescription' ),
			[ 'Just another WordPress site' ]
		);
	}

	private function is_site_favicon_set(): bool {
		$site_icon_id = (int) get_option( 'site_icon' );

		if ( $site_icon_id <= 0 ) {
			return false;
		}

		return wp_attachment_is_image( $site_icon_id );
	}

	private function is_non_default_string( string $value, array $blocked ): bool {
		$normalized = strtolower( trim( $value ) );

		if ( '' === $normalized ) {
			return false;
		}

		$blocked_normalized = array_map(
			static function ( $blocked_value ) {
				return strtolower( trim( (string) $blocked_value ) );
			},
			$blocked
		);

		return ! in_array( $normalized, $blocked_normalized, true );
	}
}
