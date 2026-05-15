<?php


namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Transformers\Test_Video_Src_Transformer;

// NOTE: this mock should be used as the namespace resolver should pick this one up first
function wp_get_attachment_url( $attachment_id ) {
	return Test_Video_Src_Transformer::$mock_attachment_urls[ $attachment_id ] ?? false;
}

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Video_Src_Transformer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Video_Src_Transformer extends Elementor_Test_Base {

	public static array $mock_attachment_urls = [];

	private Video_Src_Transformer $transformer;

	public function setUp(): void {
		parent::setUp();
		$this->transformer = new Video_Src_Transformer();
		self::$mock_attachment_urls = [];
	}

	public function test_transform__returns_url_when_only_url_provided() {
		// Arrange.
		$value = [
			'id' => null,
			'url' => 'https://example.com/video.mp4',
		];

		// Act.
		$result = $this->transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( [
			'id' => null,
			'url' => 'https://example.com/video.mp4',
		], $result );
	}

	public function test_transform__returns_attachment_url_when_id_provided() {
		// Arrange.
		self::$mock_attachment_urls[123] = 'https://example.com/attachment-video.mp4';
		$value = [
			'id' => 123,
			'url' => null,
		];

		// Act.
		$result = $this->transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( [
			'id' => 123,
			'url' => 'https://example.com/attachment-video.mp4',
		], $result );
	}

	public function test_transform__id_takes_precedence_over_url() {
		// Arrange.
		self::$mock_attachment_urls[456] = 'https://example.com/resolved-video.mp4';
		$value = [
			'id' => 456,
			'url' => 'https://example.com/original-url.mp4',
		];

		// Act.
		$result = $this->transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( [
			'id' => 456,
			'url' => 'https://example.com/resolved-video.mp4',
		], $result );
	}

	public function test_transform__returns_null_values_when_empty() {
		// Arrange.
		$value = [];

		// Act.
		$result = $this->transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( [
			'id' => null,
			'url' => null,
		], $result );
	}

	public function test_transform__casts_id_to_integer() {
		// Arrange.
		self::$mock_attachment_urls[789] = 'https://example.com/video-789.mp4';
		$value = [
			'id' => '789',
			'url' => null,
		];

		// Act.
		$result = $this->transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertSame( 789, $result['id'] );
		$this->assertSame( 'https://example.com/video-789.mp4', $result['url'] );
	}
}
