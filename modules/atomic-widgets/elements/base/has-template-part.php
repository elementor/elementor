<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Base;

use Elementor\Core\Utils\Template_Library_Import_Export_Utils;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

trait Has_Template_Part {
	protected string $part = '';
	protected ?Style_Definition $local_style = null;

	public function part( string $part ) {
		$this->part = $part;
		return $this;
	}

	public function local_style( Style_Definition $local_style ) {
		$this->local_style = $local_style;
		return $this;
	}

	private function add_part( array $element_data ): array {
		if ( '' !== $this->part ) {
			$element_data[ Widget_Markers::PART_KEY ] = $this->part;
		}

		return $element_data;
	}

	private function add_local_style( array $element_data ): array {
		if ( ! $this->local_style ) {
			return $element_data;
		}

		$style_id = Widget_Markers::get_template_local_style_id( $this->part );

		$element_data['styles'] = [
			$style_id => array_merge(
				$this->local_style->build( $style_id ),
				[ 'label' => Template_Library_Import_Export_Utils::LOCAL_CLASS_LABEL ]
			),
		];
		$element_data['settings'] = $this->add_class( $element_data['settings'], $style_id );

		return $element_data;
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
