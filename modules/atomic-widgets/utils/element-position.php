<?php

namespace Elementor\Modules\AtomicWidgets\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Element_Position {

	const KIND_LAST = 'last';
	const KIND_FIRST = 'first';
	const KIND_INDEX = 'index';
	const KIND_AFTER_TYPE = 'after_type';
	const KIND_BEFORE_TYPE = 'before_type';

	const KINDS = [
		self::KIND_LAST,
		self::KIND_FIRST,
		self::KIND_INDEX,
		self::KIND_AFTER_TYPE,
		self::KIND_BEFORE_TYPE,
	];

	private string $kind;

	/**
	 * @var int|string|null
	 */
	private $value;

	private function __construct( string $kind, $value = null ) {
		if ( ! in_array( $kind, self::KINDS, true ) ) {
			throw new \InvalidArgumentException( esc_html( "Invalid element position kind: {$kind}" ) );
		}

		$this->kind = $kind;
		$this->value = $value;
	}

	public static function last(): self {
		return new self( self::KIND_LAST );
	}

	public static function first(): self {
		return new self( self::KIND_FIRST );
	}

	public static function at_index( int $index ): self {
		if ( $index < 0 ) {
			throw new \InvalidArgumentException( 'Element_Position: index must be >= 0.' );
		}

		return new self( self::KIND_INDEX, $index );
	}

	public static function after_type( string $element_type ): self {
		self::assert_non_empty_element_type( $element_type, 'after_type' );

		return new self( self::KIND_AFTER_TYPE, $element_type );
	}

	public static function before_type( string $element_type ): self {
		self::assert_non_empty_element_type( $element_type, 'before_type' );

		return new self( self::KIND_BEFORE_TYPE, $element_type );
	}

	private static function assert_non_empty_element_type( string $element_type, string $method ): void {
		if ( '' === trim( $element_type ) ) {
			throw new \InvalidArgumentException(
				esc_html( "Element_Position::{$method}: element_type must be a non-empty string." )
			);
		}
	}

	public function to_array(): array {
		return [
			'kind' => $this->kind,
			'value' => $this->value,
		];
	}
}
