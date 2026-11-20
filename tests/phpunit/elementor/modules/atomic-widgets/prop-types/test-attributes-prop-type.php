<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Attributes_Prop_Type extends Elementor_Test_Base {

	public function test_sanitize__keeps_supported_names() {
		// Arrange.
		$value = $this->make_attributes( [
			'role' => 'button',
			'data-id' => '5',
			'aria-label' => 'Open menu',
		] );

		// Act.
		$result = Attributes_Prop_Type::make()->sanitize( $value );

		// Assert.
		$this->assertSame( [ 'role', 'data-id', 'aria-label' ], $this->get_keys( $result ) );
	}

	/**
	 * @dataProvider unsupported_names_provider
	 */
	public function test_sanitize__drops_unsupported_names( $name ) {
		// Arrange.
		$value = $this->make_attributes( [
			$name => 'a',
			'role' => 'button',
		] );

		// Act.
		$result = Attributes_Prop_Type::make()->sanitize( $value );

		// Assert.
		$this->assertSame( [ 'role' ], $this->get_keys( $result ) );
	}

	public function unsupported_names_provider(): array {
		return [
			'event handler' => [ 'onclick' ],
			'event handler uppercase' => [ 'ONCLICK' ],
			'event handler with long name' => [ 'onpointerdown' ],
			'event handler with leading name' => [ 'x onclick' ],
			'x- directive' => [ 'x-init' ],
			'x- directive uppercase' => [ 'X-DATA' ],
			'name with quote' => [ 'a"b' ],
			'name with slash' => [ 'a/b' ],
			'name with trailing newline' => [ "role\n" ],
			'name with inner newline' => [ "ro\nle" ],
		];
	}

	public function test_sanitize__removes_unsupported_url_schemes_from_url_values() {
		// Arrange.
		$value = $this->make_attributes( [
			'href' => 'custom-scheme:page',
			'formaction' => 'https://example.com/page',
			'title' => 'custom-scheme:page',
		] );

		// Act.
		$result = Attributes_Prop_Type::make()->sanitize( $value );

		// Assert.
		$this->assertSame( [
			'href' => 'page',
			'formaction' => 'https://example.com/page',
			'title' => 'custom-scheme:page',
		], $this->get_pairs( $result ) );
	}

	public function test_sanitize__keeps_supported_names_and_cleans_values_for_users_without_unfiltered_html() {
		// Arrange.
		$this->act_as( 'contributor' );
		$value = $this->make_attributes( [
			'role' => 'button',
			'href' => 'custom-scheme:page',
			'onclick' => 'a',
			'x-init' => 'a',
		] );

		// Act.
		$result = Attributes_Prop_Type::make()->sanitize( $value );

		// Assert.
		$this->assertSame( [
			'role' => 'button',
			'href' => 'page',
		], $this->get_pairs( $result ) );
	}

	public function test_sanitize__keeps_attributes_for_users_with_unfiltered_html() {
		// Arrange.
		$this->act_as_admin_or_network_admin();
		$value = $this->make_attributes( [
			'role' => 'button',
			'href' => 'https://example.com',
		] );

		// Act.
		$result = Attributes_Prop_Type::make()->sanitize( $value );

		// Assert.
		$this->assertSame( [ 'role', 'href' ], $this->get_keys( $result ) );
	}

	public function test_sanitize__keeps_prefixed_names_for_users_with_unfiltered_html() {
		// Arrange.
		$this->act_as_admin_or_network_admin();
		$value = $this->make_attributes( [
			'onclick' => 'a',
			'x-init' => 'a',
			'x onclick' => 'a',
			'role' => 'button',
		] );

		// Act.
		$result = Attributes_Prop_Type::make()->sanitize( $value );

		// Assert.
		$this->assertSame( [ 'onclick', 'x-init', 'role' ], $this->get_keys( $result ) );
	}

	/**
	 * @dataProvider saved_attributes_by_role_provider
	 */
	public function test_sanitize__saves_attributes_according_to_the_saving_user( string $role, array $expected ) {
		// Arrange.
		if ( 'administrator' === $role ) {
			$this->act_as_admin_or_network_admin();
		} else {
			$this->act_as( $role );
		}

		$value = $this->make_attributes( [
			'role' => 'button',
			'data-id' => '5',
			'only-mobile' => 'true',
			'onclick' => 'a',
			'ONMOUSEOVER' => 'a',
			'x-init' => 'a',
			'X-Data' => 'a',
			'x onclick' => 'a',
			'href' => "custom\t-scheme:page",
			'action' => 'Custom-Scheme&colon;page',
			'formaction' => 'custom-scheme:page',
			'src' => 'https://example.com/image.png',
			'srcdoc' => '<p>kept</p><iframe></iframe>',
			'title' => 'a"b',
		] );

		// Act.
		$result = Attributes_Prop_Type::make()->sanitize( $value );

		// Assert.
		$this->assertSame( $expected, $this->get_pairs( $result ) );
	}

	public function saved_attributes_by_role_provider(): array {
		$supported_names = [
			'role' => 'button',
			'data-id' => '5',
			'only-mobile' => 'true',
		];

		$prefixed_names = [
			'onclick' => 'a',
			'ONMOUSEOVER' => 'a',
			'x-init' => 'a',
			'X-Data' => 'a',
		];

		$cleaned_url_values = [
			'href' => 'page',
			'action' => 'page',
			'formaction' => 'page',
			'src' => 'https://example.com/image.png',
		];

		$inline_document = [
			'srcdoc' => 'kept',
		];

		$escaped_values = [
			'title' => 'a&quot;b',
		];

		$limited = array_merge( $supported_names, $cleaned_url_values, $escaped_values );
		$full = array_merge( $supported_names, $prefixed_names, $cleaned_url_values, $inline_document, $escaped_values );

		return [
			'administrator' => [ 'administrator', $full ],
			'author' => [ 'author', $limited ],
			'contributor' => [ 'contributor', $limited ],
		];
	}

	private function get_pairs( array $sanitized ): array {
		$pairs = [];

		foreach ( $sanitized['value'] as $item ) {
			$pairs[ $item['value']['key']['value'] ] = $item['value']['value']['value'];
		}

		return $pairs;
	}

	private function make_attributes( array $pairs ): array {
		$items = [];

		foreach ( $pairs as $key => $value ) {
			$items[] = Key_Value_Prop_Type::generate( [
				'key' => String_Prop_Type::generate( (string) $key ),
				'value' => String_Prop_Type::generate( $value ),
			] );
		}

		return Attributes_Prop_Type::generate( $items );
	}

	private function get_keys( array $sanitized ): array {
		return array_map(
			fn( $item ) => $item['value']['key']['value'],
			$sanitized['value']
		);
	}
}
