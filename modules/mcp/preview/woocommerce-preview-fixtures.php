<?php

namespace Elementor\Modules\Mcp\Preview;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders public previews as a logged-out visitor whose cart holds the latest products,
 * so cart, checkout and menu-cart widgets show their filled state. The cart is filled in
 * memory for the preview request only: no cookie, session row or persistent cart is written.
 */
class Woocommerce_Preview_Fixtures {

	const SAMPLE_PRODUCTS_COUNT = 2;

	/**
	 * @var callable(): ?object
	 */
	private $woocommerce;

	/**
	 * @var callable(): int[]
	 */
	private $sample_product_ids;

	public function __construct( ?callable $woocommerce = null, ?callable $sample_product_ids = null ) {
		$this->woocommerce = $woocommerce ?? fn() => WC();
		$this->sample_product_ids = $sample_product_ids ?? [ $this, 'latest_purchasable_product_ids' ];
	}

	public function register(): void {
		add_action( 'elementor/mcp/preview/activated', [ $this, 'on_activated' ] );
	}

	public function on_activated(): void {
		add_filter( 'woocommerce_coming_soon_exclude', '__return_true' );

		wp_set_current_user( 0 );

		$product_ids = ( $this->sample_product_ids )();

		if ( ! empty( $product_ids ) ) {
			$this->fill_cart( $product_ids );
		}
	}

	/**
	 * The sample cart lives only in this request, so the browser-side fragments refresh
	 * would replace the rendered cart widgets with an empty session cart.
	 */
	public function dequeue_cart_fragments(): void {
		wp_dequeue_script( 'wc-cart-fragments' );
	}

	public function latest_purchasable_product_ids(): array {
		return wc_get_products( [
			'status' => 'publish',
			'type' => 'simple',
			'stock_status' => 'instock',
			'orderby' => 'date',
			'order' => 'DESC',
			'limit' => self::SAMPLE_PRODUCTS_COUNT,
			'return' => 'ids',
		] );
	}

	private function fill_cart( array $product_ids ): void {
		$woocommerce = ( $this->woocommerce )();

		if ( empty( $woocommerce->cart ) ) {
			return;
		}

		remove_action( 'shutdown', [ $woocommerce->session, 'save_data' ], 20 );
		add_filter( 'woocommerce_set_cookie_enabled', '__return_false' );
		add_filter( 'woocommerce_persistent_cart_enabled', '__return_false' );

		add_action( 'wp_print_footer_scripts', [ $this, 'dequeue_cart_fragments' ], 1 );

		$woocommerce->cart->empty_cart( false );

		foreach ( $product_ids as $product_id ) {
			$woocommerce->cart->add_to_cart( (int) $product_id );
		}
	}
}
