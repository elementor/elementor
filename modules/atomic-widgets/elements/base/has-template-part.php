<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Base;

use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

trait Has_Template_Part {
	protected string $part = '';

	/** @var Style_Definition[] */
	protected array $style_definitions = [];

	public function part( string $part ) {
		$this->part = $part;
		return $this;
	}

	/**
	 * @param Style_Definition[] $style_definitions Merged into the element's single local style,
	 *                                              because the editor supports one local style per element.
	 */
	public function styles( array $style_definitions ) {
		$this->style_definitions = $style_definitions;
		return $this;
	}

	private function add_template_part( array $element_data ): array {
		if ( '' !== $this->part ) {
			$element_data[ Widget_Markers::PART_KEY ] = $this->part;
		}

		if ( empty( $this->style_definitions ) ) {
			return $element_data;
		}

		$style_id = Widget_Markers::get_template_local_style_id( $this->part );

		$element_data['styles'] = [ $style_id => $this->build_local_style( $style_id ) ];
		$element_data['settings'] = $this->add_class( $element_data['settings'], $style_id );

		return $element_data;
	}

	private function build_local_style( string $style_id ): array {
		$variants = [];

		foreach ( $this->style_definitions as $style_definition ) {
			$variants = array_merge( $variants, $style_definition->build( $style_id )['variants'] );
		}

		return [
			'id' => $style_id,
			'type' => Widget_Markers::LOCAL_STYLE_TYPE,
			'label' => Widget_Markers::LOCAL_STYLE_LABEL,
			'variants' => $variants,
		];
	}

	private function add_class( array $settings, string $style_id ): array {
		$classes = $settings['classes']['value'] ?? [];

		if ( ! in_array( $style_id, $classes, true ) ) {
			$classes[] = $style_id;
		}

		$settings['classes'] = Classes_Prop_Type::generate( $classes );

		return $settings;
	}
}
