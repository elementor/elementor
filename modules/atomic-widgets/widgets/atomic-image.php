<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Utils;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Controls\Types\Image_Control;
use ElementorDeps\Twig\Environment;
use ElementorDeps\Twig\Loader\ArrayLoader;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Image extends Atomic_Widget_Base {
	public static function get_element_type(): string {
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
			$settings['image'],
			[ 'class' => $settings['classes'] ?? '' ]
		) );

		$attrs['src'] = esc_url( $attrs['src'] );

		$loader = new ArrayLoader();
		$twig = new Environment( $loader );

		$loader->setTemplate( 'image', '<img {{ attributes | raw }}>' );

		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo $twig->load( 'image' )->render( [ 'attributes' => Utils::render_html_attributes( $attrs ) ] );
	}

	protected function define_atomic_controls(): array {
		$content_section = Section::make()
			->set_label( esc_html__( 'Content', 'elementor' ) )
			->set_items( [
				Image_Control::bind_to( 'image' ),
			] );

		return [
			$content_section,
		];
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),

			'image' => Image_Prop_Type::make()
				->default_url( Utils::get_placeholder_image_src() )
				->default_size( 'full' ),
		];
	}
}
