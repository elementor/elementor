<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter;

use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters\Background_Converter;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters\Border_Radius_Converter;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters\Box_Shadow_Converter;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters\Color_Converter;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters\Dimensions_Converter;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters\Flex_Converter;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters\Number_Converter;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters\Size_Converter;
use Elementor\Modules\AtomicWidgets\Services\CssPropConverter\Converters\String_Converter;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Prop_Converter {

	private array $converters;
	private array $property_map;

	private function __construct() {
		$this->converters = [
			new Color_Converter(),
			new Size_Converter(),
			new Number_Converter(),
			new String_Converter(),
			new Dimensions_Converter(),
			new Border_Radius_Converter(),
			new Flex_Converter(),
			new Background_Converter(),
			new Box_Shadow_Converter(),
		];

		$this->property_map = $this->build_property_map( $this->converters );
	}

	public static function make(): self {
		return new self();
	}

	public function convert( string $css ): Conversion_Result {
		$declarations = Declaration_Classifier::make()->split( $css );

		$grouped = [];
		$unconverted_meta = [];
		$unconverted_decls = [];

		foreach ( $declarations as $declaration ) {
			$converter_index = $this->property_map[ $declaration['property'] ] ?? null;

			if ( null === $converter_index ) {
				$unconverted_decls[] = $declaration['property'] . ': ' . $declaration['value'] . ';';
				$unconverted_meta[] = [
					'declaration' => $declaration['property'] . ': ' . $declaration['value'],
					'hint' => 'Property is not in the typed-prop allowlist; rendered via custom_css.',
				];
				continue;
			}

			$grouped[ $converter_index ][] = $declaration;
		}

		$props = [];

		foreach ( $grouped as $converter_index => $batch ) {
			$result = $this->converters[ $converter_index ]->convert( $batch );

			foreach ( $result['props'] as $key => $shape ) {
				$props[ $key ] = $shape;
			}

			foreach ( $result['unconverted'] as $entry ) {
				$unconverted_meta[] = $entry;
				$unconverted_decls[] = $entry['declaration'] . ';';
			}
		}

		$custom_css = empty( $unconverted_decls )
			? ''
			: Utils::encode_string( implode( "\n", $unconverted_decls ) );

		return Conversion_Result::make( $props, $custom_css, $unconverted_meta );
	}

	private function build_property_map( array $converters ): array {
		$map = [];

		foreach ( $converters as $index => $converter ) {
			foreach ( $converter->get_supported_properties() as $property ) {
				$map[ $property ] = $index;
			}
		}

		return $map;
	}
}
