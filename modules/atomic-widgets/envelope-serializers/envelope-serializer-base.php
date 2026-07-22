<?php

namespace Elementor\Modules\AtomicWidgets\EnvelopeSerializers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Envelope_Serializer_Base {
	abstract public function serialize( $envelope_value );
}
