<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Widgets whose inner elements are hidden, conditional or stateful describe each style target
 * in plain language, and keep the label a short name.
 *
 * @group Elementor\Modules\Mcp
 */
class Test_V3_Style_Target_Descriptions extends TestCase {

	const DESCRIBED_WIDGETS = [
		'nav-menu',
		'countdown',
		'gallery',
		'progress-tracker',
		'woocommerce-product-add-to-cart',
		'woocommerce-product-images',
		'woocommerce-menu-cart',
		'woocommerce-cart',
		'woocommerce-purchase-summary',
		'woocommerce-checkout-page',
		'woocommerce-my-account',
	];

	const MAX_LABEL_LENGTH = 40;

	public function described_targets_provider(): array {
		$files = require V3_Widget_Map_Registry::REGISTERED_MAPS_FILE;
		$cases = [];

		foreach ( self::DESCRIBED_WIDGETS as $widget_type ) {
			/** @var V3_Widget_Map $map */
			$map = require $files[ $widget_type ];

			foreach ( $map->get_all_targets() as $target ) {
				$cases[ $widget_type . ' ' . $target->get_alias() ] = [ $target ];
			}
		}

		return $cases;
	}

	/**
	 * @dataProvider described_targets_provider
	 */
	public function test_target__has_a_description( Style_Target $target ) {
		// Act.
		$description = $target->get_description();

		// Assert.
		$this->assertNotSame( '', trim( $description ) );
	}

	/**
	 * @dataProvider described_targets_provider
	 */
	public function test_target__label_is_a_short_name( Style_Target $target ) {
		// Act.
		$label = $target->get_label();

		// Assert.
		$this->assertNotSame( '', $label );
		$this->assertLessThanOrEqual( self::MAX_LABEL_LENGTH, strlen( $label ), $label );
		$this->assertStringNotContainsString( ';', $label );
		$this->assertStringNotContainsString( '. ', $label );
	}
}
