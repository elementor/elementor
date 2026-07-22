<?php

namespace Elementor\Modules\AtomicWidgets\EnvelopeSerializers\Resolvers;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Prop_Type;
use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use Elementor\Modules\AtomicWidgets\EnvelopeSerializers\Envelope_Serializer_Base;
use Elementor\Modules\AtomicWidgets\EnvelopeSerializers\Envelope_Values_Serializer;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Dynamic_Envelope_Serializer extends Envelope_Serializer_Base {
	const OMITTED_SETTING_KEYS = [ 'fallback' ];

	private ?Envelope_Values_Serializer $walker;

	public function __construct( ?Envelope_Values_Serializer $walker = null ) {
		$this->walker = $walker;
	}

	public function set_walker( Envelope_Values_Serializer $walker ): void {
		$this->walker = $walker;
	}

	public function serialize( $envelope_value ) {
		if ( ! is_array( $envelope_value ) ) {
			return null;
		}

		if ( isset( $envelope_value['$$type'] ) && Dynamic_Prop_Type::get_key() === $envelope_value['$$type'] ) {
			$envelope_value = $envelope_value['value'] ?? [];
		}

		if ( ! is_array( $envelope_value ) || ! isset( $envelope_value['name'] ) ) {
			return null;
		}

		$name = (string) $envelope_value['name'];
		$tag = $name ? Dynamic_Tags_Module::instance()->registry->get_tag( $name ) : null;
		$settings_envelope = $envelope_value['settings'] ?? [];

		$plain = [
			'name' => $tag['name'] ?? $name,
		];

		if ( ! $tag || ! $this->walker ) {
			$plain['settings'] = is_array( $settings_envelope ) ? $settings_envelope : [];

			return $plain;
		}

		$plain['settings'] = $this->serialize_settings(
			$tag['props_schema'] ?? [],
			is_array( $settings_envelope ) ? $settings_envelope : []
		);

		return $plain;
	}

	private function serialize_settings( array $props_schema, array $settings ): array {
		$plain = [];

		foreach ( $props_schema as $key => $prop_type ) {
			if ( in_array( $key, self::OMITTED_SETTING_KEYS, true ) ) {
				continue;
			}

			if ( ! $prop_type instanceof Prop_Type || ! array_key_exists( $key, $settings ) ) {
				continue;
			}

			$serialized = $this->walker->serialize( $settings[ $key ], $prop_type );

			if ( null !== $serialized ) {
				$plain[ $key ] = $serialized;
			}
		}

		return $plain;
	}
}
