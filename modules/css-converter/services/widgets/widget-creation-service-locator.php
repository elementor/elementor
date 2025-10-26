<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Include required dependencies

use Elementor\Modules\CssConverter\Services\Widgets\Factories\Atomic_Widget_Factory;

class Widget_Creation_Service_Locator {
	private array $services = [];
	private bool $use_zero_defaults;

	public function __construct( bool $use_zero_defaults = false ) {
		$this->use_zero_defaults = $use_zero_defaults;
	}

	public function get_document_manager(): Elementor_Document_Manager {
		if ( ! isset( $this->services['document_manager'] ) ) {
			$this->services['document_manager'] = new Elementor_Document_Manager();
		}
		return $this->services['document_manager'];
	}

	public function get_cache_manager(): Widget_Cache_Manager {
		if ( ! isset( $this->services['cache_manager'] ) ) {
			$this->services['cache_manager'] = new Widget_Cache_Manager();
		}
		return $this->services['cache_manager'];
	}

	public function get_css_variable_processor(): CSS_Variable_Processor {
		if ( ! isset( $this->services['css_variable_processor'] ) ) {
			$this->services['css_variable_processor'] = new CSS_Variable_Processor();
		}
		return $this->services['css_variable_processor'];
	}

	public function get_statistics_collector(): Widget_Creation_Statistics_Collector {
		if ( ! isset( $this->services['statistics_collector'] ) ) {
			$this->services['statistics_collector'] = new Widget_Creation_Statistics_Collector();
		}
		return $this->services['statistics_collector'];
	}

	public function get_hierarchy_processor(): Widget_Hierarchy_Processor {
		if ( ! isset( $this->services['hierarchy_processor'] ) ) {
			$this->services['hierarchy_processor'] = new Widget_Hierarchy_Processor();
		}
		return $this->services['hierarchy_processor'];
	}

	public function get_error_handler(): Widget_Error_Handler {
		if ( ! isset( $this->services['error_handler'] ) ) {
			$this->services['error_handler'] = new Widget_Error_Handler();
		}
		return $this->services['error_handler'];
	}

	public function get_widget_factory_registry(): Widget_Factory_Registry {
		if ( ! isset( $this->services['widget_factory_registry'] ) ) {
			$registry = new Widget_Factory_Registry();

			// Register default factories
			$atomic_factory = new Atomic_Widget_Factory( $this->use_zero_defaults );
			$registry->register_factory( $atomic_factory );

			$this->services['widget_factory_registry'] = $registry;
		}
		return $this->services['widget_factory_registry'];
	}

	public function clear_services(): void {
		$this->services = [];
	}
}
