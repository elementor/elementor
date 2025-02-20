<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Image;

use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Elements\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Controls\Types\Image_Control;
use Elementor\Modules\AtomicWidgets\Image\Placeholder_Image;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Image extends Atomic_Widget_Base {
	use Has_Template;

	public static function get_element_type(): string {
		return 'a-image';
	}

	public function get_title() {
		return esc_html__( 'Atomic Image', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-e-image';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),

			'image' => Image_Prop_Type::make()
				->default_url( Placeholder_Image::get_placeholder_image() )
				->default_size( 'full' ),

			'link' => Link_Prop_Type::make(),
		];
	}

	protected function define_atomic_controls(): array {
		$content_section = Section::make()
			->set_label( esc_html__( 'Content', 'elementor' ) )
			->set_items( [
				Image_Control::bind_to( 'image' ),

				Link_Control::bind_to( 'link' )
					->set_placeholder( __( 'Paste URL or type', 'elementor' ) ),
			] );

		return [
			$content_section,
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-image' => __DIR__ . '/atomic-image.html.twig',
		];
	}
}
