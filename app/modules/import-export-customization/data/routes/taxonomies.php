<?php
namespace Elementor\App\Modules\ImportExportCustomization\Data\Routes;

use Elementor\App\Modules\ImportExportCustomization\Utils as ImportExportUtils;
use Elementor\Plugin;
use Elementor\App\Modules\ImportExportCustomization\Data\Response;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Taxonomies extends Base_Route {

	protected function get_route(): string {
		return 'taxonomies';
	}

	protected function get_method(): string {
		return \WP_REST_Server::READABLE;
	}

	protected function callback( $request ): \WP_REST_Response {
		try {

			$elementor_post_types = ImportExportUtils::get_elementor_post_types();
			$wp_builtin_post_types = ImportExportUtils::get_builtin_wp_post_types();
			$post_types = array_merge( $elementor_post_types, $wp_builtin_post_types );

			$custom_post_types = ImportExportUtils::get_registered_cpt_names();

			$all_post_types = empty( $custom_post_types ) ? $post_types : array_merge( $post_types, $custom_post_types );

			$taxonomies = get_taxonomies();

			$result = [];

			foreach ( $taxonomies as $taxonomy ) {
				$taxonomy_obj = get_taxonomy( $taxonomy );
				$intersected_post_types = array_intersect( $taxonomy_obj->object_type, $all_post_types );

				if ( empty( $intersected_post_types ) ) {
					continue;
				}

				$result[] = $taxonomy_obj;
			}

			return Response::success( $result );
		} catch ( \Error $e ) {
			Plugin::$instance->logger->get_logger()->error( $e->getMessage(), [
				'meta' => [
					'trace' => $e->getTraceAsString(),
				],
			] );

			return Response::error( $e->getMessage(), 'get_taxomonies_error' );
		}
	}

	protected function get_args(): array {
		return [];
	}
}
