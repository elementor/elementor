<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Scheme_Color extends Scheme_Base {

	const COLOR_1 = '1';
	const COLOR_2 = '2';
	const COLOR_3 = '3';
	const COLOR_4 = '4';

	public static function get_type() {
		return 'color';
	}

	public function get_title() {
		return __( 'Colors', 'elementor' );
	}

	public function get_scheme_titles() {
		return [
			self::COLOR_1 => __( 'Primary', 'elementor' ),
			self::COLOR_2 => __( 'Secondary', 'elementor' ),
			self::COLOR_3 => __( 'Text', 'elementor' ),
			self::COLOR_4 => __( 'Accent', 'elementor' ),
		];
	}

	public function get_default_scheme() {
		return [
			self::COLOR_1 => '#6ec1e4',
			self::COLOR_2 => '#54595f',
			self::COLOR_3 => '#7a7a7a',
			self::COLOR_4 => '#61ce70',
		];
	}

	public static function get_system_schemes() {
		return [
			'royal' => [
				'title' => __( 'Royal', 'elementor' ),
				'items' => [
					self::COLOR_1 => '#ac8e4d',
					self::COLOR_2 => '#d0b270',
					self::COLOR_3 => '#e2cea1',
					self::COLOR_4 => '#fff',
				],
			],
			'autumn' => [
				'title' => __( 'Autumn', 'elementor' ),
				'items' => [
					self::COLOR_1 => '#103c29',
					self::COLOR_2 => '#10593a',
					self::COLOR_3 => '#23885d',
					self::COLOR_4 => '#fff',
				],
			],
			'silver' => [
				'title' => __( 'Silver', 'elementor' ),
				'items' => [
					self::COLOR_1 => '#671d7a',
					self::COLOR_2 => '#8c2ea4',
					self::COLOR_3 => '#ae63c1',
					self::COLOR_4 => '#fff',
				],
			],
		];
	}
}
