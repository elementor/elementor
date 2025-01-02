<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Utils;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
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

		if ( ! isset( $settings['image'] ) ) {
			return;
		}

		$attrs = array_filter( array_merge(
			$settings['image'],
			array( 'class' => $settings['classes'] ?? '' )
		) );

		$attrs['src'] = esc_url( $attrs['src'] );

		Utils::print_wp_kses_extended(
			sprintf(
				'<img %1$s >',
				Utils::render_html_attributes( $attrs )
			),
			array( 'image' )
		);
	}

	protected function define_atomic_controls(): array {
		$content_section = Section::make()
			->set_label( esc_html__( 'Content', 'elementor' ) )
			->set_items( array(
				Image_Control::bind_to( 'image' ),
			) );

		return array(
			$content_section,
		);
	}

	protected static function define_props_schema(): array {
		return array(
			'classes' => Classes_Prop_Type::make()
				->default( array() ),

			'image' => Image_Prop_Type::make()
				->default_url( Utils::get_placeholder_image_src() )
				->default_size( 'full' ),
		);
	}
}
