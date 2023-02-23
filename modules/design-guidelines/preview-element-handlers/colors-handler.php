<?php

namespace Elementor\Modules\DesignGuidelines\PreviewElementHandlers;

use Elementor\Modules\DesignGuidelines\Classes\Element;
use Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Colors_Handler extends Handler_Base {

	/**
	 * @throws Exception
	 */
	public function create_elements_to_inject( $elements, $colors ): array {
		$to_inject = [];

		$title_model = $this->get_default_title();

		if ( ! $title_model ) {
			throw new Exception( 'Could not find default title' );
		}

		$title = $this->create_custom_title( $title_model, 'Custom Colors' );
		$title->set_settings( [
			'_element_id' => $this->get_selector( 'custom_colors_title' ),
		] );
		$to_inject[] = $title->get_model();

		$chunk_size = 6;

		$colors_chunks = array_chunk( $colors, $chunk_size );

		$section_model = $this->get_default_section( $elements );
		
		if ( ! $section_model )
			throw new Exception( 'Could not find default color section' );
		
		foreach ( $colors_chunks as $chunk ) {
			$section = $this->create_custom_section( $section_model, $chunk, $chunk_size );
			$to_inject[] = $section->get_model();
		}

		return $to_inject;
	}

	/**
	 * @throws Exception
	 */
	public function create_custom_section( $default_section_model, $colors, $n_columns ): Element {
		$default_color_model = $this->get_default_container( $default_section_model );

		if ( ! $default_color_model ) {
			throw new Exception( 'Could not find default color container' );
		}

		$section = new Element( $default_section_model, $this->helper );
		$section->remove_setting( '_element_id' );

		foreach ( $colors as $color ) {
			$section->append_child( $this->create_color_container( $color, $default_color_model ) );
			$n_columns --;
		}

		if ( 0 !== $n_columns ) {
			$empty_column_selector = $this->get_selector( 'empty_color_container' );

			for ( $i = 0; $i < $n_columns; $i ++ ) {
				$empty_column = new Element( $default_color_model, $this->helper );
				$empty_column->add_class( $empty_column_selector )->remove_setting( '_element_id' );
				$section->append_child( $empty_column );
			}
		}

		$section->add_class( $this->get_selector( 'custom_colors_section' ) );

		return $section;
	}

	/**
	 * @throws Exception
	 */
	public function create_color_container( $color, array $default_color_model ): Element {
		$container = new Element( $default_color_model, $this->helper );
		$title_widget_model = $this->helper->find_elements_by_class( $default_color_model, $this->get_selector( 'color_title_widget' ) )[0] ?? null;
		$color_widget_model = $this->helper->find_elements_by_class( $default_color_model, $this->get_selector( 'color_widget' ) )[0] ?? null;

		if ( ! $title_widget_model || ! $color_widget_model ) {
			throw new Exception( 'Could not find color title or color widget' );
		}

		$title_widget = new Element( $title_widget_model, $this->helper );
		$title_widget->set_settings( [
			'title' => $color['title'],
		] );

		$color_widget = new Element( $color_widget_model, $this->helper );

		$color_widget->set_settings( [
			'title' => $color['color'],
		] )->set_globals( [
			'_background_color' => 'globals/colors?id=' . $color['_id'],
		] );

		$container
			->set_settings( [ '_element_id' => $this->get_selector( 'color_container' ) . '__' . $color['_id'] ] )
			->append_child( $title_widget )
			->append_child( $color_widget );

		return $container;
	}

	public function get_default_section( $elements ): ?array {
		return $this->helper->find_element_by_id( $elements, $this->get_selector( 'default_colors_section' ) );
	}

	public function get_default_container( $elements ): ?array {
		return $this->helper->find_element_by_id( $elements, $this->get_selector( 'default_colors_container' ) );
	}

	public function get_injection_point_id(): string {
		return $this->get_selector( 'colors_injection_container' );
	}

}

