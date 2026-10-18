<?php

namespace Elementor\Modules\DataFlow\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Input_Action_Prop_Type extends Object_Prop_Type {
	const SPACES = [ 'local', 'global' ];
	const REDUCED_MOTION = [ 'skip', 'run' ];

	public static function get_key(): string {
		return 'input-action';
	}

	protected function define_shape(): array {
		return [
			'input' => String_Prop_Type::make()->enum( array_keys( State_Write_Prop_Type::INPUT_VALUES ) )->required()->description( 'Continuous input that writes state every frame while it changes' ),
			'space' => String_Prop_Type::make()->enum( self::SPACES )->description( 'pointer and scroll: local tracks the element, global tracks the viewport or document' ),
			'inertia' => Number_Prop_Type::make()->float()->description( 'drag: friction per frame after release (0..1), default 0.95' ),
			'reduced_motion' => String_Prop_Type::make()->enum( self::REDUCED_MOTION )->description( 'skip (default) disables the input when the visitor prefers reduced motion' ),
			'write' => State_Writes_Prop_Type::make()->required()->description( 'State keys written from the input values' ),
		];
	}

	protected function validate_value( $value ): bool {
		if ( ! parent::validate_value( $value ) ) {
			return false;
		}

		$writes = $value['write']['value'] ?? [];
		$allowed = State_Write_Prop_Type::INPUT_VALUES[ $value['input']['value'] ] ?? [];

		if ( empty( $writes ) ) {
			return false;
		}

		foreach ( $writes as $write ) {
			if ( ! in_array( $write['value']['from']['value'] ?? null, $allowed, true ) ) {
				return false;
			}
		}

		return true;
	}
}
