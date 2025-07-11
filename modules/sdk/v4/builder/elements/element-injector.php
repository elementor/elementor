<?php

namespace Elementor\Modules\Sdk\V4\Builder\Elements;

use DOMDocument;
use DOMElement;
use Elementor\Plugin;
use Elementor\Utils;
use Elementor\Widget_Base;

class Element_Injector {

	protected $document;
	protected $host_element;

	public function __construct( DOMDocument $document, DOMElement $host_element ) {
		$this->document = $document;
		$this->host_element = $host_element;
	}

	protected function generate_unique_id() {
		return Utils::generate_random_string();
	}

	/**
	 * @return Widget_Base[]
	 */
	public function execute(): array {
		$added_widgets = [];
		$root_element = $this->host_element;
		$injection_points = $this->find_injection_points( $root_element );
		foreach ( $injection_points as $injection_point ) {
			$fragment = $this->document->createDocumentFragment();
			$element_type = $injection_point->getAttribute( 'widget-type' );
			$settings_raw = $injection_point->getAttribute( 'settings' );
			$widget_settings = json_decode( $settings_raw, true ) ?? [];
			$widgets_manager = Plugin::instance()->widgets_manager;
			$widget_type = $widgets_manager->get_widget_types( $element_type );
			if ( $widget_type ) {
				$widget_id = 'injected-' . $this->generate_unique_id();
				$widget_instance = Plugin::instance()->elements_manager->create_element_instance([
					'elType' => 'widget',
					'id' => $widget_id,
					'widgetType' => $element_type,
					'editor_settings' => $widget_settings,
					'settings' => $widget_settings,
				]);
				if ( ! $widget_instance ) {
					throw new \Exception( 'Failed to create widget instance' );
				}
				ob_start();
				$widget_instance->print_element();
				$content = ob_get_clean();
				$success = $fragment->appendXml( $content );
				if ( ! $success ) {
					throw new \Exception( 'Failed to append XML to document fragment' );
				}
				// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$replacement = $fragment->firstElementChild;
				$injection_point->replaceWith( $replacement );
			}
		}
		return $added_widgets;
	}

	/**
	 * @param DOMElement $element
	 * @return DOMElement[]
	 */
	public function find_injection_points( DOMElement $element ) {
		$injection_points = [];
		if ( $element->hasAttribute( 'is' ) && $element->getAttribute( 'is' ) === 'elementor-widget' ) {
			return [ $element ];
		}
		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		$children = $element->childNodes;
		foreach ( $children as $child ) {
			if ( $child instanceof DOMElement ) {
				$injection_points[] = $this->find_injection_points( $child );
			}
		}
		return array_merge( ...array_values( $injection_points ) );
	}
}
