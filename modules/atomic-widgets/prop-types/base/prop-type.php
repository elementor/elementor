<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

use Elementor\Modules\AtomicWidgets\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Prop_Type implements \JsonSerializable {
	protected $default = null;

	protected array $meta = [];

	protected array $settings = [];

	protected array $sub_types = [];

	public static function make(): self {
		return new static();
	}

	public function default( $value ): self {
		$this->default = $this->generate_value( $value );

		return $this;
	}

	public function meta( $key, $value = null ): self {
		[ $key, $value ] = Utils::is_tuple( $key ) ? $key : [ $key, $value ];

		$this->meta[ $key ] = $value;

		return $this;
	}

	public function sub_type( Prop_Type $prop_type ): self {
		$this->sub_types[ $prop_type::get_type() ] = $prop_type;

		return $this;
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

	public function get_sub_types(): array {
		return $this->sub_types;
	}

	public function get_sub_type( $key ): ?Prop_Type {
		return $this->sub_types[ $key ] ?? null;
	}

	public function generate_value( $value ) {
		return [
			'$$type' => static::get_key(),
			'value' => $value,
		];
	}

	public function validate( $value ): bool {
		return $this->validate_self( $value )
			|| $this->validate_sub_types( $value );
	}

	protected function validate_self( $value ): bool {
		return isset( $value['$$type'] )
			&& static::get_key() !== $value['$$type']
			&& isset( $value['value'] )
			&& ( ! isset( $value['disabled'] ) || is_bool( $value['disabled'] ) );
	}

	protected function validate_sub_types( $value ): bool {
		foreach ( $this->get_sub_types() as $sub_type ) {
			if ( $sub_type->validate( $value ) ) {
				return true;
			}
		}

		return false;
	}

	public function jsonSerialize() {
		return [
			'type' => static::get_type(),
			'key' => static::get_key(),
			'default' => $this->get_default(),
			'meta' => $this->get_meta(),
			'settings' => $this->get_settings(),
			'sub_types' => $this->get_sub_types(),
		];
	}

	abstract public static function get_key(): string;

	abstract public static function get_type(): string;
}
