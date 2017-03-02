<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Shapes {
	private static $shapes;

	public static function get_shapes( $shape = null ) {
		if ( null === self::$shapes ) {
			self::init_shapes();
		}

		if ( $shape ) {
			return isset( self::$shapes[ $shape ] ) ? self::$shapes[ $shape ] : null;
		}

		return self::$shapes;
	}

	public static function filter_shapes( $by ) {
		return array_filter( self::get_shapes(), function( $shape ) use ( $by ) {
			return ! empty( $shape[ $by ] );
		} );
	}

	public static function get_shape_path( $shape, $is_negative = false ) {
		$file_name = $shape;

		if ( $is_negative ) {
			$file_name .= '-negative';
		}

		return ELEMENTOR_PATH . 'assets/shapes/' . $file_name . '.svg';
	}

	private static function init_shapes() {
		self::$shapes = [
			'mountains' => [
				'title' => _x( 'Mountains', 'Shapes', 'elementor' ),
				'has_flip' => true,
			],
			'drops' => [
				'title' => _x( 'Drops', 'Shapes', 'elementor' ),
				'has_negative' => true,
				'has_flip' => true,
			],
			'clouds' => [
				'title' => _x( 'Clouds', 'Shapes', 'elementor' ),
				'has_negative' => true,
				'has_flip' => true,
			],
			'zigzag' => [
				'title' => _x( 'Zigzag', 'Shapes', 'elementor' ),
			],
			'triangle' => [
				'title' => _x( 'Triangle', 'Shapes', 'elementor' ),
				'has_negative' => true,
			],
			'triangle-asymmetrical' => [
				'title' => _x( 'Triangle Asymmetrical', 'Shapes', 'elementor' ),
				'has_negative' => true,
				'has_flip' => true,
			],
			'tilt' => [
				'title' => _x( 'Tilt', 'Shapes', 'elementor' ),
				'has_flip' => true,
			],
			'opacity-tilt' => [
				'title' => _x( 'Opacity Tilt', 'Shapes', 'elementor' ),
				'has_flip' => true,
			],
			'opacity-fan' => [
				'title' => _x( 'Opacity Fan', 'Shapes', 'elementor' ),
			],
			'curve' => [
				'title' => _x( 'Curve', 'Shapes', 'elementor' ),
				'has_negative' => true,
			],
			'curve-asymmetrical' => [
				'title' => _x( 'Curve Asymmetrical', 'Shapes', 'elementor' ),
				'has_negative' => true,
				'has_flip' => true,
			],
			'waves' => [
				'title' => _x( 'Waves', 'Shapes', 'elementor' ),
				'has_negative' => true,
				'has_flip' => true,
			],
			'wave-brush' => [
				'title' => _x( 'Waves Brush', 'Shapes', 'elementor' ),
				'has_flip' => true,
			],
			'waves-pattern' => [
				'title' => _x( 'Waves Pattern', 'Shapes', 'elementor' ),
				'has_flip' => true,
			],
			'arrow' => [
				'title' => _x( 'Arrow', 'Shapes', 'elementor' ),
				'has_negative' => true,
			],
			'split' => [
				'title' => _x( 'Split', 'Shapes', 'elementor' ),
				'has_negative' => true,
			],
			'book' => [
				'title' => _x( 'Book', 'Shapes', 'elementor' ),
				'has_negative' => true,
			],
		];
	}
}
