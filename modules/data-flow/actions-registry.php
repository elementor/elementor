<?php

namespace Elementor\Modules\DataFlow;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\DataFlow\Props\Action_Call_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Every action an element can reference: built-in actions, actions registered by plugins through
 * `elementor/data-flow/actions/register`, and custom actions stored by administrators (see Custom_Actions).
 * Each action declares its arguments as prop types, which drive validation, sanitization and editor controls.
 */
class Actions_Registry {
	const SOURCE_BUILT_IN = 'built-in';
	const SOURCE_PLUGIN = 'plugin';
	const SOURCE_CUSTOM = 'custom';
	const ARG_TYPES = [ 'string', 'number', 'boolean', 'string-array', 'value' ];
	const SELECTOR_MAX_LENGTH = 200;
	const ATTRIBUTE_PATTERN = '/^(data|aria)-[\w-]+$/';
	const CLASS_NAME_PATTERN = '/^-?[_a-zA-Z][\w-]*$/';

	private static ?self $instance = null;

	private ?array $definitions = null;

	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	public static function reset(): void {
		self::$instance = null;
	}

	/**
	 * @param string $name       "namespace/action".
	 * @param array  $definition { label?, description?, args?: array<string, Prop_Type>, script? }, where `script` is
	 *                           a registered script handle that calls `elementorActions.register( name, run )`.
	 * @param string $source     One of the SOURCE_* constants.
	 */
	public function register( string $name, array $definition, string $source = self::SOURCE_PLUGIN ): bool {
		if ( ! preg_match( Action_Call_Prop_Type::NAME_PATTERN, $name ) ) {
			return false;
		}

		$this->load();

		if ( isset( $this->definitions[ $name ] ) && self::SOURCE_BUILT_IN === $this->definitions[ $name ]['source'] ) {
			return false;
		}

		$this->definitions[ $name ] = [
			'name' => $name,
			'label' => $definition['label'] ?? $name,
			'description' => $definition['description'] ?? '',
			'args' => array_filter( $definition['args'] ?? [], fn( $arg ) => $arg instanceof Prop_Type ),
			'script' => $definition['script'] ?? null,
			'source' => $source,
		];

		return true;
	}

	public function has( string $name ): bool {
		$this->load();

		return isset( $this->definitions[ $name ] );
	}

	public function get( string $name ): ?array {
		$this->load();

		return $this->definitions[ $name ] ?? null;
	}

	public function get_args_schema( string $name ): ?array {
		$definition = $this->get( $name );

		return $definition ? $definition['args'] : null;
	}

	public function all(): array {
		$this->load();

		return $this->definitions;
	}

	/**
	 * Builds argument prop types from a plain declaration, e.g. `{ "productId": { "type": "number" } }`.
	 */
	public static function args_from_declaration( array $declaration ): array {
		$args = [];

		foreach ( $declaration as $key => $arg ) {
			$type = is_array( $arg ) ? ( $arg['type'] ?? null ) : $arg;

			if ( ! is_string( $key ) || ! preg_match( State_Params::KEY_PATTERN, $key ) || ! in_array( $type, self::ARG_TYPES, true ) ) {
				continue;
			}

			$prop_type = self::make_arg( $type );

			if ( is_array( $arg ) && ! empty( $arg['label'] ) ) {
				$prop_type->meta( 'label', sanitize_text_field( $arg['label'] ) );
			}

			$args[ $key ] = $prop_type;
		}

		return $args;
	}

	public static function make_arg( string $type ): Prop_Type {
		switch ( $type ) {
			case 'number':
				return Number_Prop_Type::make()->float();
			case 'boolean':
				return Boolean_Prop_Type::make();
			case 'string-array':
				return String_Array_Prop_Type::make();
			case 'value':
				return self::value_arg();
			default:
				return String_Prop_Type::make();
		}
	}

	private function load(): void {
		if ( null !== $this->definitions ) {
			return;
		}

		$this->definitions = [];

		foreach ( self::get_built_in_definitions() as $name => $definition ) {
			$this->definitions[ $name ] = array_merge( $definition, [
				'name' => $name,
				'script' => null,
				'source' => self::SOURCE_BUILT_IN,
			] );
		}

		foreach ( Custom_Actions::instance()->get_definitions() as $name => $definition ) {
			$this->register( $name, $definition, self::SOURCE_CUSTOM );
		}

		do_action( 'elementor/data-flow/actions/register', $this );
	}

