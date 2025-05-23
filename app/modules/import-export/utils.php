<?php

namespace Elementor\App\Modules\ImportExport;

use Elementor\Core\Utils\Str;
use Elementor\Modules\LandingPages\Module as Landing_Pages_Module;
use Elementor\Modules\System_Info\Reporters\Server;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Utils as ElementorUtils;

class Utils {

	public static function read_json_file( $path ) {
		if ( ! Str::ends_with( $path, '.json' ) ) {
			$path .= '.json';
		}

		$file_content = ElementorUtils::file_get_contents( $path, true );

		return $file_content ? json_decode( $file_content, true ) : [];
	}

	public static function map_old_new_post_ids( array $imported_data ) {
		$result = [];

		$result += $imported_data['templates']['succeed'] ?? [];

		if ( isset( $imported_data['content'] ) ) {
			foreach ( $imported_data['content'] as $post_type ) {
				$result += $post_type['succeed'] ?? [];
			}
		}

		if ( isset( $imported_data['wp-content'] ) ) {
			foreach ( $imported_data['wp-content'] as $post_type ) {
				$result += $post_type['succeed'] ?? [];
			}
		}

		return $result;
	}

	public static function map_old_new_term_ids( array $imported_data ) {
		$result = [];

		if ( ! isset( $imported_data['taxonomies'] ) ) {
			return $result;
		}

		foreach ( $imported_data['taxonomies'] as $post_type_taxonomies ) {
			foreach ( $post_type_taxonomies as $taxonomy ) {
				foreach ( $taxonomy as $term ) {
					$result[ $term['old_id'] ] = $term['new_id'];
				}
			}
		}

		return $result;
	}

	public static function get_elementor_post_types() {
		return [ 'post', 'page', 'e-landing-page' ];
	}

	public static function get_builtin_wp_post_types() {
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

	/**
	 * Transform a string name to title format.
	 *
	 * @param $name
	 *
	 * @return string
	 */
	public static function transform_name_to_title( $name ): string {
		if ( empty( $name ) ) {
			return '';
		}

		$title = str_replace( [ '-', '_' ], ' ', $name );

		return ucwords( $title );
	}
}
