<?php

namespace Elementor\Modules\AtomicWidgets\ImportExport\Modifiers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Import_Export_Props_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Interactions_Props_Modifier {
	private Import_Export_Props_Resolver $props_resolver;

	private array $schema;

	public function __construct( Import_Export_Props_Resolver $props_resolver, array $schema ) {
		$this->props_resolver = $props_resolver;
		$this->schema = $schema;
	}

	public static function make( Import_Export_Props_Resolver $props_resolver, array $schema ) {
		return new self( $props_resolver, $schema );
	}

	public function run( array $element ) {
		if ( ! isset( $element['interactions'] ) ) {
			return $element;
		}

		$interactions = $element['interactions'];
		if ( is_string( $interactions ) ) {
			$decoded = json_decode( $interactions, true );
			if ( json_last_error() !== JSON_ERROR_NONE || ! is_array( $decoded ) ) {
				return $element;
			}
			$interactions = $decoded;
		}

		if ( empty( $interactions['items'] ) || ! is_array( $interactions['items'] ) ) {
			return $element;
		}

		foreach ( $interactions['items'] as $index => $item ) {
			if ( ! is_array( $item ) || empty( $item['$$type'] ) || ! array_key_exists( 'value', $item ) || ! is_array( $item['value'] ) ) {
				continue;
			}

			$interactions['items'][ $index ]['value'] = $this->props_resolver->resolve(
				$this->schema,
				$item['value']
			);
		}

		$element['interactions'] = $interactions;

		return $element;
	}
}
