<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Svg_Src_Transformer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Svg_Src_Transformer extends Elementor_Test_Base {
	const SVG_MARKUP = '<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>';

	const NOT_FOUND_PAGE_WITH_SVG = '<html><body><h1>Not found</h1>' . self::SVG_MARKUP . '</body></html>';

	private Svg_Src_Transformer $transformer;

	public function setUp(): void {
		parent::setUp();

		$this->transformer = new Svg_Src_Transformer();
	}

	public function tearDown(): void {
		remove_all_filters( 'pre_http_request' );

		parent::tearDown();
	}

	public function test_transform__returns_empty_html_when_missing_local_file_responds_with_error_status() {
		// Arrange.
		$this->mock_http_response( \WP_Http::NOT_FOUND, self::NOT_FOUND_PAGE_WITH_SVG );
		$value = [ 'url' => site_url( '/wp-content/uploads/deleted-icon.svg' ) ];

		// Act.
		$result = $this->transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( '', $result['html'] );
		$this->assertSame( $value['url'], $result['url'] );
	}

	public function test_transform__returns_empty_html_when_remote_responds_with_error_status() {
		// Arrange.
		$this->mock_http_response( \WP_Http::NOT_FOUND, self::NOT_FOUND_PAGE_WITH_SVG );
		$value = [ 'url' => 'https://example.com/missing-icon.svg' ];

		// Act.
		$result = $this->transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( '', $result['html'] );
	}

	public function test_transform__returns_inline_svg_when_remote_responds_successfully() {
		// Arrange.
		$this->mock_http_response( \WP_Http::OK, self::SVG_MARKUP );
		$value = [ 'url' => 'https://example.com/icon.svg' ];

		// Act.
		$result = $this->transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertStringContainsString( '<svg', $result['html'] );
		$this->assertStringContainsString( 'fill="currentColor"', $result['html'] );
	}

	private function mock_http_response( int $status_code, string $body ): void {
		add_filter(
			'pre_http_request',
			function () use ( $status_code, $body ) {
				return [
					'headers' => [],
					'body' => $body,
					'response' => [
						'code' => $status_code,
						'message' => '',
					],
					'cookies' => [],
					'filename' => null,
				];
			}
		);
	}
}
