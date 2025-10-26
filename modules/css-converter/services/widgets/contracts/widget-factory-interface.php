<?php
namespace Elementor\Modules\CssConverter\Services\Widgets\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Widget_Factory_Interface {
	public function create_widget( array $widget_data ): array;
	public function supports_widget_type( string $widget_type ): bool;
	public function get_supported_types(): array;
}
