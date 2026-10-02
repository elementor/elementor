<?php

namespace Elementor\Modules\DataFlow\Props;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\DataFlow\Actions_Registry;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * A reference to a registered action plus its arguments. Each action declares its own argument prop types,
 * so `args` is validated and sanitized against the shape of the referenced action.
 */
class Action_Call_Prop_Type extends Object_Prop_Type {
	const NAME_PATTERN = '/^[a-z0-9-]+\/[a-z0-9-]+$/';

	public static function get_key(): string {
		return 'action-call';
	}

	protected function define_shape(): array {
		return [
			'name' => String_Prop_Type::make()->regex( self::NAME_PATTERN )->required()->description( 'Registered action name, e.g. state/increment' ),
			'args' => Action_Args_Prop_Type::make()->description( 'Action arguments, shaped by the action definition' ),
		];
	}

	protected function validate_value( $value ): bool {
		if ( ! parent::validate_value( $value ) ) {
			return false;
		}

		$args_type = $this->get_args_type( $value['name']['value'] );

		return null !== $args_type && $args_type->validate( $value['args'] ?? Action_Args_Prop_Type::generate( [] ) );
	}

	public function sanitize_value( $value ) {
		$name = $value['name']['value'] ?? '';
		$args_type = $this->get_args_type( $name );
		$value = parent::sanitize_value( $value );

		$value['args'] = $args_type
			? $args_type->sanitize( $value['args'] ?? Action_Args_Prop_Type::generate( [] ) )
			: Action_Args_Prop_Type::generate( [] );

		return $value;
	}

	private function get_args_type( string $name ): ?Action_Args_Prop_Type {
		$args_schema = Actions_Registry::instance()->get_args_schema( $name );

		return null === $args_schema ? null : Action_Args_Prop_Type::make()->set_shape( $args_schema );
	}
}
