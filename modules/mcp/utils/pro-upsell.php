<?php

namespace Elementor\Modules\Mcp\Utils;

use Elementor\Modules\Mcp\Module as Mcp_Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Pro_Upsell {

	const ERROR_CODE = 'pro_license_required';

	/**
	 * @param string $message     Tool-specific LLM guidance containing a single %s for the upgrade URL.
	 * @param string $default_url Tool-specific go link, used unless the promotion filter returns an allowed URL.
	 * @param array  $extra_data  Additional error data, e.g. `description_notice`.
	 */
	public static function error( string $message, string $default_url, array $extra_data = [] ): \WP_Error {
		$upgrade_url = Mcp_Module::get_promotion_upgrade_url( $default_url );

		return new \WP_Error(
			self::ERROR_CODE,
			sprintf( $message, $upgrade_url ),
			array_merge(
				[
					'status' => \WP_Http::FORBIDDEN,
					'upgrade_url' => $upgrade_url,
				],
				$extra_data
			)
		);
	}
}
