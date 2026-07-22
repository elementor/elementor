<?php

namespace Elementor\Modules\AtomicWidgets\EnvelopeSerializers\Resolvers;

use Elementor\Modules\AtomicWidgets\EnvelopeSerializers\Envelope_Serializer_Base;
use Elementor\Modules\AtomicWidgets\EnvelopeSerializers\Envelope_Values_Serializer;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Html_V3_Envelope_Serializer extends Envelope_Serializer_Base {
	private Envelope_Values_Serializer $walker;

	public function __construct( Envelope_Values_Serializer $walker ) {
		$this->walker = $walker;
	}

	public function serialize( $envelope_value ) {
		if ( ! is_array( $envelope_value ) ) {
			return null;
		}

		if ( isset( $envelope_value['$$type'] ) && Html_V3_Prop_Type::get_key() === $envelope_value['$$type'] ) {
			$envelope_value = $envelope_value['value'] ?? [];
		}

		if ( ! is_array( $envelope_value ) ) {
			return null;
		}

		$plain = [];

		if ( array_key_exists( 'content', $envelope_value ) ) {
			$plain['content'] = $this->walker->serialize(
				$envelope_value['content'],
				String_Prop_Type::make()
			);
		}

		if ( array_key_exists( 'children', $envelope_value ) ) {
			if ( ! is_array( $envelope_value['children'] ) ) {
				return null;
			}

			$plain['children'] = $envelope_value['children'];
		}

		return empty( $plain ) ? null : $plain;
	}
}
