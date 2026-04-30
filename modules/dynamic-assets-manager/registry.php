<?php

namespace Elementor\Modules\DynamicAssetsManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class Registry {

	private array $managed_widget_types = [];

	public function register_managed_widget_type( string $widget_type ): void {
		$this->managed_widget_types[ $widget_type ] = true;
	}

	public function is_managed_widget_type( string $widget_type ): bool {
		return ! empty( $this->managed_widget_types[ $widget_type ] );
	}

	public function get_managed_widget_types(): array {
		return array_keys( $this->managed_widget_types );
	}
}
