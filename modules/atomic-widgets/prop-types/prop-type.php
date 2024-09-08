<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Prop_Type implements \JsonSerializable {

	protected $default = null;

	protected array $settings = [];

	protected array $meta = [];

	/**
	 * @var array<Prop_Type>
	 */
	protected array $additional_types = [];

	abstract public static function get_key(): string;

	abstract public function validate( $value ): void;

	/**
	 * @return $this
	 */
	public static function make(): self {
		return new static();
	}

	public function default( $default ): self {
		$this->default = $default;

		return $this;
	}

	public function get_default() {
		return $this->default;
	}

	public function meta( array $additional_meta ): self {
		$this->meta = array_merge( $this->meta, $additional_meta );

		return $this;
	}

	public function get_meta( string $key ) {
		return $this->meta[ $key ] ?? null;
	}

	public function additional_type( Prop_Type $type ): self {
		$this->additional_types[] = $type;

		return $this;
	}

	public function jsonSerialize(): array {
		$additional_types = array_map( function ( $type ) {
			return [
				'key' => $type::get_key(),
				'settings' => (object) $type->settings,
			];
		}, $this->additional_types );

		return [
			'type' => [
				'key' => static::get_key(),
				'default' => $this->default,
				'settings' => (object) $this->settings,
			],
			'additional_types' => $additional_types,
		];
	}
}
