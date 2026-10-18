<?php

use Elementor\Modules\DataFlow\Binding_Collector;
use Elementor\Modules\DataFlow\Binding_Locator;
use PHPUnit\Framework\TestCase;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\DataFlow
 */
class Test_Binding_Locator extends TestCase {
	const TOTAL = [ 'key' => 'total', 'format' => 'number', 'prefix' => '$', 'suffix' => '' ];
	const OPEN = [ 'key' => 'open', 'format' => 'raw', 'prefix' => '', 'suffix' => '' ];

	protected function setUp(): void {
		parent::setUp();

		Binding_Collector::begin();
	}

	protected function tearDown(): void {
		Binding_Collector::end();

		parent::tearDown();
	}

	private function locate( string $html ): string {
		return Binding_Locator::locate( $html, Binding_Collector::bindings() );
	}

	private function read_manifest( string $html ): array {
		preg_match_all( '/data-e-bind="([^"]*)"/', $html, $matches );

		return array_map( fn( $json ) => json_decode( html_entity_decode( $json ), true ), $matches[1] );
	}

	public function test_locate__returns_html_untouched_when_nothing_was_bound() {
		// Arrange
		$html = '<h2 class="x">Hello</h2>';

		// Act
		$result = $this->locate( $html );

		// Assert
		$this->assertSame( $html, $result );
	}

	public function test_locate__keeps_the_value_and_records_a_text_target_with_static_text_around_it() {
		// Arrange
		$html = '<h2>Total: ' . Binding_Collector::wrap( self::TOTAL, '$1,200' ) . ' due</h2>';

		// Act
		$result = $this->locate( $html );

		// Assert
		$this->assertStringStartsWith( '<h2 data-e-bind=', $result );
		$this->assertStringContainsString( '>Total: $1,200 due</h2>', $result );
		$this->assertSame(
			[ [ [ 'kind' => 'text', 'index' => 0, 'parts' => [ 'Total: ', self::TOTAL, ' due' ] ] ] ],
			$this->read_manifest( $result )
		);
	}

	public function test_locate__targets_the_element_that_directly_owns_the_text() {
		// Arrange
		$html = '<div><span>a</span><p>' . Binding_Collector::wrap( self::TOTAL, '5' ) . '</p></div>';

		// Act
		$result = $this->locate( $html );

		// Assert
		$this->assertStringContainsString( '<p data-e-bind=', $result );
		$this->assertStringStartsWith( '<div><span>a</span>', $result );
	}

	public function test_locate__records_an_attribute_target_for_any_attribute() {
		// Arrange
		$html = '<a href="https://x.test/' . Binding_Collector::wrap( self::TOTAL, 'p1' ) . '/go">Go</a>';

		// Act
		$result = $this->locate( $html );

		// Assert
		$this->assertStringContainsString( 'href="https://x.test/p1/go"', $result );
		$this->assertSame(
			[ [ [ 'kind' => 'attr', 'name' => 'href', 'parts' => [ 'https://x.test/', self::TOTAL, '/go' ] ] ] ],
			$this->read_manifest( $result )
		);
	}

	public function test_locate__turns_boolean_attributes_into_toggles_following_the_value() {
		// Arrange
		$on = '<div hidden="' . Binding_Collector::wrap( self::OPEN, 'true' ) . '">a</div>';
		$off = '<div hidden="' . Binding_Collector::wrap( self::OPEN, 'false' ) . '">a</div>';

		// Act
		$visible = $this->locate( $off );
		Binding_Collector::end();
		Binding_Collector::begin();
		$hidden = $this->locate( $on );

		// Assert
		$this->assertStringNotContainsString( 'hidden=', $visible );
		$this->assertMatchesRegularExpression( '/<div [^>]*hidden/', $hidden );
		$this->assertSame( 'toggle', $this->read_manifest( $visible )[0][0]['kind'] );
	}

	public function test_locate__handles_several_bindings_in_one_text_node_and_in_different_elements() {
		// Arrange
		$html = '<p>' . Binding_Collector::wrap( self::TOTAL, '1' ) . ' of ' . Binding_Collector::wrap( self::OPEN, '2' ) . '</p>'
			. '<img alt="' . Binding_Collector::wrap( self::OPEN, 'x' ) . '">';

		// Act
		$result = $this->locate( $html );

		// Assert
		$manifests = $this->read_manifest( $result );
		$this->assertCount( 2, $manifests );
		$this->assertSame( [ self::TOTAL, ' of ', self::OPEN ], $manifests[0][0]['parts'] );
		$this->assertSame( 'alt', $manifests[1][0]['name'] );
	}

	public function test_locate__counts_text_nodes_so_the_client_can_find_the_right_one() {
		// Arrange
		$html = '<p>lead<b>x</b>' . Binding_Collector::wrap( self::TOTAL, '9' ) . '</p>';

		// Act
		$result = $this->locate( $html );

		// Assert
		$this->assertSame( 1, $this->read_manifest( $result )[0][0]['index'] );
	}

	public function test_wrap__returns_plain_text_when_no_collector_is_active() {
		// Arrange
		Binding_Collector::end();

		// Act
		$result = Binding_Collector::wrap( self::TOTAL, '$1' );

		// Assert
		$this->assertSame( '$1', $result );
		Binding_Collector::begin();
	}
}
