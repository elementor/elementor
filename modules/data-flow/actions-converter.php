<?php

namespace Elementor\Modules\DataFlow;

use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\DataFlow\Props\Action_Args_Prop_Type;
use Elementor\Modules\DataFlow\Props\Action_Call_Prop_Type;
use Elementor\Modules\DataFlow\Props\Actions_Prop_Type;
use Elementor\Modules\DataFlow\Props\Event_Action_Prop_Type;
use Elementor\Modules\DataFlow\Props\Input_Action_Prop_Type;
use Elementor\Modules\DataFlow\Props\Range_Map_Prop_Type;
use Elementor\Modules\DataFlow\Props\Spring_Prop_Type;
use Elementor\Modules\DataFlow\Props\State_Write_Prop_Type;
use Elementor\Modules\DataFlow\Props\State_Writes_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Converts between the plain action shape (what LLMs write, what MCP returns and what the frontend runtime
 * reads) and the stored prop types:
 *
 * - Event: { on, key?, do, args? }
 * - Input: { input, space?, inertia?, reducedMotion?, write: { stateKey: { from, map?: [inMin, inMax, outMin, outMax],
 *   clamp?, smooth?, spring?: { stiffness?, damping?, mass? }, decay?, round? } } }
 */
class Actions_Converter {
	const NUMBER_WRITE_FIELDS = [ 'smooth', 'decay' ];
	const SPRING_FIELDS = [ 'stiffness', 'damping', 'mass' ];
	const RANGE_FIELDS = [ 'in_min', 'in_max', 'out_min', 'out_max' ];

	private ?Plain_Values_Resolver $plain_values_resolver;

	public function __construct( ?Plain_Values_Resolver $plain_values_resolver = null ) {
		$this->plain_values_resolver = $plain_values_resolver;
	}

	public static function make( ?Plain_Values_Resolver $plain_values_resolver = null ): self {
		return new self( $plain_values_resolver );
	}

	/**
	 * @return array{items: array, errors: string[]} Valid prop items, and an error per dropped item.
	 */
	public function from_plain( array $plain_actions ): array {
		$item_type = Actions_Prop_Type::make()->get_item_type();
		$items = [];
		$errors = [];

		foreach ( array_values( $plain_actions ) as $index => $plain ) {
			$item = is_array( $plain ) ? $this->item_from_plain( $plain ) : null;

			if ( null === $item || ! $item_type->validate( $item ) ) {
				$errors[] = $this->describe_error( $index, $plain );
				continue;
			}

			$items[] = $item_type->sanitize( $item );
		}

		return [
			'items' => $items,
			'errors' => $errors,
		];
	}

	public static function to_plain( array $items ): array {
		return array_values( array_filter( array_map( [ self::class, 'item_to_plain' ], $items ) ) );
	}

	private static function item_to_plain( $item ): ?array {
		$type = $item['$$type'] ?? null;
		$value = self::unwrap( $item );

		if ( Event_Action_Prop_Type::get_key() === $type ) {
			return array_filter( [
				'on' => $value['on'] ?? null,
				'key' => $value['key'] ?? null,
				'do' => $value['action']['name'] ?? null,
				'args' => (object) ( $value['action']['args'] ?? [] ),
			], fn( $field ) => null !== $field );
		}

		if ( Input_Action_Prop_Type::get_key() === $type ) {
			$write = [];

			foreach ( $value['write'] ?? [] as $entry ) {
				$key = $entry['key'];
				unset( $entry['key'] );

				if ( isset( $entry['map'] ) ) {
					$entry['map'] = array_map( fn( $field ) => $entry['map'][ $field ] ?? 0, self::RANGE_FIELDS );
				}

				$write[ $key ] = $entry;
			}

			return array_filter( [
				'input' => $value['input'] ?? null,
				'space' => $value['space'] ?? null,
				'inertia' => $value['inertia'] ?? null,
				'reducedMotion' => $value['reduced_motion'] ?? null,
				'write' => (object) $write,
			], fn( $field ) => null !== $field );
		}

		return null;
	}

	private static function unwrap( $value ) {
		if ( is_array( $value ) && array_key_exists( '$$type', $value ) ) {
			return self::unwrap( $value['value'] );
		}

		if ( is_array( $value ) ) {
			return array_map( [ self::class, 'unwrap' ], $value );
		}

		return $value;
	}

	private function item_from_plain( array $plain ): ?array {
		if ( isset( $plain['input'] ) ) {
			return $this->input_from_plain( $plain );
		}

		if ( isset( $plain['on'], $plain['do'] ) ) {
			return $this->event_from_plain( $plain );
		}

		return null;
	}

	private function event_from_plain( array $plain ): ?array {
		$name = (string) $plain['do'];
		$args = $this->args_from_plain( $name, $plain['args'] ?? [] );

		if ( null === $args ) {
			return null;
		}

		return Event_Action_Prop_Type::generate( array_filter( [
			'on' => String_Prop_Type::generate( (string) $plain['on'] ),
			'key' => isset( $plain['key'] ) ? String_Prop_Type::generate( (string) $plain['key'] ) : null,
			'action' => Action_Call_Prop_Type::generate( [
				'name' => String_Prop_Type::generate( $name ),
				'args' => Action_Args_Prop_Type::generate( $args ),
			] ),
		] ) );
	}

