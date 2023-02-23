<?php

namespace Elementor\Modules\DesignGuidelines\Classes;

use Elementor\Modules\DesignGuidelines\Utils\Elements_Data_Helper;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Element {

	private Elements_Data_Helper $helper;

	/**
	 * @var Element[] $children
	 */
	private array $children;

	private array $model;

	public function __construct( array $model, $helper, $clone = false ) {
		$children_as_element = [];

		if ( ! $clone ) {
			$model['elements'] = [];
		}

		foreach ( $model['elements'] as $child ) {
			$children_as_element[] = new Element( $child, $helper );
		}

		$this->children = $children_as_element;
		$this->model = $model;
		$this->helper = $helper;
	}

	public function get_model(): array {
		$random_id = Utils::generate_random_string();
		$this->model['id'] = $random_id;

		$this->model['elements'] = $this->get_children_models();

		return $this->model;
	}

	public function get_children_models(): array {
		return array_map( function( $child ) {
			return $child->get_model();
		}, $this->children );
	}

	public function get_settings() {
		return $this->helper->get_element_settings( $this->model );
	}

	public function set_settings( $settings ) {
		foreach ( $settings as $key => $value ) {
			$this->model['settings'][ $key ] = $value;
		}

		return $this;
	}

	public function remove_setting( $key ): Element {
		unset( $this->model['settings'][ $key ] );

		return $this;
	}

	public function set_globals( $globals ): Element {
		$old_globals = $this->model['settings']['__globals__'] ?? [];

		foreach ( $globals as $key => $value ) {
			$globals[ $key ] = $value;
		}

		return $this->set_settings( [ '__globals__' => $globals ] );
	}

	public function get_id(): ?string {
		return $this->helper->get_element_id( $this->model );
	}

	public function get_classes(): array {
		return $this->helper->get_element_classes( $this->model );
	}

	public function append_child( Element $element ): Element {
		$this->children[] = $element;

		return $this;
	}

	public function delete_children(): Element {
		$this->children = [];

		return $this;
	}

	public function add_class( $class_name ): Element {
		$classes = $this->get_classes();
		$classes[] = $class_name;

		return $this->set_classes( $classes );
	}

	public function remove_class( $class_name ): Element {
		$classes = $this->get_classes();
		$classes = array_diff( $classes, [ $class_name ] );

		return $this->set_classes( $classes );
	}

	public function set_classes( array $classes ): Element {
		$property_name = $this->helper->get_class_property_name( $this->model );
		$settings = $this->get_settings();

		$settings[ $property_name ] = implode( ' ', $classes );

		return $this->set_settings( $settings );
	}

}

