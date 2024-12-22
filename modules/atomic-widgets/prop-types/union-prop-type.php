<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Union_Prop_Type implements Prop_Type {
	const KIND = 'union';

	use Concerns\Has_Meta,
		Concerns\Has_Settings,
		Concerns\Has_Required_Setting;

	protected $default = null;

	/** @var Array<string, Transformable_Prop_Type> */
	protected array $prop_types = [];

	public static function make(): self {
		return new static();
	}

	public static function create_from( Transformable_Prop_Type $prop_type ): self {
		return static::make()
			->add_prop_type( $prop_type )
			->default( $prop_type->get_default() );
	}

	public function add_prop_type( Transformable_Prop_Type $prop_type ): self {
		$this->prop_types[ $prop_type::get_key() ] = $prop_type;

		return $this;
	}

	public function get_prop_types(): array {
		return $this->prop_types;
	}

	public function get_prop_type( $type ): ?Transformable_Prop_Type {
		return $this->prop_types[ $type ] ?? null;
	}

	public function default( $value, ?string $type = null ): self {
		$this->default = ! $type ?
			$value :
			[
				'$$type' => $type,
				'value' => $value,
			];

		return $this;
	}

	public function get_default() {
		return $this->default;
	}

	public function validate( $value ): bool {
		if ( is_null( $value ) ) {
			return ! $this->is_required();
		}

		return $this->validate_prop_types( $value );
	}

	protected function validate_prop_types( $value ): bool {
		foreach ( $this->get_prop_types() as $prop_type ) {
			if ( $prop_type->validate( $value ) ) {
				return true;
			}
		}

		return false;
	}

	public function jsonSerialize(): array {
		return [
			'kind' => static::KIND,
			'default' => $this->get_default(),
			'meta' => $this->get_meta(),
			'settings' => $this->get_settings(),
			'prop_types' => $this->get_prop_types(),
		];
	}
}
