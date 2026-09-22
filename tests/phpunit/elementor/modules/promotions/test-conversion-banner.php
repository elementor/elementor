<?php

namespace {
	if ( ! function_exists( 'esc_html__' ) ) {
		function esc_html__( $text, $domain = 'default' ) {
			return esc_html( $text );
		}
	}

	if ( ! function_exists( 'add_action' ) ) {
		function add_action( ...$args ) {}
	}

	if ( ! function_exists( 'add_filter' ) ) {
		function add_filter( ...$args ) {}
	}

	if ( ! function_exists( 'apply_filters' ) ) {
		function apply_filters( $tag, $value, ...$args ) {
			return $value;
		}
	}

	if ( ! function_exists( 'wp_parse_url' ) ) {
		function wp_parse_url( $url, $component = -1 ) {
			return parse_url( $url, $component );
		}
	}

	if ( ! function_exists( 'esc_url' ) ) {
		function esc_url( $url ) {
			return filter_var( $url, FILTER_SANITIZE_URL );
		}
	}
}

namespace Elementor\Tests\Phpunit\Elementor\Modules\Promotions {

use Elementor\Modules\Promotions\Conversion_Banner;
use PHPUnit\Framework\TestCase;
use ReflectionMethod;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once dirname( __DIR__, 5 ) . '/includes/utils.php';

class Test_Conversion_Banner extends TestCase {
	public function test_get_banner_config__uses_elementor_branded_copy() {
		// Arrange
		$banner = new Conversion_Banner();
		$method = new ReflectionMethod( Conversion_Banner::class, 'get_banner_config' );
		$method->setAccessible( true );

		// Act
		$config = $method->invoke( $banner );

		// Assert
		$this->assertSame( 'Elevate your site with Elementor Pro', $config['title'] );
		$this->assertSame(
			'Access Elementor\'s Theme Builder, Dynamic Content, WooCommerce Builder, Popup Builder, 85+ Pro widgets and more when you upgrade to Pro',
			$config['text']
		);
		$this->assertSame( 'Upgrade now', $config['buttons'][0]['text'] );
		$this->assertSame( Conversion_Banner::UPGRADE_URL, $config['buttons'][0]['link'] );
	}
}

}
