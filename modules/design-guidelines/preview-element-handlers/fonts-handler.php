<?php

namespace Elementor\Modules\DesignGuidelines\PreviewElementHandlers;

use Elementor\Modules\DesignGuidelines\Classes\Element;
use Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Fonts_Handler extends Handler_Base {

	/**
	 * @throws \Exception
	 */
	public function create_elements_to_inject( $elements, $fonts ): array {
		$to_inject = [];

		$title_model = $this->get_default_title();

		if ( ! $title_model ) {
			throw new Exception( 'Could not find default title' );
		}

		$title = $this->create_custom_title( $title_model, 'Custom Fonts' );
		$title->set_settings( [
			'_element_id' => $this->get_selector( 'custom_fonts_title' ),
		] );
		$to_inject[] = $title->get_model();

		$default_section_model = $this->get_default_section( $elements );

		if ( ! $default_section_model ) {
			throw new Exception( 'Could not find default fonts section' );
		}

		foreach ( $fonts as $font ) {
			$to_inject[] = $this->create_custom_section( $default_section_model, $font );
		}

		return $to_inject;
	}

	/**
	 * @throws \Exception
	 */
	public function create_custom_section( $default_section_model, $font ): array {
		$container = new Element( $default_section_model, $this->helper );
		$column = new Element( $default_section_model['elements'][0], $this->helper );

		$title_widget_model = $this->helper->find_elements_by_class( $default_section_model, $this->get_selector( 'font_title_widget' ) )[0] ?? null;
		$font_widget_model = $this->helper->find_elements_by_class( $default_section_model, $this->get_selector( 'font_widget' ) )[0] ?? null;

		if ( ! $title_widget_model || ! $font_widget_model ) {
			throw new Exception( 'Could not find default font title or font widget' );
		}

		$title_widget = new Element( $title_widget_model, $this->helper );
		$title_widget->set_settings( [
			'title' => $font['title'],
		] );

		$font_widget = new Element( $font_widget_model, $this->helper );

		$font_widget->set_globals( [
			'typography_typography' => 'globals/typography?id=' . $font['_id'],
		] );

		$column->append_child( $title_widget )
			->append_child( $font_widget );

		$container
			->set_settings( [ '_element_id' => $this->get_selector( 'font_section' ) . '__' . $font['_id'] ] )
			->append_child( $column );

		return $container->get_model();
	}

	public function get_default_section( $elements ): ?array {
		return $this->helper->find_element_by_id( $elements, $this->get_selector( 'default_fonts_section' ) );
	}

	public function get_injection_point_id(): string {
		return $this->get_selector( 'fonts_injection_container' );
	}

}

