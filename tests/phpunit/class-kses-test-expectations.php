<?php

namespace ElementorEditorTesting;

use DOMDocument;
use DOMElement;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Kses_Test_Expectations {

	private static ?bool $strips_disallowed_element_content = null;

	public static function wp_kses_strips_disallowed_element_content(): bool {
		if ( null === self::$strips_disallowed_element_content ) {
			self::$strips_disallowed_element_content = 'xz' === wp_kses_post( 'x<script>y</script>z' );
		}

		return self::$strips_disallowed_element_content;
	}

	public static function expected_wp_kses_plain_string( string $release, string $trunk ): string {
		return self::wp_kses_strips_disallowed_element_content() ? $trunk : $release;
	}

	public static function assert_same_wp_kses_plain_string( TestCase $test_case, string $actual, string $release, string $trunk ): void {
		$test_case->assertSame( self::expected_wp_kses_plain_string( $release, $trunk ), $actual );
	}

	public static function assert_sanitized_data_href_link( TestCase $test_case, string $html ): void {
		$test_case->assertStringContainsString( 'click', $html );
		self::assert_no_anchor_uses_data_href( $test_case, $html );

		if ( ! self::wp_kses_strips_disallowed_element_content() ) {
			$test_case->assertStringNotContainsString( '<a href=', $html );
		}
	}

	private static function assert_no_anchor_uses_data_href( TestCase $test_case, string $html ): void {
		$document = new DOMDocument();
		$use_internal_errors = libxml_use_internal_errors( true );
		$document->loadHTML( '<?xml encoding="utf-8" ?>' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
		libxml_clear_errors();
		libxml_use_internal_errors( $use_internal_errors );

		$anchors = $document->getElementsByTagName( 'a' );
		foreach ( $anchors as $anchor ) {
			if ( ! $anchor instanceof DOMElement || ! $anchor->hasAttribute( 'href' ) ) {
				continue;
			}

			$href = strtolower( trim( $anchor->getAttribute( 'href' ) ) );
			$test_case->assertFalse(
				str_starts_with( $href, 'data:' ),
				'Sanitized HTML must not contain a link with a data: href.'
			);
		}
	}

	public static function assert_same_img_markup( TestCase $test_case, string $expected, string $actual ): void {
		$expected_attributes = self::parse_img_attributes( $expected );
		$actual_attributes = self::parse_img_attributes( $actual );

		$test_case->assertNotEmpty( $expected_attributes );
		$test_case->assertNotEmpty( $actual_attributes );
		$test_case->assertSame( $expected_attributes, $actual_attributes );
	}

	private static function parse_img_attributes( string $html ): array {
		$document = new DOMDocument();
		$use_internal_errors = libxml_use_internal_errors( true );
		$document->loadHTML( '<?xml encoding="utf-8" ?>' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );
		libxml_clear_errors();
		libxml_use_internal_errors( $use_internal_errors );

		$image = $document->getElementsByTagName( 'img' )->item( 0 );
		if ( ! $image instanceof DOMElement ) {
			return [];
		}

		$attributes = [];
		foreach ( $image->attributes as $attribute ) {
			$attributes[ strtolower( $attribute->name ) ] = $attribute->value;
		}
		ksort( $attributes );

		return $attributes;
	}
}
