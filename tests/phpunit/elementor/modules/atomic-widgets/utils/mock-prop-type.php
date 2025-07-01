<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Utils;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Mock_Prop_Type implements Prop_Type {
	private $meta;

	public function __construct( array $meta = [] ) {
		$this->meta = $meta;
	}

	// Implementation of Prop_Type interface
	public static function get_key(): string {
		return 'mock';
	}

	public function get_default() {
		return null;
	}

	public function validate( $value ): bool {
		return true;
	}

	public function sanitize( $value ) {
		return $value;
	}

	public function get_meta(): array {
		return $this->meta;
	}

	public function get_meta_item( string $key, $default = null ) {
		return $this->meta[ $key ] ?? $default;
	}

	public function get_settings(): array {
		return [];
	}

	public function get_setting( string $key, $default = null ) {
		return $default;
	}

	public function dependencies( \Elementor\Modules\AtomicWidgets\PropDependencies\Manager $manager ): self {
		return $this;
	}

	// Implementation of JsonSerializable interface
	#[\ReturnTypeWillChange]
	public function jsonSerialize() {
		return [
			'key' => static::get_key(),
			'meta' => $this->get_meta(),
		];
	}
}
