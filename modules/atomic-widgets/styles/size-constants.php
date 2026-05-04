<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Size_Constants {
	const UNIT_PX = 'px';
	const UNIT_PERCENT = '%';
	const UNIT_EM = 'em';
	const UNIT_REM = 'rem';
	const UNIT_VW = 'vw';
	const UNIT_VH = 'vh';
	const UNIT_CH = 'ch';
	const UNIT_VMIN = 'vmin';
	const UNIT_VMAX = 'vmax';
	const UNIT_SECOND = 's';
	const UNIT_MILLI_SECOND = 'ms';
	const UNIT_DEG = 'deg';
	const UNIT_RAD = 'rad';
	const UNIT_GRAD = 'grad';
	const UNIT_TURN = 'turn';
	const UNIT_AUTO = 'auto';
	const UNIT_CUSTOM = 'custom';

	const DEFAULT_UNIT = self::UNIT_PX;

	private const ORDER = [
		self::UNIT_PX,
		self::UNIT_PERCENT,
		self::UNIT_EM,
		self::UNIT_REM,
		self::UNIT_VW,
		self::UNIT_VH,
		self::UNIT_CH,
		self::UNIT_VMIN,
		self::UNIT_VMAX,
		self::UNIT_DEG,
		self::UNIT_RAD,
		self::UNIT_GRAD,
		self::UNIT_TURN,
		self::UNIT_SECOND,
		self::UNIT_MILLI_SECOND,
		self::UNIT_AUTO,
		self::UNIT_CUSTOM,
	];

	private const LENGTH_UNITS = [
		self::UNIT_PX,
		self::UNIT_EM,
		self::UNIT_REM,
		self::UNIT_VW,
		self::UNIT_VH,
		self::UNIT_CH,
	];

	private const TIME_UNITS = [
		self::UNIT_MILLI_SECOND,
		self::UNIT_SECOND,
	];

	private const ANGLE_UNITS = [
		self::UNIT_DEG,
		self::UNIT_RAD,
		self::UNIT_GRAD,
		self::UNIT_TURN,
	];

	private const EXTENDED_UNITS = [
		self::UNIT_AUTO,
		self::UNIT_CUSTOM,
	];

	private const VIEWPORT_MIN_MAX_UNITS = [
		self::UNIT_VMIN,
		self::UNIT_VMAX,
	];

	private const NUMERIC_UNITS = [
		...self::LENGTH_UNITS,
		self::UNIT_PERCENT,
		self::UNIT_CUSTOM,
	];

	private static function presets(): array {
		return [
			'layout' => self::sort_by_preferred_order( self::NUMERIC_UNITS ),
			'spacing' => self::sort_by_preferred_order( self::NUMERIC_UNITS ),
			'position' => self::NUMERIC_UNITS,
			'typography' => self::NUMERIC_UNITS,
			'border' => self::NUMERIC_UNITS,
			'box_shadow' => self::NUMERIC_UNITS,
			'transform' => self::NUMERIC_UNITS,

			'spacing_margin' => self::standard_units(),

			'anchor_offset' => [
				...self::LENGTH_UNITS,
				self::UNIT_CUSTOM,
			],

			'stroke_width' => [
				self::UNIT_PX,
				self::UNIT_EM,
				self::UNIT_REM,
				self::UNIT_CUSTOM,
			],

			'transition' => [
				...self::TIME_UNITS,
				self::UNIT_CUSTOM,
			],

			'opacity' => [
				self::UNIT_PERCENT,
				self::UNIT_CUSTOM,
			],

			'rotate' => [
				...self::ANGLE_UNITS,
				self::UNIT_CUSTOM,
			],

			'drop_shadow' => [
				...self::LENGTH_UNITS,
				self::UNIT_CUSTOM,
			],

			'blur_filter' => [
				...self::LENGTH_UNITS,
				self::UNIT_CUSTOM,
			],

			'intensity_filter' => [
				self::UNIT_PERCENT,
				self::UNIT_CUSTOM,
			],

			'color_tone_filter' => [
				self::UNIT_PERCENT,
				self::UNIT_CUSTOM,
			],

			'hue_rotate_filter' => [
				...self::ANGLE_UNITS,
				self::UNIT_CUSTOM,
			],
		];
	}

	private static function sort_by_preferred_order( array $units ): array {
		$index = array_flip( self::ORDER );

		usort( $units, fn( $a, $b ) =>
			( $index[ $a ] ?? PHP_INT_MAX ) <=> ( $index[ $b ] ?? PHP_INT_MAX )
		);

		return $units;
	}

	public static function standard_units(): array {
		return self::sort_by_preferred_order( [
			...self::LENGTH_UNITS,
			self::UNIT_PERCENT,
			self::UNIT_AUTO,
			self::UNIT_CUSTOM,
		] );
	}

	public static function all_supported_units(): array {
		return [
			...self::LENGTH_UNITS,
			...self::TIME_UNITS,
			...self::ANGLE_UNITS,
			...self::EXTENDED_UNITS,
			...self::VIEWPORT_MIN_MAX_UNITS,
			self::UNIT_PERCENT,
		];
	}

	public static function grouped_units(): array {
		return [
			'length' => self::LENGTH_UNITS,
			'angle' => self::ANGLE_UNITS,
			'time' => self::TIME_UNITS,
			'extended_units' => self::EXTENDED_UNITS,
		];
	}

	private static function by_group( string $group ): array {
		$groups = self::grouped_units();

		return $groups[ $group ] ?? [];
	}

	public static function get_preset( string $name ): array {
		$presets = self::presets();

		return $presets[ $name ] ?? [];
	}

	public static function length(): array {
		return self::by_group( 'length' );
	}

	public static function time(): array {
		return self::by_group( 'time' );
	}

	public static function angle(): array {
		return self::by_group( 'angle' );
	}

	public static function layout(): array {
		return self::get_preset( 'layout' );
	}

	public static function spacing_margin(): array {
		return self::get_preset( 'spacing_margin' );
	}

	public static function spacing(): array {
		return self::get_preset( 'spacing' );
	}

	public static function position(): array {
		return self::get_preset( 'position' );
	}

	public static function anchor_offset(): array {
		return self::get_preset( 'anchor_offset' );
	}

	public static function typography(): array {
		return self::get_preset( 'typography' );
	}

	public static function stroke_width(): array {
		return self::get_preset( 'stroke_width' );
	}

	public static function transition(): array {
		return self::get_preset( 'transition' );
	}

	public static function border(): array {
		return self::get_preset( 'border' );
	}

	public static function opacity(): array {
		return self::get_preset( 'opacity' );
	}

	public static function box_shadow(): array {
		return self::get_preset( 'box_shadow' );
	}

	public static function rotate(): array {
		return self::get_preset( 'rotate' );
	}

	public static function transform(): array {
		return self::get_preset( 'transform' );
	}

	public static function drop_shadow(): array {
		return self::get_preset( 'drop_shadow' );
	}

	public static function blur_filter(): array {
		return self::get_preset( 'blur_filter' );
	}

	public static function intensity_filter(): array {
		return self::get_preset( 'intensity_filter' );
	}

	public static function color_tone_filter(): array {
		return self::get_preset( 'color_tone_filter' );
	}

	public static function hue_rotate_filter(): array {
		return self::get_preset( 'hue_rotate_filter' );
	}
}
