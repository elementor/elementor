<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Woocommerce_Pro_Features_Discovery implements Widget_Pro_Features_Discovery {

	const UPGRADE_URL = 'https://go.elementor.com/go-pro-mcp-upgrade-woocommerce/';

	const PRO_FEATURE = 'woocommerce';

	const WIDGET_TYPE_PREFIX = 'woocommerce-';

	const SITE_PART_TYPES = [ 'product', 'product-archive' ];

	public static function is_active(): bool {
		return ! Utils::has_pro() && function_exists( 'wc_get_page_id' );
	}

	public static function supports_widget( string $widget_type ): bool {
		return self::is_active() && in_array( $widget_type, self::get_widget_types(), true );
	}

	public static function for_widget(): \WP_Error {
		return self::error();
	}

	public static function for_site_parts( array $document_types ): \WP_Error {
		return self::error( [ 'document_types' => array_values( array_unique( $document_types ) ) ] );
	}

	public static function get_site_part_types(): array {
		return self::is_active() ? self::SITE_PART_TYPES : [];
	}

	public static function get_description_notice(): string {
		return __( 'This site runs WooCommerce. Elementor\'s MCP can\'t work on store pages here. Elementor Pro (Advanced plan or higher) adds store templates and widgets, which the MCP can build with: one product page design used by every product, shop and category pages, cart, checkout, the account area, and the order summary, all in the site\'s design. Products, prices and store settings stay in WooCommerce either way.', 'elementor' );
	}

	private static function get_widget_types(): array {
		static $widget_types = null;

		if ( null === $widget_types ) {
			$mapped_types = array_keys( require V3_Widget_Map_Registry::REGISTERED_MAPS_FILE );

			$widget_types = array_values(
				array_filter( $mapped_types, fn( string $type ) => str_starts_with( $type, self::WIDGET_TYPE_PREFIX ) )
			);
		}

		return $widget_types;
	}

	private static function error( array $extra_data = [] ): \WP_Error {
		return Pro_Features_Discovery::error(
			self::PRO_FEATURE,
			__( 'Elementor\'s MCP can\'t design WooCommerce pages on this site without Elementor Pro (Advanced plan or higher), so nothing was changed. What Pro gives the user: their agent can design the whole store in the site\'s style. That means one product page design used by every product, plus shop, cart, checkout and account pages that match the rest of the site.', 'elementor' ),
			__( 'Free path: none. Say plainly that store pages keep WooCommerce\'s default look, and that the agent can\'t change them on this site. Don\'t try another way into WooCommerce pages or settings. Build the rest of the request normally.', 'elementor' ),
			self::UPGRADE_URL,
			$extra_data
		);
	}
}
