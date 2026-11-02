<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Utils\Pro_Features_Discovery;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Woocommerce_Pro_Features_Discovery implements Widget_Pro_Features_Discovery {

	const UPGRADE_URL = 'https://go.elementor.com/go-pro-mcp-upgrade-woocommerce/';

	const PRO_FEATURE = 'woocommerce';

	const WIDGET_TYPE_PREFIXES = [ 'woocommerce-', 'wc-' ];

	const SITE_PART_TYPES = [ 'product', 'product-archive' ];

	public static function is_active(): bool {
		return ! Utils::has_pro() && class_exists( 'WooCommerce' );
	}

	public static function supports_widget( string $widget_type ): bool {
		if ( ! self::is_active() ) {
			return false;
		}

		foreach ( self::WIDGET_TYPE_PREFIXES as $prefix ) {
			if ( str_starts_with( $widget_type, $prefix ) ) {
				return true;
			}
		}

		return false;
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
