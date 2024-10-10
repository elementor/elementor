<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Prop_Type_Interface;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Union_Prop_Type implements Prop_Type_Interface, \JsonSerializable {
	const TYPE = 'union';

	protected $types = [];

	protected $main = null;

	public function type( Prop_Type_Interface $prop_type, $is_main = false ): self {
		$this->types[] = $prop_type;

		if ( $is_main ) {
			$this->main = count( $this->types ) - 1;
		}

		return $this;
	}

	public function get_types() {
		return $this->types;
	}

	public function get_main_index() {
		return $this->main;
	}

	public function get_main() {
		$index = $this->get_main_index();

		if ( ! $index ) {
			return null;
		}

		return $this->types[ $index ] ?? null;
	}

	public function get_default() {
		$main = $this->get_main();

		if ( ! $main ) {
			return null;
		}

		return $main->get_default();
	}

	public function get_meta(): array {
		$main = $this->get_main();

		if ( ! $main ) {
			return [];
		}

		return $main->get_meta();
	}

	public function generate_value( $value, $type = null ) {
		$selected_type = null;

		if ( null === $type ) {
			$selected_type = $this->get_main();
		}

		if ( is_string( $type ) ) {
			foreach ( $this->get_types() as $prop_type ) {
				if ( $prop_type->get_key() === $type ) {
					$selected_type = $prop_type;

					break;
				}
			}
		}

		if ( null === $selected_type ) {
			return null;
		}

		return $selected_type->generate_value( $value );
	}

	public function validate( $value ): bool {
		return Collection::make( $this->get_types() )
			->some( fn( Prop_Type $type ) => $type->validate( $value ) );
	}

	public function jsonSerialize() {
		return [
			'type' => static::TYPE,
			'value' => [
				'default' => $this->get_default(),
				'meta' => $this->get_meta(),
				'main_index' => $this->get_main_index(),
				'types' => $this->get_types(),
			],
		];
	}
}
