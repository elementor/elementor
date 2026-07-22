<?php

namespace Elementor\Modules\AtomicWidgets\EnvelopeSerializers\Resolvers;

use Elementor\Modules\AtomicWidgets\EnvelopeSerializers\Envelope_Serializer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Identity_Envelope_Serializer extends Envelope_Serializer_Base {
	public function serialize( $envelope_value ) {
		if ( is_array( $envelope_value ) && array_key_exists( 'value', $envelope_value ) && isset( $envelope_value['$$type'] ) ) {
			return $envelope_value['value'];
		}

		return $envelope_value;
	}
}
