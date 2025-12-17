<?php

namespace Elementor\Modules\EditorOne\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Active_Menu_Resolver {

	private const HOME_SLUG = 'elementor';

	private Url_Matcher $url_matcher;

	public function __construct( Url_Matcher $url_matcher ) {
		$this->url_matcher = $url_matcher;
	}

	public function resolve( array $menu_items, array $level4_groups, string $current_page, string $current_uri ): array {
		if ( 'elementor-editor' === $current_page || Menu_Config::EDITOR_MENU_SLUG === $current_page ) {
			return $this->create_active_state( self::HOME_SLUG );
		}

		$pro_post_type_match = $this->get_pro_post_type_active_state();

		if ( $pro_post_type_match ) {
			return $pro_post_type_match;
		}

		return $this->find_best_matching_menu_item( $menu_items, $level4_groups, $current_uri );
	}

	public function create_active_state( string $menu_slug, string $child_slug = '', int $score = 0 ): array {
		return [
			'menu_slug' => $menu_slug,
			'child_slug' => $child_slug,
			'score' => $score,
		];
	}

	private function find_best_matching_menu_item( array $menu_items, array $level4_groups, string $current_uri ): array {
		$best_match = $this->create_active_state( '', '', -1 );

		foreach ( $menu_items as $item ) {
			$best_match = $this->update_best_match_from_level4(
				$item,
				$level4_groups,
				$current_uri,
				$best_match
			);

			$score = $this->url_matcher->get_match_score( $item['url'], $current_uri );

			if ( $score > $best_match['score'] ) {
				$best_match = $this->create_active_state( $item['slug'], '', $score );
			}
		}

		return $this->create_active_state( $best_match['menu_slug'], $best_match['child_slug'] );
	}

	private function update_best_match_from_level4(
		array $item,
		array $level4_groups,
		string $current_uri,
		array $best_match
	): array {
		if ( empty( $item['group_id'] ) || ! isset( $level4_groups[ $item['group_id'] ] ) ) {
			return $best_match;
		}

		$group = $level4_groups[ $item['group_id'] ];

		if ( empty( $group['items'] ) ) {
			return $best_match;
		}

		foreach ( $group['items'] as $child_item ) {
			$score = $this->url_matcher->get_match_score( $child_item['url'], $current_uri );

			if ( $score > $best_match['score'] ) {
				$best_match = $this->create_active_state( $item['slug'], $child_item['slug'], $score );
			}
		}

		return $best_match;
	}

	private function get_pro_post_type_active_state(): ?array {
		$current_post_type = filter_input( INPUT_GET, 'post_type', FILTER_SANITIZE_FULL_SPECIAL_CHARS ) ?? '';

		if ( empty( $current_post_type ) ) {
			return null;
		}

		return Menu_Data_Provider::get_elementor_post_types()[ $current_post_type ] ?? null;
	}
}
