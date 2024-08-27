<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Modules\AtomicWidgets\Schema\Constraints\Enum;
use Elementor\Utils;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Schema\Atomic_Prop;
use Elementor\Modules\AtomicWidgets\Controls\Types\Image_Control;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Image extends Atomic_Widget_Base {
	public function get_name() {
		return 'a-image';
	}

	public function get_title() {
		return esc_html__( 'Atomic Image', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-image';
	}

	protected function render() {
		$settings = $this->get_atomic_settings();

		$attrs = array_filter( array_merge(
			$settings['image'] ?? [],
			[ 'class' => $settings['classes'] ?? '' ]
		) );

		Utils::print_wp_kses_extended(
			sprintf(
				'<img %1$s >',
				Utils::render_html_attributes( $attrs )
			),
			[ 'image' ]
		);
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( esc_html__( 'Content', 'elementor' ) )
				->set_items( [
					Image_Control::bind_to( 'image' ),

					Select_Control::bind_to( 'image_size' )
						->set_label( esc_html__( 'Image Resolution', 'elementor' ) )
						->set_options( static::get_image_size_options() ),
				]),
		];
	}

	protected static function define_props_schema(): array {
		$image_sizes = array_map(
			fn( $size ) => $size['value'],
			static::get_image_size_options()
		);

		return [
			'classes' => Atomic_Prop::make()
				->string()
				->default([]),

			'image' => Atomic_Prop::make()
				->type( 'image' )
				->default( [
					'$$type' => 'image',
					'value' => [
						'url' => Utils::get_placeholder_image_src(),
					],
				] ),

			'image_size' => Atomic_Prop::make()
				->string()
				->constraints( [
					Enum::make( $image_sizes ),
				] )
				->default( 'full' ),
		];
	}

	private static function get_image_size_options() {
		$wp_image_sizes = self::get_wp_image_sizes();

		$image_sizes = [];

		foreach ( $wp_image_sizes as $size_key => $size_attributes ) {

			$control_title = ucwords( str_replace( '_', ' ', $size_key ) );

			if ( is_array( $size_attributes ) ) {
				$control_title .= sprintf( ' - %d*%d', $size_attributes['width'], $size_attributes['height'] );
			}

			$image_sizes[] = [
				'label' => $control_title,
				'value' => $size_key,
			];
		}

		$image_sizes[] = [
			'label' => esc_html__( 'Full', 'elementor' ),
			'value' => 'full',
		];

		return $image_sizes;
	}

	private static function get_wp_image_sizes() {
		$default_image_sizes = get_intermediate_image_sizes();
		$additional_sizes = wp_get_additional_image_sizes();

		$image_sizes = [];

		foreach ( $default_image_sizes as $size ) {
			$image_sizes[ $size ] = [
				'width' => (int) get_option( $size . '_size_w' ),
				'height' => (int) get_option( $size . '_size_h' ),
				'crop' => (bool) get_option( $size . '_crop' ),
			];
		}

		if ( $additional_sizes ) {
			$image_sizes = array_merge( $image_sizes, $additional_sizes );
		}

		// /** This filter is documented in wp-admin/includes/media.php */
		return apply_filters( 'image_size_names_choose', $image_sizes );
	}
}
