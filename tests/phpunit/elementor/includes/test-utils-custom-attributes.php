<?php
namespace Elementor\Testing\Includes;

use Elementor\Utils;
use ElementorEditorTesting\Elementor_Test_Base;

class Elementor_Test_Utils_Custom_Attributes extends Elementor_Test_Base {

	/**
	 * @dataProvider supported_attribute_names_provider
	 */
	public function test_is_allowed_custom_attribute_name__supported_names( $name ) {
		// Act.
		$result = Utils::is_allowed_custom_attribute_name( $name );

		// Assert.
		$this->assertTrue( $result );
	}

	public function supported_attribute_names_provider(): array {
		return [
			'data attribute' => [ 'data-id' ],
			'aria attribute' => [ 'aria-label' ],
			'role' => [ 'role' ],
			'tabindex' => [ 'tabindex' ],
			'title' => [ 'title' ],
			'rel' => [ 'rel' ],
			'target' => [ 'target' ],
			'style' => [ 'style' ],
			'download' => [ 'download' ],
			'itemprop' => [ 'itemprop' ],
			'data prefixed src' => [ 'data-src' ],
			'data prefixed x' => [ 'data-x-init' ],
			'underscore' => [ 'my_attr' ],
			'single x' => [ 'x' ],
			'x without dash' => [ 'xdata' ],
			'href' => [ 'href' ],
			'src' => [ 'src' ],
			'action' => [ 'action' ],
			'formaction' => [ 'formaction' ],
			'on with dash' => [ 'only-mobile' ],
			'on with dash uppercase' => [ 'ONLINE-STATUS' ],
			'on with underscore' => [ 'online_status' ],
			'on with digit' => [ 'on2' ],
		];
	}

	/**
	 * @dataProvider unsupported_attribute_names_provider
	 */
	public function test_is_allowed_custom_attribute_name__unsupported_names( $name ) {
		// Act.
		$result = Utils::is_allowed_custom_attribute_name( $name );

		// Assert.
		$this->assertFalse( $result );
	}

	public function unsupported_attribute_names_provider(): array {
		return [
			'empty' => [ '' ],
			'null' => [ null ],
			'array' => [ [ 'role' ] ],
			'number' => [ 5 ],
			'event handler' => [ 'onclick' ],
			'event handler uppercase' => [ 'ONCLICK' ],
			'event handler mixed case' => [ 'OnClick' ],
			'event handler with leading name' => [ 'x onclick' ],
			'event handler with trailing space' => [ 'onclick ' ],
			'event handler with long name' => [ 'onpointerdown' ],
			'bare on' => [ 'on' ],
			'x- directive' => [ 'x-init' ],
			'x- directive uppercase' => [ 'X-DATA' ],
			'x- bare prefix' => [ 'x-' ],
			'x- modifier syntax' => [ 'x-on:click' ],
			'inline document' => [ 'srcdoc' ],
			'inline document uppercase' => [ 'SRCDOC' ],
			'shorthand at sign' => [ '@click' ],
			'shorthand colon' => [ ':src' ],
			'namespaced' => [ 'xlink:href' ],
			'double quote' => [ 'a"b' ],
			'single quote' => [ "a'b" ],
			'slash' => [ 'a/b' ],
			'equals' => [ 'a=b' ],
			'angle bracket' => [ 'a>b' ],
			'inner space' => [ 'a b' ],
			'trailing newline' => [ "role\n" ],
			'inner newline' => [ "ro\nle" ],
			'leading newline' => [ "\nrole" ],
			'tab' => [ "ro\tle" ],
			'null byte' => [ "role\0" ],
			'non ascii' => [ 'rôle' ],
			'event handler with trailing newline' => [ "onclick\n" ],
		];
	}

	/**
	 * @dataProvider prefixed_attribute_names_provider
	 */
	public function test_is_allowed_custom_attribute_name__allows_prefixed_names_when_unfiltered_names_are_allowed( $name ) {
		// Act.
		$result = Utils::is_allowed_custom_attribute_name( $name, true );

		// Assert.
		$this->assertTrue( $result );
	}

	public function prefixed_attribute_names_provider(): array {
		return [
			'on prefix' => [ 'onclick' ],
			'on prefix uppercase' => [ 'ONCLICK' ],
			'x- prefix' => [ 'x-init' ],
			'x- prefix uppercase' => [ 'X-DATA' ],
			'inline document' => [ 'srcdoc' ],
		];
	}

