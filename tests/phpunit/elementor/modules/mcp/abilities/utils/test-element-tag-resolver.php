<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\Mcp\Abilities\Utils\Element_Tag_Resolver;
use PHPUnit\Framework\TestCase;

// The DB-less unit bootstrap autoloader assumes namespace<->path parity, but Elementor\Utils lives
// under `includes/utils.php`, so require it explicitly.
require_once dirname( rtrim( ABSPATH, '/' ), 2 ) . '/includes/utils.php';

class Test_Element_Tag_Resolver extends TestCase {

	private function make_tag_prop_type( ?string $default_value ): Prop_Type {
		$prop_type = $this->createMock( Prop_Type::class );
		$prop_type->method( 'get_default' )->willReturn(
			null === $default_value ? null : [ '$$type' => 'string', 'value' => $default_value ]
		);

		return $prop_type;
	}

	public function test_resolves_scalar_tag_from_settings() {
		// Arrange.
		$settings = [ 'tag' => 'h3' ];
		$schema = [ 'tag' => $this->make_tag_prop_type( 'h2' ) ];

		// Act.
		$result = Element_Tag_Resolver::resolve( $settings, $schema );

		// Assert.
		$this->assertSame( 'h3', $result );
	}

	public function test_resolves_transformable_tag_envelope_from_settings() {
		// Arrange: settings may still be in `{ $$type, value }` form when unresolved.
		$settings = [ 'tag' => [ '$$type' => 'string', 'value' => 'h4' ] ];
		$schema = [ 'tag' => $this->make_tag_prop_type( 'h2' ) ];

		// Act.
		$result = Element_Tag_Resolver::resolve( $settings, $schema );

		// Assert.
		$this->assertSame( 'h4', $result );
	}

	public function test_falls_back_to_schema_default_when_settings_missing_tag() {
		// Arrange.
		$settings = [];
		$schema = [ 'tag' => $this->make_tag_prop_type( 'h2' ) ];

		// Act.
		$result = Element_Tag_Resolver::resolve( $settings, $schema );

		// Assert.
		$this->assertSame( 'h2', $result );
	}

	public function test_returns_null_when_settings_and_schema_default_both_missing() {
		// Arrange.
		$settings = [];
		$schema = [ 'tag' => $this->make_tag_prop_type( null ) ];

		// Act.
		$result = Element_Tag_Resolver::resolve( $settings, $schema );

		// Assert.
		$this->assertNull( $result );
	}

	public function test_returns_null_when_resolved_tag_is_not_in_allowlist() {
		// Arrange: `script` is explicitly not part of ALLOWED_HTML_WRAPPER_TAGS.
		$settings = [ 'tag' => 'script' ];
		$schema = [ 'tag' => $this->make_tag_prop_type( 'h2' ) ];

		// Act.
		$result = Element_Tag_Resolver::resolve( $settings, $schema );

		// Assert.
		$this->assertNull( $result );
	}

	public function test_returns_null_when_schema_has_no_tag_prop() {
		// Arrange.
		$settings = [];
		$schema = [];

		// Act.
		$result = Element_Tag_Resolver::resolve( $settings, $schema );

		// Assert.
		$this->assertNull( $result );
	}

	public function test_ignores_empty_string_tag_in_settings() {
		// Arrange.
		$settings = [ 'tag' => '' ];
		$schema = [ 'tag' => $this->make_tag_prop_type( 'p' ) ];

		// Act.
		$result = Element_Tag_Resolver::resolve( $settings, $schema );

		// Assert.
		$this->assertSame( 'p', $result );
	}

	public function test_prefers_element_instance_over_schema() {
		// Arrange.
		$instance = $this->getMockBuilder( \stdClass::class )
			->addMethods( [ 'get_computed_html_tag' ] )
			->getMock();
		$instance->method( 'get_computed_html_tag' )->willReturn( 'button' );
		$settings = [ 'tag' => 'h2' ];
		$schema = [ 'tag' => $this->make_tag_prop_type( 'h2' ) ];

		// Act.
		$result = Element_Tag_Resolver::resolve( $settings, $schema, $instance );

		// Assert.
		$this->assertSame( 'button', $result );
	}

	public function test_filters_disallowed_tag_from_element_instance() {
		// Arrange.
		$instance = $this->getMockBuilder( \stdClass::class )
			->addMethods( [ 'get_computed_html_tag' ] )
			->getMock();
		$instance->method( 'get_computed_html_tag' )->willReturn( 'img' );

		// Act.
		$result = Element_Tag_Resolver::resolve( [], [], $instance );

		// Assert.
		$this->assertNull( $result );
	}
}
