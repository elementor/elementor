<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Size_Constants {
	const UNIT_PX = 'px';
	const UNIT_EM = 'em';
	const UNIT_REM = 'rem';
	const UNIT_VW = 'vw';
	const UNIT_VH = 'vh';
	const UNIT_PERCENT = '%';
	const UNIT_AUTO = 'auto';
	const UNIT_CUSTOM = 'custom';

	const COMMON_UNITS = [
		self::UNIT_PX,
		self::UNIT_EM,
		self::UNIT_REM,
		self::UNIT_VW,
		self::UNIT_VH
	];

	const TIME_UNITS = [ 's', 'ms' ];
	const EXTENDED_UNITS = [ 'auto', 'custom' ];
	const VIEWPORT_MIN_MAX_UNITS = [ 'vmin', 'vmax' ];
	const ANGLE_UNITS = [ 'deg', 'rad', 'grad', 'turn' ];

	public static function all_supported_units(): array {
		return array_merge(
			self::all_units(),
			self::ANGLE_UNITS,
			self::TIME_UNITS,
			self::EXTENDED_UNITS,
			self::VIEWPORT_MIN_MAX_UNITS,
		);
	}

	public static function all_units(): array {
		return [
			...self::COMMON_UNITS,
			self::UNIT_PERCENT,
			self::UNIT_AUTO,
			self::UNIT_CUSTOM
		];
	}

	public static function typography_units(): array {
		return [
			...self::COMMON_UNITS,
			self::UNIT_PERCENT,
			self::UNIT_CUSTOM
		];
	}

	public static function spacing_units(): array {
		return [
			...self::COMMON_UNITS,
			self::UNIT_PERCENT,
			self::UNIT_CUSTOM
		];
	}

	public static function border_units(): array {
		return [
			...self::COMMON_UNITS,
			self::UNIT_PERCENT,
			self::UNIT_CUSTOM
		];
	}

	public static function get_position_units(): array {
		return [ ...self::COMMON_UNITS, self::UNIT_CUSTOM ];
	}

	public static function effect_units(): array {
		return [ self::UNIT_PERCENT, self::UNIT_CUSTOM ];
	}

	public static function opacity_units(): array {
		return [ self::UNIT_PERCENT, self::UNIT_CUSTOM ];
	}
}
