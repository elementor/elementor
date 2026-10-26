<?php

namespace Elementor\Modules\Components\Utils;

use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Svg_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Classes\Media_Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Makes media-library images inside component data portable across sites.
 *
 * Override values and overridable origin values have no static schema, so the atomic
 * import/export props resolver never reaches them. This walks the raw tree instead and
 * handles every `image-src` / `svg-src` node it finds.
 */
class Remap_Component_Media {
	public static function for_export( array $data ): array {
		return self::walk( $data, fn( array $node ) => self::export_node( $node ) );
	}

	public static function for_import( array $data ): array {
		return self::walk( $data, fn( array $node ) => self::import_node( $node ) );
	}

	private static function walk( array $data, callable $transform_node ): array {
		if ( self::is_media_src_node( $data ) ) {
			return $transform_node( $data );
		}

		foreach ( $data as $key => $value ) {
			if ( is_array( $value ) ) {
				$data[ $key ] = self::walk( $value, $transform_node );
			}
		}

		return $data;
	}

	private static function is_media_src_node( array $data ): bool {
		return isset( $data['$$type'], $data['value'] )
			&& in_array( $data['$$type'], [ Image_Src_Prop_Type::get_key(), Svg_Src_Prop_Type::get_key() ], true )
			&& is_array( $data['value'] );
	}

	private static function export_node( array $node ): array {
		$attachment_id = $node['value']['id']['value'] ?? null;

		if ( empty( $attachment_id ) || ! empty( $node['value']['url'] ) ) {
			return $node;
		}

		$url = wp_get_attachment_url( (int) $attachment_id );

		if ( ! $url ) {
			return $node;
		}

		do_action( 'elementor/templates/collect_media_url', $url, [ 'id' => (int) $attachment_id ] );

		$node['value']['url'] = Url_Prop_Type::generate( $url );

		return $node;
	}

	/**
	 * Only nodes exported with both an id and a url came from the source media library;
	 * url-only nodes are external images and stay as they are.
	 */
	private static function import_node( array $node ): array {
		$attachment_id = $node['value']['id']['value'] ?? null;
		$url = $node['value']['url']['value'] ?? null;

		if ( empty( $attachment_id ) || empty( $url ) ) {
			return $node;
		}

		$imported = self::import_attachment( (int) $attachment_id, $url );

		if ( ! $imported ) {
			$node['value']['id'] = null;

			return $node;
		}

		$node['value']['id']['value'] = (int) $imported['id'];
		$node['value']['url'] = null;

		return $node;
	}

	private static function import_attachment( int $source_id, string $url ) {
		$import_images = Plugin::$instance->templates_manager->get_import_images_instance();
		$local_file_path = Media_Mapper::get_local_file_path( $url );

		if ( $local_file_path !== $url && file_exists( $local_file_path ) ) {
			$imported = $import_images->import_local_file( $local_file_path );

			if ( $imported ) {
				return $imported;
			}
		}

		return $import_images->import( [
			'id' => $source_id,
			'url' => $url,
		] );
	}
}
