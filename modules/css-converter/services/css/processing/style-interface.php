<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

interface Style_Interface {
	public function get_property(): string;
	public function get_value(): string;
	public function get_specificity(): int;
	public function get_order(): int;
	public function get_converted_property(): ?array;
	public function matches( array $widget ): bool;
	public function get_source(): string;
	public function is_important(): bool;
}
