<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Components\Webmcp\Business_Schema_Parser;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Business_Schema_Parser extends Elementor_Test_Base {

	private Business_Schema_Parser $parser;

	public function setUp(): void {
		parent::setUp();

		$this->parser = new Business_Schema_Parser( new Prompt_Injection_Sanitizer() );
	}

	public function test_parse__extracts_business_details_from_graph() {
		// Arrange
		$html = $this->wrap_json_ld( [
			'@context' => 'https://schema.org',
			'@graph' => [
				[ '@type' => 'WebSite', 'name' => 'Ignored site node' ],
				[
					'@type' => [ 'Organization', 'LocalBusiness' ],
					'name' => 'Corner Bakery',
					'telephone' => '+1 555 0100',
					'email' => 'mailto:hello@example.com',
					'address' => [
						'@type' => 'PostalAddress',
						'streetAddress' => '1 Main St',
						'addressLocality' => 'Springfield',
						'unknown' => 'dropped',
					],
					'openingHoursSpecification' => [
						[
							'dayOfWeek' => [ 'https://schema.org/Monday', 'Tuesday' ],
							'opens' => '08:00',
							'closes' => '17:00',
						],
					],
					'sameAs' => [ 'https://facebook.com/bakery', 'javascript:alert(1)' ],
				],
			],
		] );

		// Act
		$info = $this->parser->parse( $html );

		// Assert
		$this->assertSame( 'Corner Bakery', $info['name'] );
		$this->assertSame( '+1 555 0100', $info['telephone'] );
		$this->assertSame( 'hello@example.com', $info['email'] );
		$this->assertSame(
			[ 'streetAddress' => '1 Main St', 'addressLocality' => 'Springfield' ],
			$info['address']
		);
		$this->assertSame( [ 'Monday, Tuesday 08:00-17:00' ], $info['opening_hours'] );
		$this->assertSame( [ 'https://facebook.com/bakery' ], $info['social_profiles'] );
	}

	public function test_parse__returns_empty_for_pages_without_business_schema() {
		// Arrange
		$html = $this->wrap_json_ld( [ '@type' => 'WebSite', 'name' => 'Only a website' ] );

		// Act & Assert
		$this->assertSame( [], $this->parser->parse( $html ) );
	}

	public function test_parse__ignores_malformed_json() {
		// Arrange
		$html = '<script type="application/ld+json">{ not json</script>';

		// Act & Assert
		$this->assertSame( [], $this->parser->parse( $html ) );
	}

	public function test_parse__returns_text_address_in_the_structured_shape() {
		// Arrange
		$html = $this->wrap_json_ld( [
			'@type' => 'LocalBusiness',
			'address' => '1 Main St, Springfield',
		] );

		// Act
		$info = $this->parser->parse( $html );

		// Assert
		$this->assertSame( [ 'streetAddress' => '1 Main St, Springfield' ], $info['address'] );
	}

	public function test_parse__strips_markup_from_text_fields() {
		// Arrange
		$html = $this->wrap_json_ld( [
			'@type' => 'LocalBusiness',
			'name' => '<b>Bold</b> Name',
		] );

		// Act
		$info = $this->parser->parse( $html );

		// Assert
		$this->assertSame( 'Bold Name', $info['name'] );
	}

	private function wrap_json_ld( array $document ): string {
		return '<html><head><script type="application/ld+json">' . wp_json_encode( $document ) . '</script></head></html>';
	}
}