	/**
	 * @dataProvider malformed_attribute_names_provider
	 */
	public function test_is_allowed_custom_attribute_name__rejects_malformed_names_when_unfiltered_names_are_allowed( $name ) {
		// Act.
		$result = Utils::is_allowed_custom_attribute_name( $name, true );

		// Assert.
		$this->assertFalse( $result );
	}

	public function malformed_attribute_names_provider(): array {
		return [
			'name with leading name' => [ 'x onclick' ],
			'double quote' => [ 'a"b' ],
			'trailing newline' => [ "onclick\n" ],
			'modifier syntax' => [ 'x-on:click' ],
		];
	}

	public function test_sanitize_custom_attributes_string__keeps_prefixed_names_when_unfiltered_names_are_allowed() {
		// Arrange.
		$attributes = 'onclick="a" x-init="a" role="button"';

		// Act.
		$result = Utils::sanitize_custom_attributes_string( $attributes, true );

		// Assert.
		$this->assertSame( $attributes, $result );
	}

	public function test_sanitize_custom_attributes_string__keeps_supported_pairs() {
		// Arrange.
		$attributes = 'role="button" data-id="5" aria-label="Open menu"';

		// Act.
		$result = Utils::sanitize_custom_attributes_string( $attributes );

		// Assert.
		$this->assertSame( $attributes, $result );
	}

	public function test_sanitize_custom_attributes_string__drops_unsupported_names() {
		// Arrange.
		$attributes = implode( ' ', [
			'onclick="a"',
			'ONMOUSEOVER="a"',
			'role="button"',
			'x-init="a"',
			'X-Data="a"',
			'title="Hello"',
		] );

		// Act.
		$result = Utils::sanitize_custom_attributes_string( $attributes );

		// Assert.
		$this->assertSame( 'role="button" title="Hello"', $result );
	}

	public function test_sanitize_custom_attributes_string__drops_unsupported_name_preceded_by_other_name() {
		// Act.
		$result = Utils::sanitize_custom_attributes_string( 'x onclick="a" role="button"' );

		// Assert.
		$this->assertSame( 'role="button"', $result );
	}

	public function test_sanitize_custom_attributes_string__supports_single_quoted_values() {
		// Act.
		$result = Utils::sanitize_custom_attributes_string( "role='button' x-init='a'" );

		// Assert.
		$this->assertSame( 'role="button"', $result );
	}

	public function test_sanitize_custom_attributes_string__does_not_double_escape_values() {
		// Act.
		$result = Utils::sanitize_custom_attributes_string( 'title="Tom &amp; Jerry"' );

		// Assert.
		$this->assertSame( 'title="Tom &amp; Jerry"', $result );
	}

	public function test_sanitize_custom_attributes_string__escapes_quotes_in_values() {
		// Act.
		$result = Utils::sanitize_custom_attributes_string( 'title="say &quot;hi&quot;"' );

		// Assert.
		$this->assertSame( 'title="say &quot;hi&quot;"', $result );
	}

	/**
	 * @dataProvider unsupported_url_scheme_values_provider
	 */
	public function test_sanitize_custom_attributes_string__removes_unsupported_url_schemes( $name, $value ) {
		// Act.
		$result = Utils::sanitize_custom_attributes_string( $name . '="' . $value . '"' );

		// Assert.
		$this->assertSame( $name . '="page"', $result );
	}

	public function unsupported_url_scheme_values_provider(): array {
		return [
			'href' => [ 'href', 'custom-scheme:page' ],
			'src' => [ 'src', 'custom-scheme:page' ],
			'action' => [ 'action', 'custom-scheme:page' ],
			'formaction' => [ 'formaction', 'custom-scheme:page' ],
			'uppercase name' => [ 'HREF', 'custom-scheme:page' ],
			'mixed case scheme' => [ 'href', 'Custom-Scheme:page' ],
			'scheme with tab' => [ 'href', "custom-\tscheme:page" ],
			'scheme with leading space' => [ 'href', ' custom-scheme:page' ],
			'encoded colon' => [ 'href', 'custom-scheme&#58;page' ],
			'named colon entity' => [ 'href', 'custom-scheme&colon;page' ],
			'repeated scheme' => [ 'href', 'custom-scheme:custom-scheme:page' ],
		];
	}

