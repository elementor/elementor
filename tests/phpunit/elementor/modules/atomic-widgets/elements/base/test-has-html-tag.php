<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Html_Tag;
use PHPUnit\Framework\TestCase;

class Html_Tag_Host_For_Test {
	use Has_Html_Tag;

	private static string $default_html_tag = 'div';

	public function __construct( string $default_html_tag = 'div' ) {
		self::$default_html_tag = $default_html_tag;
	}

	protected static function define_default_html_tag() {
		return self::$default_html_tag;
	}
}

class Html_Tag_Host_No_Link_For_Test {
	use Has_Html_Tag;

	protected static function define_default_html_tag() {
		return 'h2';
	}

	public static function get_computed_html_tag( array $settings ): string {
		$tag = static::extract_html_tag_value( $settings['tag'] ?? null );

		return ( null !== $tag && '' !== $tag ) ? $tag : static::define_default_html_tag();
	}
}

class Test_Has_Html_Tag extends TestCase {

	public function test_falls_back_to_default_html_tag() {
		new Html_Tag_Host_For_Test( 'button' );

		$this->assertSame( 'button', Html_Tag_Host_For_Test::get_computed_html_tag( [] ) );
	}

	public function test_prefers_settings_tag_over_default() {
		new Html_Tag_Host_For_Test( 'h2' );

		$this->assertSame( 'h3', Html_Tag_Host_For_Test::get_computed_html_tag( [ 'tag' => 'h3' ] ) );
	}

	public function test_uses_link_tag_when_href_is_present() {
		new Html_Tag_Host_For_Test( 'div' );

		$result = Html_Tag_Host_For_Test::get_computed_html_tag( [
			'tag' => 'div',
			'link' => [
				'href' => 'https://example.com',
				'tag' => 'a',
			],
		] );

		$this->assertSame( 'a', $result );
	}

	public function test_does_not_use_link_tag_without_href() {
		new Html_Tag_Host_For_Test( 'button' );

		$result = Html_Tag_Host_For_Test::get_computed_html_tag( [
			'link' => [
				'tag' => 'a',
			],
		] );

		$this->assertSame( 'button', $result );
	}

	public function test_element_can_override_to_ignore_link() {
		$result = Html_Tag_Host_No_Link_For_Test::get_computed_html_tag( [
			'tag' => 'h4',
			'link' => [
				'href' => 'https://example.com',
				'tag' => 'a',
			],
		] );

		$this->assertSame( 'h4', $result );
	}

	public function test_uses_link_tag_when_rendered_link_attributes_are_present() {
		new Html_Tag_Host_For_Test( 'div' );

		$result = Html_Tag_Host_For_Test::get_computed_html_tag( [
			'link' => [
				'tag' => 'a',
				'attributes' => 'href="https://example.com"',
			],
		] );

		$this->assertSame( 'a', $result );
	}

	public function test_reads_transformable_tag_envelope() {
		new Html_Tag_Host_For_Test( 'p' );

		$result = Html_Tag_Host_For_Test::get_computed_html_tag( [
			'tag' => [
				'$$type' => 'string',
				'value' => 'span',
			],
		] );

		$this->assertSame( 'span', $result );
	}
}
