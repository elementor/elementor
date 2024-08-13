<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Utils;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Schema\Atomic_Prop;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Image extends Atomic_Widget_Base {
	public function get_icon() {
		return 'eicon-image';
	}

	public function get_title() {
		return esc_html__( 'Atomic Image', 'elementor' );
	}

	public function get_name() {
		return 'a-image';
	}

	protected function render() {
		$settings = $this->get_atomic_settings();

		// TODO: Replace with actual URL prop
		$image_url = $settings['url'];

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo "<img src='" . esc_url( $image_url ) . "' />";
	}

	private function get_image_size_options() {
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

	protected function define_atomic_controls(): array {
		$options = $this->get_image_size_options();

		$resolution_control = Select_Control::bind_to( 'image_size' )
			->set_label( esc_html__( 'Image Resolution', 'elementor' ) )
			->set_options( $options );

		$content_section = Section::make()
			->set_label( esc_html__( 'Content', 'elementor' ) )
			->set_items( [
				$resolution_control,
			]);

		return [
			$content_section,
		];
	}

	protected static function define_props_schema(): array {
		return [
			'image_size' => Atomic_Prop::make()
				->default( 'large' ),

			'url' => Atomic_Prop::make()
				->default( Utils::get_placeholder_image_src() ),
		];
	}
}
