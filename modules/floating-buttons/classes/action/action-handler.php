<?php

namespace Elementor\Modules\FloatingButtons\Classes\Action;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Modules\FloatingButtons\Documents\Floating_Buttons;
use Elementor\Modules\FloatingButtons\Module;

class Action_Handler {

	const CONDITIONS_CACHE_META_KEY = 'elementor_pro_theme_builder_conditions';

	protected string $action;

	protected array $menu_args;

	public function __construct( string $action, array $menu_args ) {
		$this->action    = $action;
		$this->menu_args = $menu_args;
	}

	public function process_action() {
		switch ( $this->action ) {
			case 'remove_from_entire_site':
				$post_id = filter_input( INPUT_GET, 'post', FILTER_VALIDATE_INT );
				check_admin_referer( 'remove_from_entire_site_' . $post_id );
				delete_post_meta( $post_id, '_elementor_conditions' );
				$this->remove_from_conditions_cache( $post_id );

				wp_redirect( $this->menu_args['menu_slug'] );
				exit;
			case 'set_as_entire_site':
				$post_id = filter_input( INPUT_GET, 'post', FILTER_VALIDATE_INT );
				check_admin_referer( 'set_as_entire_site_' . $post_id );

				$posts = get_posts( [
					'post_type'              => Module::CPT_FLOATING_BUTTONS,
					'posts_per_page'         => - 1,
					'post_status'            => 'publish',
					'fields'                 => 'ids',
					'no_found_rows'          => true,
					'update_post_term_cache' => false,
					'update_post_meta_cache' => false,
					'meta_query'             => Floating_Buttons::get_meta_query_for_floating_buttons(
						Floating_Buttons::get_floating_element_type( $post_id )
					),
				] );

				foreach ( $posts as $post_id_to_delete ) {
					delete_post_meta( $post_id_to_delete, '_elementor_conditions' );
					$this->remove_from_conditions_cache( $post_id_to_delete );
				}

				update_post_meta( $post_id, '_elementor_conditions', [ 'include/general' ] );
				$this->add_to_conditions_cache( $post_id );

				wp_redirect( $this->menu_args['menu_slug'] );
				exit;
			default:
				break;
		}
	}

	private function remove_from_conditions_cache( $post_id ): void {
		$conditions = get_option( self::CONDITIONS_CACHE_META_KEY, [] );

		if ( isset( $conditions['floating_buttons'][ $post_id ] ) ) {
			unset( $conditions['floating_buttons'][ $post_id ] );

			if ( empty( $conditions['floating_buttons'] ) ) {
				unset( $conditions['floating_buttons'] );
			}

			update_option( self::CONDITIONS_CACHE_META_KEY, $conditions );
		}
	}

	private function add_to_conditions_cache( $post_id ): void {
		$conditions = get_option( self::CONDITIONS_CACHE_META_KEY, [] );
		if ( ! isset( $conditions['floating_buttons'] ) ) {
			$conditions['floating_buttons'] = [];
		}

		$conditions['floating_buttons'][ $post_id ] = [ 'include/general' ];
	}
}
