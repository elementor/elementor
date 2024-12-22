<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Contracts;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

interface Prop_Type extends \JsonSerializable {
	public function get_default();
	public function validate( $value ): bool;
	public function get_meta(): array;
	public function get_meta_item( string $key, $default = null );
	public function get_settings(): array;
	public function get_setting( string $key, $default = null );
}
