<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Utils;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Mock_Prop_Type implements Prop_Type {
	private $meta;

	public function __construct( array $meta = [] ) {
		$this->meta = $meta;
	}

	public function get_type(): string {
		return 'plain';
	}

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

	public function set_dependencies( Dependency_Manager $manager ): self {
		return $this;
	}

	#[\ReturnTypeWillChange]
	public function jsonSerialize() {
		return [
			'key' => static::get_key(),
			'meta' => $this->get_meta(),
		];
	}
}
