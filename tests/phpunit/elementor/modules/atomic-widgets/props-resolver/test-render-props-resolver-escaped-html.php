<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Escaped_Html_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;
use PHPUnit\Framework\TestCase;
use ReflectionMethod;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Render_Props_Resolver_Escaped_Html extends TestCase {

	public function setUp(): void {
		parent::setUp();

		Render_Props_Resolver::reset();
	}

	public function tearDown(): void {
		Render_Props_Resolver::reset();

		parent::tearDown();
	}

	public function test_resolve_item__sanitizes_plain_string_for_escaped_html_prop_type() {
		// Arrange.
		$resolver = Render_Props_Resolver::for_settings();
		$method = new ReflectionMethod( Render_Props_Resolver::class, 'resolve_item' );
		$method->setAccessible( true );
		$malicious_html = '<script>alert(1)</script><strong>Title</strong>';

		// Act.
		$result = $method->invoke(
			$resolver,
			$malicious_html,
			'title',
			Escaped_Html_Prop_Type::make()
		);

		// Assert.
		$this->assertSame( 'alert(1)<strong>Title</strong>', $result );
	}

	public function test_resolve_item__sanitizes_plain_string_for_escaped_html_union() {
		// Arrange.
		$resolver = Render_Props_Resolver::for_settings();
		$method = new ReflectionMethod( Render_Props_Resolver::class, 'resolve_item' );
		$method->setAccessible( true );
		$malicious_html = '<script>alert(1)</script><strong>Title</strong>';
		$title_prop_type = Union_Prop_Type::make()
			->add_prop_type( Escaped_Html_Prop_Type::make() )
			->add_prop_type( Dynamic_Prop_Type::make()->categories( [ 'text' ] ) );

		// Act.
		$result = $method->invoke(
			$resolver,
			$malicious_html,
			'title',
			$title_prop_type
		);

		// Assert.
		$this->assertSame( 'alert(1)<strong>Title</strong>', $result );
	}
}
