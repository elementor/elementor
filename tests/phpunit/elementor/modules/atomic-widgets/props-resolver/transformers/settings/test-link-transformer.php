<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings\Link_Transformer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Link_Transformer extends Elementor_Test_Base {

	private const ALLOWED_HTTP_DESTINATION = 'https://example.com/welcome?a=1&b=2';

	private const ALLOWED_MAIL_DESTINATION = 'mailto:user@example.com';

	private const ALLOWED_RELATIVE_DESTINATION = '/welcome';

	private const ALLOWED_ANCHOR_DESTINATION = '#welcome';

	private const SAVED_CUSTOM_PROTOCOL_DESTINATION = 'whatsapp:send?phone=15551212';

	public function test_transform__keeps_allowed_destinations() {
		// Arrange.
		$transformer = new Link_Transformer();
		$destinations = [
			self::ALLOWED_HTTP_DESTINATION,
			self::ALLOWED_MAIL_DESTINATION,
			self::ALLOWED_RELATIVE_DESTINATION,
			self::ALLOWED_ANCHOR_DESTINATION,
		];

		foreach ( $destinations as $destination ) {
			// Act.
			$result = $transformer->transform( $this->link_value( $destination ), Props_Resolver_Context::make() );

			// Assert.
			$this->assertSame( $destination, $result['href'] );
		}
	}

	public function test_transform__keeps_saved_destination() {
		// Arrange.
		$transformer = new Link_Transformer();

		// Act.
		$result = $transformer->transform(
			$this->link_value( self::SAVED_CUSTOM_PROTOCOL_DESTINATION ),
			Props_Resolver_Context::make()
		);

		// Assert.
		$this->assertSame( self::SAVED_CUSTOM_PROTOCOL_DESTINATION, $result['href'] );
	}

	public function test_transform__resolves_numeric_post_destination_to_permalink() {
		// Arrange.
		$transformer = new Link_Transformer();
		$post_id = $this->factory()->post->create( [
			'post_status' => 'publish',
		] );

		// Act.
		$result = $transformer->transform(
			$this->link_value( (string) $post_id ),
			Props_Resolver_Context::make()
		);

		// Assert.
		$this->assertSame( get_permalink( $post_id ), $result['href'] );
	}

	private function link_value( string $destination ): array {
		return [
			'destination' => $destination,
			'isTargetBlank' => false,
			'tag' => 'a',
		];
	}
}
