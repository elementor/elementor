<?php
namespace Elementor\App\Modules\SiteBuilder;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Site_Identity {

	const OPTION_KEY = 'elementor_site_builder_id';

	public static function get_id(): string {
		$id = get_option( static::OPTION_KEY );

		if ( ! $id ) {
			$id = wp_generate_uuid4();
			update_option( static::OPTION_KEY, $id, true );
		}

		return $id;
	}
}
