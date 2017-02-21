<?php

namespace Elementor;

class Coming_Soon {

	const OPTION_PAGE_KEY = 'elementor_coming_soon_page_id';

	public static function update_page_id( $value ) {
		return update_option( self::OPTION_PAGE_KEY, $value );
	}

	static function get_page_id() {
		return get_option( self::OPTION_PAGE_KEY );
	}

	public function template_redirect() {
		query_posts( [
			'page_id' => self::get_page_id(),
		] );
	}

	public function template_include() {
		return ELEMENTOR_PATH . '/includes/templates/empty.php';
	}

	public function __construct() {
		if ( self::get_page_id() ) {
			add_action( 'template_redirect', [ $this, 'template_redirect' ] );
			add_filter( 'template_include', [ $this, 'template_include' ] );
		}
	}
}
