<?php

namespace Elementor\ElementsV2\Widgets;

use Elementor\ElementsV2\Elements_Utils;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Base {
	protected $settings;

	protected $children = [];

	public function __construct( $data ) {
		$this->settings = array_replace_recursive(
			$this->get_defaults(),
			$data['settings'] ?? [],
			[ 'id' => $data['id'] ?? null ]
		);

		$this->children = $data['elements'] ?? [];
	}

	public function get_default_args() {
		return [];
	}

	public function get_class_name() {
		return static::class;
	}

	public function get_children() {
		return [];
	}

	public function get_children_html() {
		$children = [];

		foreach ( $this->children as $child_settings ) {
			$child = Plugin::$instance->elements_manager->create_element_instance( $child_settings );

			if ( ! $child ) {
				continue;
			}

			ob_start();

			$child->print_element();

			$children[] = ob_get_clean();
		}

		return $children;
	}

	public function get_id() {
		return $this->settings['id'];
	}

	public function get_unique_selector() {
		return '.elementor-element-' . $this->get_id();
	}

	public function print_element() {
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo $this->get_html();
	}

	public function get_settings() {
		return $this->settings;
	}

	protected function is_widget() {
		return false;
	}

	abstract public function get_defaults();
	abstract public function get_html();
	abstract public function get_name();
}
