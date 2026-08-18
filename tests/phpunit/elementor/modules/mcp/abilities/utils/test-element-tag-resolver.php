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

class Html_Tag_Resolver_Button_Fixture {
	public static function get_computed_html_tag( array $settings ): string {
		return 'button';
	}
}

class Html_Tag_Resolver_Img_Fixture {
	public static function get_computed_html_tag( array $settings ): string {
		return 'img';
	}
}

class Test_Element_Tag_Resolver extends TestCase {

	private function make_tag_prop_type( ?string $default_value ): Prop_Type {
		$prop_type = $this->createMock( Prop_Type::class );
		$prop_type->method( 'get_default' )->willReturn(
			null === $default_value ? null : [ '$$type' => 'string', 'value' => $default_value ]
		);

		return $prop_type;
	}

	public function test_delegates_to_element_instance() {
		$result = Element_Tag_Resolver::resolve( [ 'tag' => 'h2' ], [], new Html_Tag_Resolver_Button_Fixture() );

		$this->assertSame( 'button', $result );
	}

	public function test_filters_disallowed_tag_from_element_instance() {
		$result = Element_Tag_Resolver::resolve( [], [], new Html_Tag_Resolver_Img_Fixture() );

		$this->assertNull( $result );
	}

	public function test_falls_back_to_schema_default_when_instance_missing() {
		$schema = [ 'tag' => $this->make_tag_prop_type( 'h2' ) ];

		$this->assertSame( 'h2', Element_Tag_Resolver::resolve( [], $schema ) );
	}

	public function test_returns_null_when_instance_missing_and_schema_default_missing() {
		$schema = [ 'tag' => $this->make_tag_prop_type( null ) ];

		$this->assertNull( Element_Tag_Resolver::resolve( [], $schema ) );
	}

	public function test_returns_null_when_schema_has_no_tag_prop() {
		$this->assertNull( Element_Tag_Resolver::resolve( [], [] ) );
	}

	public function test_filters_disallowed_schema_default() {
		$schema = [ 'tag' => $this->make_tag_prop_type( 'script' ) ];

		$this->assertNull( Element_Tag_Resolver::resolve( [], $schema ) );
	}
}
