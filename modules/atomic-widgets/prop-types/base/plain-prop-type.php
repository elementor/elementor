<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes\Base;

use Elementor\Modules\AtomicWidgets\PropTypes\Concerns;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Transformable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Plain_Prop_Type implements Transformable_Prop_Type {
	// Backward compatibility, do not change to "const". Keep name in uppercase.
	// phpcs:ignore
	static $KIND = 'plain';

	use Concerns\Has_Default;
	use Concerns\Has_Generate;
	use Concerns\Has_Meta;
	use Concerns\Has_Required_Setting;
	use Concerns\Has_Settings;
	use Concerns\Has_Transformable_Validation;
	use Concerns\Has_Initial_Value;

	/**
	 * @return array<Plain_Prop_Type>
	 */
	public static function get_subclasses(): array {
		$children = [];
		foreach ( get_declared_classes() as $class ) {
			if ( is_subclass_of( $class, self::class ) ) {
				$children[] = $class;
			}
		}
		return $children;
	}

	private ?array $dependencies = null;

	/**
	 * @return static
	 */
	public static function make() {
		return new static();
	}

	public function get_type(): string {
		// phpcs:ignore
		return static::$KIND;
	}

	public function validate( $value ): bool {
		if ( is_null( $value ) || ( $this->is_transformable( $value ) && empty( $value['value'] ) ) ) {
			return ! $this->is_required();
		}

		return (
			$this->is_transformable( $value ) &&
			$this->validate_value( $value['value'] )
		);
	}

	public function sanitize( $value ) {
		$value['value'] = $this->sanitize_value( $value['value'] );

		return $value;
	}

	public function jsonSerialize(): array {
		return [
			// phpcs:ignore
			'kind' => static::$KIND,
			'key' => static::get_key(),
			'default' => $this->get_default(),
			'meta' => (object) $this->get_meta(),
			'settings' => (object) $this->get_settings(),
			'dependencies' => $this->get_dependencies(),
			'initial_value' => $this->get_initial_value(),
		];
	}

	abstract public static function get_key(): string;

	abstract protected function validate_value( $value ): bool;

	abstract protected function sanitize_value( $value );

	public function set_dependencies( ?array $dependencies ): self {
		$this->dependencies = empty( $dependencies ) ? null : $dependencies;

		return $this;
	}

	public function get_dependencies(): ?array {
		return $this->dependencies;
	}
}
