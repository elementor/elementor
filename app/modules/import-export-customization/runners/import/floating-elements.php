<?php
namespace Elementor\App\Modules\ImportExportCustomization\Runners\Import;

use Elementor\Modules\FloatingButtons\Documents\Floating_Buttons;
use Elementor\Modules\FloatingButtons\Module as FloatingButtonsModule;
use Elementor\App\Modules\ImportExportCustomization\Utils as ImportExportUtils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Floating_Elements extends Import_Runner_Base {

	const CONDITIONS_CACHE_META_KEY = 'elementor_pro_theme_builder_conditions';

	private $posts_cache = [];

	public static function get_name(): string {
		return 'floating-elements';
	}

	public function should_import( array $data ): bool {
		return (
			isset( $data['include'] ) &&
			in_array( 'content', $data['include'], true ) &&
			! empty( $data['manifest']['content']['e-floating-buttons'] ) &&
			! empty( $data['extracted_directory_path'] )
		);
	}

	public function import( array $data, array $imported_data ) {
		$post_type = 'e-floating-buttons';
		$posts_settings = $data['manifest']['content'][ $post_type ];
		$path = $data['extracted_directory_path'] . 'content/' . $post_type . '/';
		$imported_floating_elements = $imported_data['content']['e-floating-buttons']['succeed'] ?? [];
		$imported_post_ids = [];

		foreach ( $posts_settings as $id => $post_settings ) {
			try {
				$imported_post_ids[] = $this->import_floating_element_metadata(
					$id,
					$path,
					$imported_floating_elements
				);
			} catch ( \Exception $e ) {
				continue;
			}
		}

		$this->set_display_conditions_cache( $imported_post_ids );

		return [];
	}

	private function set_display_conditions_cache( array $imported_post_ids ) {
		$conditions = get_option( self::CONDITIONS_CACHE_META_KEY, [] );
		$conditions['floating_buttons'] = [];

		foreach ( $imported_post_ids as $imported_post_id ) {
			$conditions['floating_buttons'][ $imported_post_id ] = [ 'include/general' ];
		}

		update_option( self::CONDITIONS_CACHE_META_KEY, $conditions );
	}

	private function import_floating_element_metadata( $id, $path, $imported_floating_elements ) {
		$post_data = ImportExportUtils::read_json_file( $path . $id );
		$widget_type = $post_data['content'][0]['elements'][0]['widgetType'] ?? '';
		$floating_element_type = 'floating-buttons';
		$imported_post_id = $imported_floating_elements[ $id ] ?? null;

		if ( ! $imported_post_id ) {
			throw new \Exception(
				sprintf(
					/* translators: %s: Floating element ID */
					esc_html__( 'Imported post ID not found for floating element: %s', 'elementor' ),
					esc_html( $id )
				)
			);
		}

		if ( str_starts_with( $widget_type, 'floating-bars' ) ) {
			$floating_element_type = 'floating-bars';
			update_post_meta(
				$imported_post_id,
				FloatingButtonsModule::FLOATING_ELEMENTS_TYPE_META_KEY,
				$floating_element_type
			);
		}

		if ( ! isset( $this->posts_cache[ $floating_element_type ] ) ) {
			$this->posts_cache[ $floating_element_type ] = get_posts( [
				'post_type' => FloatingButtonsModule::CPT_FLOATING_BUTTONS,
				'posts_per_page' => -1,
				'post_status' => 'publish',
				'fields' => 'ids',
				'no_found_rows' => true,
				'update_post_term_cache' => false,
				'update_post_meta_cache' => false,
				'meta_query' => Floating_Buttons::get_meta_query_for_floating_buttons(
					$floating_element_type
				),
			] );
		}

		$posts = $this->posts_cache[ $floating_element_type ];

		foreach ( $posts as $post_id ) {
			delete_post_meta( $post_id, '_elementor_conditions' );
		}

		update_post_meta(
			$imported_post_id,
			'_elementor_conditions',
			[ 'include/general' ]
		);

		return $imported_post_id;
	}
}
