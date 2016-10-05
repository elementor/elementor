<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Scheme_Color_Picker extends Scheme_Color {

	const COLOR_5 = '5';
	const COLOR_6 = '6';
	const COLOR_7 = '7';
	const COLOR_8 = '8';

	public static function get_type() {
		return 'color-picker';
	}

	public static function get_description() {
		return __( 'Choose which colors appear in the editor\'s color picker. This makes accessing the colors you chose for the site much easier.', 'elementor' );
	}

	public function get_default_scheme() {
		return array_replace( parent::get_default_scheme(), [
			self::COLOR_5 => '#4054b2',
			self::COLOR_6 => '#23a455',
			self::COLOR_7 => '#000',
			self::COLOR_8 => '#fff',
		] );
	}

	public function get_scheme_titles() {
		return [];
	}

	protected function _init_system_schemes() {
		$schemes = parent::_init_system_schemes();

		$additional_schemes = [
			'joker' => [
				'items' => [
					self::COLOR_5 => '#4b4646',
					self::COLOR_6 => '#e2e2e2',
				],
			],
			'ocean' => [
				'items' => [
					self::COLOR_5 => '#154d80',
					self::COLOR_6 => '#8c8c8c',
				],
			],
			'royal' => [
				'items' => [
					self::COLOR_5 => '#ac8e4d',
					self::COLOR_6 => '#e2cea1',
				],
			],
			'violet' => [
				'items' => [
					self::COLOR_5 => '#9c9ea6',
					self::COLOR_6 => '#c184d0',
				],
			],
			'sweet' => [
				'items' => [
					self::COLOR_5 => '#41aab9',
					self::COLOR_6 => '#ffc72f',
				],
			],
			'urban' => [
				'items' => [
					self::COLOR_5 => '#aa4039',
					self::COLOR_6 => '#94dbaf',
				],
			],
			'earth' => [
				'items' => [
					self::COLOR_5 => '#aa6666',
					self::COLOR_6 => '#efe5d9',
				],
			],
			'river' => [
				'items' => [
					self::COLOR_5 => '#7b8c93',
					self::COLOR_6 => '#eb6d65',
				],
			],
			'pastel' => [
				'items' => [
					self::COLOR_5 => '#f5a46c',
					self::COLOR_6 => '#6e6f71',
				],
			],
		];

		$schemes = array_replace_recursive( $schemes, $additional_schemes );

		foreach ( $schemes as & $scheme ) {
			$scheme['items'] += [
				self::COLOR_7 => '#000',
				self::COLOR_8 => '#fff',
			];
		}

		return $schemes;
	}

	protected function _get_system_schemes_to_print() {
		$schemes = $this->get_system_schemes();

		$items_to_print = [
			self::COLOR_1,
			self::COLOR_5,
			self::COLOR_2,
			self::COLOR_3,
			self::COLOR_6,
			self::COLOR_4,
		];

		$items_to_print = array_flip( $items_to_print );

		foreach ( $schemes as $scheme_key => $scheme ) {
			$schemes[ $scheme_key ]['items'] = array_replace( $items_to_print, array_intersect_key( $scheme['items'], $items_to_print ) );
		}

		return $schemes;
	}

	protected function _get_current_scheme_title() {
		return __( 'Color Picker', 'elementor' );
	}
}
