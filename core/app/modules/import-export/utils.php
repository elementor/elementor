<?php

namespace Elementor\Core\App\Modules\ImportExport;

use Elementor\Modules\LandingPages\Module as Landing_Pages_Module;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Utils as ElementorUtils;

class Utils {

	public static function read_json_file( $path ) {
		$file_content = ElementorUtils::file_get_contents( $path . '.json', true );

		return $file_content ? json_decode( $file_content, true ) : [];
	}

	public static function map_old_new_post_ids( $imported_data ) {
		$map_old_new_post_ids = [];

		if ( ! is_array( $imported_data ) ) {
			return [];
		}

		foreach ( $imported_data as $imported_post ) {
			if ( isset( $imported_post['posts']['succeed'] ) ) {
				$map_old_new_post_ids += $imported_post['posts']['succeed'];
			} elseif ( isset( $imported_post['succeed'] ) ) {
				$map_old_new_post_ids += $imported_post['succeed'];
			} else {
				$map_old_new_post_ids += static::map_old_new_post_ids( $imported_post );
			}
		}

		return $map_old_new_post_ids;
	}

	public static function map_old_new_terms_ids( $imported_data ) {
		$map_old_new_terms_ids = [];

		if ( ! is_array( $imported_data ) ) {
			return [];
		}

		foreach ( $imported_data as $post_type_taxonomies ) {
			foreach ( $post_type_taxonomies as $taxonomy ) {
				foreach ( $taxonomy as $term ) {
					$old_id = key( $term['id'] );
					$new_id = reset( $term['id'] );

					$map_old_new_terms_ids[ $old_id ] = $new_id;
				}
			}
		}
		return $map_old_new_terms_ids;
	}

	public static function get_native_wp_post_types() {
		return [ 'post', 'page', 'nav_menu_item' ];
	}

	public static function get_registered_cpt_names() {
		$post_types = get_post_types( [
			'public' => true,
			'can_export' => true,
			'_builtin' => false,
		] );

		unset(
			$post_types[ Landing_Pages_Module::CPT ],
			$post_types[ Source_Local::CPT ]
		);

		return array_keys( $post_types );
	}
}
