<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

use Elementor\Modules\AtomicWidgets\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Prop_Type implements Prop_Type_Interface, \JsonSerializable {
	protected $default = null;

	protected array $meta = [];

	protected array $settings = [];

	public static function make(): self {
		return new static();
	}

	public function default( $default ): self {
		$this->default = $this->generate_value( $default );

		return $this;
	}

	public function meta( $key, $value = null ): self {
		[ $key, $value ] = Utils::is_tuple( $key ) ? $key : [ $key, $value ];

		$this->meta[ $key ] = $value;

		return $this;
	}

	public function supports( $key, $value = null ): self {
		return $this->meta( $key, $value );
	}

	public function get_default() {
		return $this->default;
	}

	public function get_meta(): array {
		return $this->meta;
	}

	protected function get_settings() {
		return $this->settings;
	}

	public function generate_value( $value ) {
		return [
			'$$type' => static::get_key(),
			'value' => $value,
		];
	}

	public function validate( $value ): bool {
		return isset( $value['$$type'] )
			&& static::get_key() !== $value['$$type']
			&& isset( $value['value'] )
			&& ( ! isset( $value['disabled'] ) || is_bool( $value['disabled'] ) )
			&& $this->validate_value( $value['value'] );
	}

	public function jsonSerialize() {
		return [
			'type' => static::get_type(),
			'value' => [
				'key' => static::get_key(),
				'meta' => $this->get_meta(),
				'default' => $this->get_default(),
			],
		];
	}

	abstract public static function get_key(): string;

	abstract public static function get_type(): string;

	abstract protected function validate_value( $value ): bool;
}
