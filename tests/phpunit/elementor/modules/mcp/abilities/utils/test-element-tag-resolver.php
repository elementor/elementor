<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\Mcp\Abilities\Utils\Element_Tag_Resolver;
use PHPUnit\Framework\TestCase;

require_once dirname( __DIR__, 7 ) . '/includes/utils.php';

class Html_Tag_Resolver_Button_Fixture {
	public static function get_computed_html_tag( array $settings ): string {
		return 'button';
	}
}

class Html_Tag_Resolver_Script_Fixture {
	public static function get_computed_html_tag( array $settings ): string {
		return 'script';
	}
}

class Test_Element_Tag_Resolver extends TestCase {

	public function test_delegates_to_element_class() {
		$result = Element_Tag_Resolver::resolve_for_class( [ 'tag' => 'h2' ], Html_Tag_Resolver_Button_Fixture::class );

		$this->assertSame( 'button', $result );
	}

	public function test_filters_disallowed_tag_from_element_class() {
		$result = Element_Tag_Resolver::resolve_for_class( [], Html_Tag_Resolver_Script_Fixture::class );

		$this->assertNull( $result );
	}

	public function test_returns_null_for_unknown_class() {
		$this->assertNull( Element_Tag_Resolver::resolve_for_class( [], null ) );
	}
}