	private function args_from_plain( string $name, $plain_args ): ?array {
		$schema = Actions_Registry::instance()->get_args_schema( $name );

		if ( null === $schema || ! is_array( $plain_args ) ) {
			return null;
		}

		$args = [];

		foreach ( $plain_args as $key => $plain_value ) {
			if ( ! isset( $schema[ $key ] ) ) {
				return null;
			}

			$resolved = $this->get_plain_values_resolver()->resolve( self::tag_scalar_for_union( $plain_value, $schema[ $key ] ), $schema[ $key ] );

			if ( null === $resolved ) {
				return null;
			}

			$args[ $key ] = $resolved;
		}

		return $args;
	}

	/**
	 * The plain resolver tries union variants in order, and the boolean variant accepts any string, so a scalar
	 * is tagged with the variant matching its PHP type.
	 */
	private static function tag_scalar_for_union( $plain_value, Prop_Type $prop_type ) {
		if ( ! $prop_type instanceof Union_Prop_Type || ! is_scalar( $plain_value ) ) {
			return $plain_value;
		}

		if ( is_bool( $plain_value ) ) {
			$type = Boolean_Prop_Type::get_key();
		} elseif ( is_string( $plain_value ) ) {
			$type = String_Prop_Type::get_key();
		} else {
			$type = Number_Prop_Type::get_key();
		}

		return null === $prop_type->get_prop_type( $type ) ? $plain_value : [
			'$$type' => $type,
			'value' => $plain_value,
		];
	}

	private function input_from_plain( array $plain ): ?array {
		if ( empty( $plain['write'] ) || ! is_array( $plain['write'] ) ) {
			return null;
		}

		$writes = [];

		foreach ( $plain['write'] as $key => $spec ) {
			if ( ! is_array( $spec ) ) {
				return null;
			}

			$writes[] = $this->write_from_plain( (string) $key, $spec );
		}

		return Input_Action_Prop_Type::generate( array_filter( [
			'input' => String_Prop_Type::generate( (string) $plain['input'] ),
			'space' => isset( $plain['space'] ) ? String_Prop_Type::generate( (string) $plain['space'] ) : null,
			'inertia' => isset( $plain['inertia'] ) ? Number_Prop_Type::generate( (float) $plain['inertia'] ) : null,
			'reduced_motion' => isset( $plain['reducedMotion'] ) ? String_Prop_Type::generate( (string) $plain['reducedMotion'] ) : null,
			'write' => State_Writes_Prop_Type::generate( $writes ),
		] ) );
	}

	private function write_from_plain( string $key, array $spec ): array {
		$value = [
			'key' => String_Prop_Type::generate( $key ),
			'from' => String_Prop_Type::generate( (string) ( $spec['from'] ?? '' ) ),
		];

		if ( isset( $spec['map'] ) && is_array( $spec['map'] ) && 4 === count( $spec['map'] ) ) {
			$value['map'] = Range_Map_Prop_Type::generate(
				array_combine( self::RANGE_FIELDS, array_map( fn( $number ) => Number_Prop_Type::generate( (float) $number ), array_values( $spec['map'] ) ) )
			);
		}

		if ( isset( $spec['clamp'] ) ) {
			$value['clamp'] = Boolean_Prop_Type::generate( (bool) $spec['clamp'] );
		}

		foreach ( self::NUMBER_WRITE_FIELDS as $field ) {
			if ( isset( $spec[ $field ] ) && is_numeric( $spec[ $field ] ) ) {
				$value[ $field ] = Number_Prop_Type::generate( (float) $spec[ $field ] );
			}
		}

		if ( isset( $spec['round'] ) && is_numeric( $spec['round'] ) ) {
			$value['round'] = Number_Prop_Type::generate( (int) $spec['round'] );
		}

		if ( isset( $spec['spring'] ) && is_array( $spec['spring'] ) ) {
			$spring = [];

			foreach ( self::SPRING_FIELDS as $field ) {
				if ( isset( $spec['spring'][ $field ] ) && is_numeric( $spec['spring'][ $field ] ) ) {
					$spring[ $field ] = Number_Prop_Type::generate( (float) $spec['spring'][ $field ] );
				}
			}

			$value['spring'] = Spring_Prop_Type::generate( $spring );
		}

		return State_Write_Prop_Type::generate( $value );
	}

	private function describe_error( int $index, $plain ): string {
		$name = is_array( $plain ) ? ( $plain['do'] ?? $plain['input'] ?? '' ) : '';

		if ( is_array( $plain ) && isset( $plain['do'] ) && ! Actions_Registry::instance()->has( (string) $plain['do'] ) ) {
			return sprintf( 'Action %d: unknown action "%s".', $index, $name );
		}

		return sprintf( 'Action %d%s is invalid. Check the event or input, the state keys and the action arguments.', $index, $name ? " ($name)" : '' );
	}

	private function get_plain_values_resolver(): Plain_Values_Resolver {
		if ( null === $this->plain_values_resolver ) {
			$this->plain_values_resolver = Atomic_Widgets_Module::instance()->get_settings_plain_values_resolver();
		}

		return $this->plain_values_resolver;
	}
}
