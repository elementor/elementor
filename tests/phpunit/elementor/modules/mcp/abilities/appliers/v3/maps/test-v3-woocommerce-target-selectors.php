<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Fallback CSS lands on the target selector, so it lists the nodes the target's Pro controls
 * paint (Elementor Pro widget-woocommerce-*.css), inside the widget wrapper.
 *
 * @group Elementor\Modules\Mcp
 */
class Test_V3_Woocommerce_Target_Selectors extends TestCase {

	const SELECT2_FIELD = '.select2-container--default .select2-selection--single';

	public function painted_nodes_provider(): array {
		$my_account_tab = '.e-my-account-tab:not(.e-my-account-tab__dashboard--custom)';

		return [
			'cart fields' => [ 'woocommerce-cart', 'fields', [
				'.woocommerce .input-text',
				'.woocommerce select',
				self::SELECT2_FIELD,
			] ],
			'checkout fields' => [ 'woocommerce-checkout-page', 'fields', [
				'#customer_details .form-row .input-text',
				'#customer_details .form-row select',
				'#customer_details .form-row textarea',
				'.e-coupon-box .form-row .input-text',
				'.e-woocommerce-login-anchor .form-row .input-text',
				self::SELECT2_FIELD,
			] ],
			'my account fields' => [ 'woocommerce-my-account', 'fields', [
				$my_account_tab . ' .woocommerce .form-row .input-text',
				$my_account_tab . ' .woocommerce .form-row select',
				$my_account_tab . ' ' . self::SELECT2_FIELD,
				'.e-my-account-tab__payment-methods .woocommerce input[type=text]',
			] ],
			'my account table buttons' => [ 'woocommerce-my-account', 'table-buttons', [
				$my_account_tab . ' .woocommerce .shop_table .button',
				$my_account_tab . ' .woocommerce .order-again .button',
				$my_account_tab . ' .woocommerce-pagination .button',
				'.e-my-account-tab__payment-methods .woocommerce .woocommerce-MyAccount-content-wrapper .button',
			] ],
		];
	}

	/**
	 * @dataProvider painted_nodes_provider
	 */
	public function test_target__selects_the_nodes_its_controls_paint( string $widget_type, string $alias, array $painted_nodes ) {
		// Arrange.
		$files = require V3_Widget_Map_Registry::REGISTERED_MAPS_FILE;
		/** @var V3_Widget_Map $map */
		$map = require $files[ $widget_type ];

		// Act.
		$selector = $this->target_selector( $map, $alias );

		// Assert.
		$this->assertSame( $painted_nodes, array_map( 'trim', explode( ',', $selector ) ) );
	}

	private function target_selector( V3_Widget_Map $map, string $alias ): string {
		foreach ( $map->get_all_targets() as $target ) {
			if ( $alias === $target->get_alias() ) {
				return (string) $target->get_selector();
			}
		}

		$this->fail( "Target {$alias} is not declared." );
	}
}
