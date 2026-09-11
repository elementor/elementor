<?php

namespace Elementor\Modules\AtomicWidgets\ImportExport\Modifiers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Import_Export_Props_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Responsive_Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Settings_Variants_Props_Modifier {
	private Import_Export_Props_Resolver $props_resolver;

	private array $schema;

	public function __construct( Import_Export_Props_Resolver $props_resolver, array $schema ) {
		$this->props_resolver = $props_resolver;
		$this->schema = Responsive_Settings::filter_schema( $schema );
	}

	public static function make( Import_Export_Props_Resolver $props_resolver, array $schema ) {
		return new self( $props_resolver, $schema );
	}

	public function run( array $element ) {
		if ( empty( $element['settings_variants'] ) || ! is_array( $element['settings_variants'] ) ) {
			return $element;
		}

		if ( empty( $this->schema ) ) {
			return $element;
		}

		foreach ( $element['settings_variants'] as $variant_key => $variant ) {
			if ( empty( $variant['props'] ) || ! is_array( $variant['props'] ) ) {
				continue;
			}

			$element['settings_variants'][ $variant_key ]['props'] = $this->props_resolver->resolve(
				$this->schema,
				$variant['props']
			);
		}

		return $element;
	}
}
