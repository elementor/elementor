<?php

namespace Elementor\Modules\Promotions\Data;

use Elementor\Core\Common\Modules\Ajax\Module as Ajax;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Birthday_Promotion_Actions {
	const CTA_VISITED_KEY = '_elementor_10th_bday_cta_visited';
	const SET_CTA_VISITED_AJAX_ACTION = 'birthday_easter_egg_set_cta_visited';
	const VISITED_PARAM = 'visited';

	public function register_ajax_actions(): void {
		add_action( 'elementor/ajax/register_actions', function( Ajax $ajax ) {
			$ajax->register_ajax_action( self::SET_CTA_VISITED_AJAX_ACTION, fn( $data ) => $this->ajax_set_cta_visited( $data ) );
		} );
	}

	private function ajax_set_cta_visited( array $data ): array {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Insufficient permissions', 403 );
		}

		$visited = array_key_exists( self::VISITED_PARAM, $data )
			? ( filter_var( $data[ self::VISITED_PARAM ], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE ) ?? true )
			: true;

		update_user_meta( get_current_user_id(), self::CTA_VISITED_KEY, $visited ? 1 : 0 );

		return [ self::VISITED_PARAM => $visited ];
	}

	public function has_visited_cta(): bool {
		return get_user_meta( get_current_user_id(), self::CTA_VISITED_KEY, true ) === '1';
	}
}
