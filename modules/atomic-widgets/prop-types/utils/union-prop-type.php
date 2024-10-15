<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Utils;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Persistable_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Concerns;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Union_Prop_Type implements Prop_Type {
	const TYPE = 'union';

	use Concerns\Has_Meta,
		Concerns\Has_Settings,
		Concerns\Has_Required_Validation;

	protected $default = null;

	/** @var Array<string, Persistable_Prop_Type> */
	protected array $prop_types = [];

	public static function make(): self {
		return new static();
	}

	public static function create_from( Persistable_Prop_Type $prop_type ) {
		$instance = static::make()->add_prop_type( $prop_type );

		$default = $prop_type->get_default() ?? null;

		if ( $default ) {
			$instance->default(
				$default['value'] ?? $default,
				$prop_type::get_key()
			);
		}

		return $instance;
	}

	public function add_prop_type( Persistable_Prop_Type $prop_type ): self {
		$this->prop_types[ $prop_type::get_key() ] = $prop_type;

		return $this;
	}

	public function get_prop_types(): array {
		return $this->prop_types;
	}

	public function get_prop_type( $type ): ?Persistable_Prop_Type {
		return $this->prop_types[ $type ] ?? null;
	}

	public function default( $value, string $type ): self {
		$this->default = [
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
			'type' => static::TYPE,
			'default' => $this->get_default(),
			'meta' => $this->get_meta(),
			'settings' => $this->get_settings(),
			'prop_types' => $this->get_prop_types(),
		];
	}
}
