<?php

namespace Elementor\Testing\Modules\AtomicWidgets\EnvelopeSerializers;

use Elementor\Modules\AtomicWidgets\EnvelopeSerializers\Resolvers\Identity_Envelope_Serializer;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Leaf_Envelope_Serializers extends TestCase {

	public function test_identity_serializer__unwraps_envelope() {
		$serializer = new Identity_Envelope_Serializer();

		$this->assertSame(
			'hello',
			$serializer->serialize(
				[
					'$$type' => 'string',
					'value' => 'hello',
				]
			)
		);
	}

	public function test_identity_serializer__passes_through_plain_value() {
		$serializer = new Identity_Envelope_Serializer();

		$this->assertSame( 'plain', $serializer->serialize( 'plain' ) );
	}
}
