<?php

namespace Elementor\Modules\Mcp\Preview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Applies the WooCommerce fixtures of a public preview link to the preview request only:
 * a cart filled in memory (no cookie, session row or persistent cart is written),
 * a logged-out visitor, and the product a single product site part renders with.
 */
class Woocommerce_Preview_Fixtures {

	/**
	 * @var callable(): ?object
	 */
	private $woocommerce;

	private array $fixtures = [];

	public function __construct( ?callable $woocommerce = null ) {
		$this->woocommerce = $woocommerce ?? fn() => WC();
	}

	public function register(): void {
		add_action( 'elementor/mcp/preview/activated', [ $this, 'on_activated' ], 10, 2 );
		add_filter( 'elementor/mcp/preview/query_vars', [ $this, 'filter_query_vars' ], 20 );
	}

	public function on_activated( $post, $fixtures ): void {
		$this->fixtures = is_array( $fixtures ) ? $fixtures : [];

		add_filter( 'woocommerce_coming_soon_exclude', '__return_true' );

		if ( false === ( $this->fixtures['logged_in'] ?? null ) ) {
			wp_set_current_user( 0 );
		}

		if ( ! empty( $this->fixtures['cart_products'] ) ) {
			$this->fill_cart( $this->fixtures['cart_products'] );
		}
	}

	public function filter_query_vars( $query_vars ) {
		if ( empty( $this->fixtures['product_id'] ) || 'product' !== ( $query_vars['post_type'] ?? '' ) ) {
			return $query_vars;
		}

		$query_vars['p'] = (int) $this->fixtures['product_id'];

		return $query_vars;
	}

	/**
	 * The fixture cart lives only in this request, so the browser-side fragments refresh
	 * would replace the rendered cart widgets with an empty session cart.
	 */
	public function dequeue_cart_fragments(): void {
		wp_dequeue_script( 'wc-cart-fragments' );
	}

	private function fill_cart( array $cart_products ): void {
		$woocommerce = ( $this->woocommerce )();

		if ( empty( $woocommerce->cart ) ) {
			return;
		}

		remove_action( 'shutdown', [ $woocommerce->session, 'save_data' ], 20 );
		add_filter( 'woocommerce_set_cookie_enabled', '__return_false' );
		add_filter( 'woocommerce_persistent_cart_enabled', '__return_false' );

		add_action( 'wp_print_footer_scripts', [ $this, 'dequeue_cart_fragments' ], 1 );

		$woocommerce->cart->empty_cart( false );

		foreach ( $cart_products as $item ) {
			$woocommerce->cart->add_to_cart( (int) $item['product_id'], (int) $item['quantity'] );
		}
	}
}
