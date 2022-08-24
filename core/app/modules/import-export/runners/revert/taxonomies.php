<?php
namespace Elementor\Core\App\Modules\ImportExport\Runners\Revert;

use Elementor\Core\App\Modules\ImportExport\Utils as ImportExportUtils;

class Taxonomies extends Revert_Runner_Base {

	public static function get_name() : string {
		return 'taxonomies';
	}

	public function should_revert( array $data ) {
		return (
			isset( $data['runners'] ) &&
			array_key_exists( static::get_name(), $data['runners'] )
		);
	}

	public function revert( array $data ) {
		$taxonomies = get_taxonomies();

		$terms = get_terms( [
			'taxonomy' => $taxonomies,
			'hide_empty' => false,
			'get' => 'all',
			'meta_query' => [
				[
					'key'       => static::IMPORT_SESSION_META_KEY,
					'value'     => $data['session_id'],
				],
			],
		] );

		foreach ( $terms as $term ) {
			wp_delete_term( $term->term_id, $term->taxonomy );
		}
	}
}
