<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Scheme_Typography extends Scheme_Base {

	const TYPOGRAPHY_1 = '1';
	const TYPOGRAPHY_2 = '2';
	const TYPOGRAPHY_3 = '3';
	const TYPOGRAPHY_4 = '4';

	/**
	 * @static
	 * @since 1.0.0
	 * @access public
	*/
	public static function get_type() {
		return 'typography';
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_title() {
		return __( 'Typography', 'elementor' );
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_disabled_title() {
		return __( 'Default Fonts', 'elementor' );
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_scheme_titles() {
		return [
			self::TYPOGRAPHY_1 => __( 'Primary Headline', 'elementor' ),
			self::TYPOGRAPHY_2 => __( 'Secondary Headline', 'elementor' ),
			self::TYPOGRAPHY_3 => __( 'Body Text', 'elementor' ),
			self::TYPOGRAPHY_4 => __( 'Accent Text', 'elementor' ),
		];
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function get_default_scheme() {
		return [
			self::TYPOGRAPHY_1 => [
				'font_family' => 'Roboto',
				'font_weight' => '600',
			],
			self::TYPOGRAPHY_2 => [
				'font_family' => 'Roboto Slab',
				'font_weight' => '400',
			],
			self::TYPOGRAPHY_3 => [
				'font_family' => 'Roboto',
				'font_weight' => '400',
			],
			self::TYPOGRAPHY_4 => [
				'font_family' => 'Roboto',
				'font_weight' => '500',
			],
		];
	}

	/**
	 * @since 1.0.0
	 * @access protected
	*/
	protected function _init_system_schemes() {
		return [];
	}

	/**
	 * @since 1.0.0
	 * @access public
	*/
	public function print_template_content() {
		?>
		<div class="elementor-panel-scheme-items"></div>
		<?php
	}
}
