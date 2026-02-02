<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Include required dependencies

use Elementor\Modules\CssConverter\Services\Widgets\Contracts\Widget_Factory_Interface;

class Widget_Factory_Registry {
	private array $factories = [];

	public function register_factory( Widget_Factory_Interface $factory ): void {
		foreach ( $factory->get_supported_types() as $type ) {
			$this->factories[ $type ] = $factory;
		}
	}

	public function create_widget( array $widget_data ): array {
		$widget_type = $widget_data['widget_type'] ?? 'unknown';

		$factory = $this->get_factory_for_type( $widget_type );
		if ( ! $factory ) {
			throw new \Exception( "No factory found for widget type: {$widget_type}" );
		}

		return $factory->create_widget( $widget_data );
	}

	public function get_factory_for_type( string $widget_type ): ?Widget_Factory_Interface {
		return $this->factories[ $widget_type ] ?? null;
	}

	public function has_factory_for_type( string $widget_type ): bool {
		return isset( $this->factories[ $widget_type ] );
	}

	public function get_supported_types(): array {
		return array_keys( $this->factories );
	}
}