	private static function value_arg(): Union_Prop_Type {
		return Union_Prop_Type::make()
			->add_prop_type( Boolean_Prop_Type::make() )
			->add_prop_type( Number_Prop_Type::make()->float() )
			->add_prop_type( String_Prop_Type::make() );
	}

	private static function key_arg(): String_Prop_Type {
		return String_Prop_Type::make()->regex( State_Params::KEY_PATTERN )->required()->description( 'State key' );
	}

	private static function selector_arg(): String_Prop_Type {
		return String_Prop_Type::make()
			->regex( '/^[^<>{};]{1,' . self::SELECTOR_MAX_LENGTH . '}$/' )
			->description( 'CSS selector inside the closest state scope. Defaults to the element itself' );
	}

	private static function get_built_in_definitions(): array {
		return [
			'state/set' => [
				'label' => __( 'Set state', 'elementor' ),
				'description' => 'Sets a state key to a value.',
				'args' => [
					'key' => self::key_arg(),
					'value' => self::value_arg()->description( 'The value to set' ),
				],
			],
			'state/toggle' => [
				'label' => __( 'Toggle state', 'elementor' ),
				'description' => 'Flips a boolean state key.',
				'args' => [ 'key' => self::key_arg() ],
			],
			'state/increment' => [
				'label' => __( 'Increment state', 'elementor' ),
				'description' => 'Adds "by" (default 1, negative to decrement), clamped to min/max, or wrapped when "wrap" is on.',
				'args' => [
					'key' => self::key_arg(),
					'by' => Number_Prop_Type::make()->float(),
					'min' => Number_Prop_Type::make()->float(),
					'max' => Number_Prop_Type::make()->float(),
					'wrap' => Boolean_Prop_Type::make(),
				],
			],
			'state/cycle' => [
				'label' => __( 'Cycle state', 'elementor' ),
				'description' => 'Moves a state key to the next value in the list, e.g. tabs or palettes.',
				'args' => [
					'key' => self::key_arg(),
					'values' => String_Array_Prop_Type::make()->required(),
				],
			],
			'state/random' => [
				'label' => __( 'Random state', 'elementor' ),
				'description' => 'Sets a state key to a random different value from the list, e.g. shuffle.',
				'args' => [
					'key' => self::key_arg(),
					'values' => String_Array_Prop_Type::make()->required(),
				],
			],
			'state/from-input' => [
				'label' => __( 'Set state from input', 'elementor' ),
				'description' => 'Writes the value of the input that fired the event (checked for checkboxes, numbers when the key holds a number). Use with "input" or "change".',
				'args' => [ 'key' => self::key_arg() ],
			],
			'class/toggle' => [
				'label' => __( 'Toggle class', 'elementor' ),
				'description' => 'Toggles a class. With on: "state", the class is set while the value is truthy, or equals "equals".',
				'args' => [
					'class_name' => String_Prop_Type::make()->regex( self::CLASS_NAME_PATTERN )->required(),
					'selector' => self::selector_arg(),
					'equals' => self::value_arg(),
				],
			],
			'element/visible' => [
				'label' => __( 'Show when', 'elementor' ),
				'description' => 'Use with on: "state". Shows the target while the value is truthy, or equals "equals"; hides it otherwise.',
				'args' => [
					'selector' => self::selector_arg(),
					'equals' => self::value_arg(),
				],
			],
			'attribute/set' => [
				'label' => __( 'Set attribute', 'elementor' ),
				'description' => 'Sets a data-* or aria-* attribute to "value", or to the state value with on: "state".',
				'args' => [
					'name' => String_Prop_Type::make()->regex( self::ATTRIBUTE_PATTERN )->required(),
					'value' => String_Prop_Type::make(),
					'selector' => self::selector_arg(),
				],
			],
			'animation/playback-rate' => [
				'label' => __( 'Animation speed', 'elementor' ),
				'description' => 'Sets the playback rate of the target animations to "rate", or to the state value with on: "state".',
				'args' => [
					'rate' => Number_Prop_Type::make()->float(),
					'selector' => self::selector_arg(),
				],
			],
		];
	}
}
