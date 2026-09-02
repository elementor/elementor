<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Svg_Src_Transformer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @group props-resolver
 */
class Test_Svg_Src_Transformer extends Elementor_Test_Base {

	const SVG_URL = 'https://not-a-real-site.test/icon.svg';
	const SVG_CONTENT = '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h100v100H0z"/></svg>';

	private Svg_Src_Transformer $transformer;

	public function setUp(): void {
		parent::setUp();

		$this->transformer = new Svg_Src_Transformer();
	}

	public function tearDown(): void {
		remove_all_filters( 'pre_http_request' );

		parent::tearDown();
	}

	public function test_transform__inlines_the_svg_content_of_a_remote_svg() {
		// Arrange.
		$this->mock_http_response( 'image/svg+xml', self::SVG_CONTENT );

		// Act.
		$result = $this->transformer->transform(
			[ 'id' => null, 'url' => self::SVG_URL ],
			Props_Resolver_Context::make()
		);

		// Assert.
		$this->assertSame( self::SVG_URL, $result['url'] );
		$this->assertStringContainsString( '<svg', $result['html'] );
		$this->assertStringContainsString( 'fill="currentColor"', $result['html'] );
	}

	public function test_transform__does_not_inline_a_response_that_is_not_an_svg() {
		// Arrange.
		$this->mock_http_response( 'image/jpeg', 'not-an-svg' );

		// Act.
		$result = $this->transformer->transform(
			[ 'id' => null, 'url' => self::SVG_URL ],
			Props_Resolver_Context::make()
		);

		// Assert.
		$this->assertSame( '', $result['html'] );
		$this->assertSame( self::SVG_URL, $result['url'] );
	}

	public function test_transform__does_not_inline_an_attachment_that_is_not_an_svg() {
		// Arrange.
		$attachment_id = $this->factory()->post->create( [
			'post_type' => 'attachment',
			'post_mime_type' => 'image/jpeg',
		] );

		$this->mock_http_response( 'image/jpeg', 'not-an-svg' );

		// Act.
		$result = $this->transformer->transform(
			[ 'id' => $attachment_id, 'url' => null ],
			Props_Resolver_Context::make()
		);

		// Assert.
		$this->assertSame( '', $result['html'] );
	}

	private function mock_http_response( string $content_type, string $body ) {
		add_filter( 'pre_http_request', function () use ( $content_type, $body ) {
			return [
				'body' => $body,
				'headers' => [ 'content-type' => $content_type ],
				'response' => [ 'code' => 200, 'message' => 'OK' ],
			];
		} );
	}
}
