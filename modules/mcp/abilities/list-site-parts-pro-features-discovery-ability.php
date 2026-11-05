<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use Elementor\Modules\Mcp\Abilities\Utils\Site_Parts_Schema;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class List_Site_Parts_Pro_Features_Discovery_Ability extends Abstract_Ability {

	const CONDITIONS_META_KEY = '_elementor_conditions';

	const POPUP_DISPLAY_SETTINGS_META_KEY = '_elementor_popup_display_settings';

	const POPUP_TYPE = 'popup';

	const LISTED_STATUSES = [ 'publish', 'draft', 'private' ];

	protected function get_ability_id(): string {
		return 'elementor/list-site-parts';
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			__( 'List Site Parts', 'elementor' ),
			Prompt_Loader::load( 'list-site-parts' ),
			'elementor',
			[ 'type' => 'array' ],
			[
				'annotations' => [
					'readonly' => true,
					'idempotent' => true,
					'destructive' => false,
				],
				'mutates_page' => false,
			],
			fn() => current_user_can( 'edit_posts' ),
			Site_Parts_Schema::list_input()
		);
	}

	public function execute( $input = [] ) {
		$input = is_array( $input ) ? $input : [];

		if ( ! empty( $input['active'] ) ) {
			return [];
		}

		return array_map( [ $this, 'format_row' ], $this->get_site_part_ids() );
	}

	private function get_site_part_ids(): array {
		$query = new \WP_Query( [
			'post_type' => Source_Local::CPT,
			'post_status' => self::LISTED_STATUSES,
			'posts_per_page' => -1,
			'meta_query' => [
				[
					'key' => Source_Local::TYPE_META_KEY,
					'value' => Site_Parts_Schema::get_types(),
					'compare' => 'IN',
				],
			],
			'no_found_rows' => true,
			'fields' => 'ids',
		] );

		return $query->posts;
	}

	private function format_row( int $post_id ): array {
		$type = (string) Source_Local::get_template_type( $post_id );
		$conditions = get_post_meta( $post_id, self::CONDITIONS_META_KEY, true );
		$conditions = is_array( $conditions ) ? $conditions : [];

		$row = [
			'id' => $post_id,
			'type' => $type,
			'title' => get_the_title( $post_id ),
			'post_status' => get_post_status( $post_id ),
			'has_conditions' => ! empty( $conditions ),
			'is_active' => false,
			'conditions' => $conditions,
		];

		if ( self::POPUP_TYPE === $type ) {
			$row['display_settings'] = $this->get_popup_display_settings( $post_id );
		}

		return $row;
	}

	private function get_popup_display_settings( int $post_id ): array {
		$stored = get_post_meta( $post_id, self::POPUP_DISPLAY_SETTINGS_META_KEY, true );
		$stored = is_array( $stored ) ? $stored : [];

		return [
			'triggers' => $stored['triggers'] ?? [],
			'timing' => $stored['timing'] ?? [],
		];
	}
}
