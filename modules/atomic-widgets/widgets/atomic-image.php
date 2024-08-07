<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

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
		echo "<img src=$image_url />";
	}

	private function get_image_sizes() {
		$wp_image_sizes = self::get_all_image_sizes();

		$image_sizes = [];

		foreach ( $wp_image_sizes as $size_key => $size_attributes ) {
			
			$control_title = ucwords( str_replace( '_', ' ', $size_key ) );

			if ( is_array( $size_attributes ) ) {
				$control_title .= sprintf( ' - %d x %d', $size_attributes['width'], $size_attributes['height'] );
			}

			array_push($image_sizes, [
				'label'=> $control_title,
				'value' => $size_key,
				'dimensions' => [
					'width' => $size_attributes['width'],
					'height' => $size_attributes['height'],
				]
			]);
		}

		array_push($image_sizes, [
			'label' => esc_html__( 'Full', 'elementor' ),
			'value' => 'full',
		]);

		return $image_sizes;
	}

	/**
	 * Get all image sizes.
	 *
	 * Retrieve available image sizes with data like `width`, `height` and `crop`.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return array An array of available image sizes.
	 */

	public static function get_all_image_sizes() {
		global $_wp_additional_image_sizes;

		// $default_image_sizes = get_intermediate_image_sizes();

		$default_image_sizes = [ 'thumbnail', 'medium', 'medium_large', 'large' ];

		$image_sizes = [];

		foreach ( $default_image_sizes as $size ) {
			$image_sizes[ $size ] = [
				'width' => (int) get_option( $size . '_size_w' ),
				'height' => (int) get_option( $size . '_size_h' ),
				'crop' => (bool) get_option( $size . '_crop' ),
			];
		}
		
		if ( $_wp_additional_image_sizes ) {
			$image_sizes = array_merge( $image_sizes, $_wp_additional_image_sizes );
		}

		// /** This filter is documented in wp-admin/includes/media.php */
		return apply_filters( 'image_size_names_choose', $image_sizes );
	}


	protected function define_atomic_controls(): array {
		$options = $this->get_image_sizes();

		$resolution_control = Select_Control::bind_to( 'image_size' )
			->set_label( __( 'Resolutions', 'elementor' ) )
			->set_options( $options );
		

		$content_section = Section::make()
			->set_label( __( 'Content', 'elementor' ) )
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
				->default( 'https://placehold.co/400' ),
		];
	}
}
