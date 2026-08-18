<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Html_Tag;
use PHPUnit\Framework\TestCase;

class Html_Tag_Host_For_Test {
	use Has_Html_Tag;

	private string $default_html_tag;

	public function __construct( string $default_html_tag = 'div' ) {
		$this->default_html_tag = $default_html_tag;
	}

	protected function define_default_html_tag() {
		return $this->default_html_tag;
	}
}

class Html_Tag_Host_No_Link_For_Test {
	use Has_Html_Tag;

	protected function define_default_html_tag() {
		return 'h2';
	}

	public function get_computed_html_tag( array $settings ): string {
		$tag = static::extract_html_tag_value( $settings['tag'] ?? null );

		return ( null !== $tag && '' !== $tag ) ? $tag : $this->define_default_html_tag();
	}
}

class Test_Has_Html_Tag extends TestCase {

	public function test_falls_back_to_default_html_tag() {
		$host = new Html_Tag_Host_For_Test( 'button' );

		$this->assertSame( 'button', $host->get_computed_html_tag( [] ) );
	}

	public function test_prefers_settings_tag_over_default() {
		$host = new Html_Tag_Host_For_Test( 'h2' );

		$this->assertSame( 'h3', $host->get_computed_html_tag( [ 'tag' => 'h3' ] ) );
	}

	public function test_uses_link_tag_when_href_is_present() {
		$host = new Html_Tag_Host_For_Test( 'div' );

		$result = $host->get_computed_html_tag( [
			'tag' => 'div',
			'link' => [
				'href' => 'https://example.com',
				'tag' => 'a',
			],
		] );

		$this->assertSame( 'a', $result );
	}

	public function test_does_not_use_link_tag_without_href() {
		$host = new Html_Tag_Host_For_Test( 'button' );

		$result = $host->get_computed_html_tag( [
			'link' => [
				'tag' => 'a',
			],
		] );

		$this->assertSame( 'button', $result );
	}

	public function test_element_can_override_to_ignore_link() {
		$host = new Html_Tag_Host_No_Link_For_Test();

		$result = $host->get_computed_html_tag( [
			'tag' => 'h4',
			'link' => [
				'href' => 'https://example.com',
				'tag' => 'a',
			],
		] );

		$this->assertSame( 'h4', $result );
	}

	public function test_uses_link_tag_when_rendered_link_attributes_are_present() {
		$host = new Html_Tag_Host_For_Test( 'div' );

		$result = $host->get_computed_html_tag( [
			'link' => [
				'tag' => 'a',
				'attributes' => 'href="https://example.com"',
			],
		] );

		$this->assertSame( 'a', $result );
	}

	public function test_reads_transformable_tag_envelope() {
		$host = new Html_Tag_Host_For_Test( 'p' );

		$result = $host->get_computed_html_tag( [
			'tag' => [
				'$$type' => 'string',
				'value' => 'span',
			],
		] );

		$this->assertSame( 'span', $result );
	}
}