	/**
	 * @dataProvider supported_url_values_provider
	 */
	public function test_sanitize_custom_attributes_string__keeps_supported_urls( $value ) {
		// Arrange.
		$attributes = 'href="' . $value . '"';

		// Act.
		$result = Utils::sanitize_custom_attributes_string( $attributes );

		// Assert.
		$this->assertSame( $attributes, $result );
	}

	public function supported_url_values_provider(): array {
		return [
			'https' => [ 'https://example.com/page?a=1' ],
			'mailto' => [ 'mailto:hello@example.com' ],
			'tel' => [ 'tel:+123456789' ],
			'relative path' => [ '/about' ],
			'anchor' => [ '#contact' ],
		];
	}

	public function test_sanitize_custom_attributes_string__keeps_scheme_like_text_in_non_url_attributes() {
		// Arrange.
		$attributes = 'title="custom-scheme:page"';

		// Act.
		$result = Utils::sanitize_custom_attributes_string( $attributes );

		// Assert.
		$this->assertSame( $attributes, $result );
	}

	public function test_sanitize_custom_attributes_string__keeps_only_post_html_in_srcdoc() {
		// Arrange.
		$srcdoc = esc_attr( '<p class="intro" onmouseup="a">Hello</p><iframe src="/page"></iframe>' );

		// Act.
		$result = Utils::sanitize_custom_attributes_string( 'srcdoc="' . $srcdoc . '"', true );

		// Assert.
		$this->assertSame( 'srcdoc="' . esc_attr( '<p class="intro">Hello</p>' ) . '"', $result );
	}

	public function test_sanitize_custom_attributes_string__drops_srcdoc_when_unfiltered_names_are_not_allowed() {
		// Act.
		$result = Utils::sanitize_custom_attributes_string( 'srcdoc="Hello" role="button"' );

		// Assert.
		$this->assertSame( 'role="button"', $result );
	}

	/**
	 * @dataProvider encoded_srcdoc_markup_provider
	 */
	public function test_sanitize_custom_attributes_string__keeps_encoded_markup_in_srcdoc_as_text( $stored_value ) {
		// Act.
		$result = Utils::sanitize_custom_attributes_string( 'srcdoc="' . $stored_value . '"', true );

		// Assert.
		$this->assertStringNotContainsString( '<', $this->get_value_as_read_by_the_browser( $result ) );
	}

	public function encoded_srcdoc_markup_provider(): array {
		return [
			'encoded twice' => [ '&amp;lt;p&amp;gt;Hello&amp;lt;/p&amp;gt;' ],
			'encoded three times' => [ '&amp;amp;lt;p&amp;amp;gt;Hello&amp;amp;lt;/p&amp;amp;gt;' ],
			'numeric entities encoded twice' => [ '&amp;#60;p&amp;#62;Hello' ],
		];
	}

	public function test_sanitize_custom_attributes_string__drops_pairs_without_quoted_values() {
		// Act.
		$result = Utils::sanitize_custom_attributes_string( 'role=button data-id="5"' );

		// Assert.
		$this->assertSame( 'data-id="5"', $result );
	}

	/**
	 * @dataProvider empty_attribute_strings_provider
	 */
	public function test_sanitize_custom_attributes_string__returns_empty_string( $value ) {
		// Act.
		$result = Utils::sanitize_custom_attributes_string( $value );

		// Assert.
		$this->assertSame( '', $result );
	}

	public function empty_attribute_strings_provider(): array {
		return [
			'empty string' => [ '' ],
			'null' => [ null ],
			'array' => [ [ 'role="button"' ] ],
		];
	}

	private function get_value_as_read_by_the_browser( string $printed_pair ): string {
		preg_match( '/^[a-zA-Z0-9_-]+="(.*)"$/s', $printed_pair, $match );

		return html_entity_decode( $match[1] ?? '', ENT_QUOTES | ENT_HTML5, 'UTF-8' );
	}

	public function test_parse_custom_attributes__keeps_names_that_are_not_event_handlers_or_href() {
		// Act.
		$result = Utils::parse_custom_attributes( "src|a\nx-data|b\nonclick|c\nhref|d\nrole|e", "\n" );

		// Assert.
		$this->assertSame( [
			'src' => 'a',
			'x-data' => 'b',
			'role' => 'e',
		], $result );
	}
}
