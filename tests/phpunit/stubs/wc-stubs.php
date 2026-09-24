<?php

namespace {
	if ( ! function_exists( 'wc_get_page_id' ) ) {
		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals
		function wc_get_page_id( $page ) {
			global $mock_wc_shop_page_id;
			if ( 'shop' === $page ) {
				return $mock_wc_shop_page_id;
			}
			return -1;
		}
	}
}
