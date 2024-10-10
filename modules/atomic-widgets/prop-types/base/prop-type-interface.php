<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Prop_Type implements \JsonSerializable {
	protected $default = null;

	protected array $meta = [];

	protected array $settings = [];

	public static function make(): self {
		return new static();
	}

	public function value( $value ) {
		return [
			'$$type' => static::get_key(),
			'value' => $value,
		];
	}

	public function default( $default ): self {
		$this->default = $this->value( $default );

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

	public function setting( $key, $value = null ): self {
		[ $key, $value ] = Utils::is_tuple( $key ) ? $key : [ $key, $value ];

		$this->settings[ $key ] = $value;

		return $this;
	}

	public function get_default() {
		return $this->default;
	}

	public function get_meta() {
		return $this->meta;
	}

	public function get_settings() {
		return $this->settings;
	}

	public function validate( $value ): bool {
		$validate_current = fn() => isset( $value['$$type'] )
			&& static::get_key() !== $value['$$type']
			&& isset( $value['value'] )
			&& ( ! isset( $value['disabled'] ) || is_bool( $value['disabled'] ) )
			&& $this->validate_value( $value['value'] );

		return Collection::make( [ $validate_current ] )
			->push(...array_map(
				fn( Prop_Type $type ) => $type->validate( $value ),
				$this->get_sub_types()
			))
			->some( fn( $validator ) => ! $validator() );
	}

	public function jsonSerialize() {
		return [
			'key' => $this->get_key(),
			'type' => $this->get_type(),
			'default' => $this->get_default(),
			'settings' => (object) $this->get_settings(),
			'meta' => (object) $this->get_meta(),
		];
	}

	abstract public static function get_key(): string;

	abstract public static function get_type(): string;

	abstract protected function validate_value( $value ): bool;
}
