<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Image;

use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Elements\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\Controls\Types\Image_Control;
use Elementor\Modules\AtomicWidgets\Image\Placeholder_Image;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Image extends Atomic_Widget_Base {
	use Has_Template;

	const LINK_BASE_STYLE_KEY = 'link-base';
	const BASE_STYLE_KEY = 'base';

	public static function get_element_type(): string {
		return 'e-image';
	}

	public function get_title() {
		return esc_html__( 'Image', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic' ];
	}

	public function get_icon() {
		return 'eicon-e-image';
	}

	protected static function define_props_schema(): array {
		$props = [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),

			'image' => Image_Prop_Type::make()
				->default_url( Placeholder_Image::get_placeholder_image() )
				->default_size( 'full' ),

			'link' => Link_Prop_Type::make(),

			'attributes' => Key_Value_Array_Prop_Type::make(),
		];

		return $props;
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( esc_html__( 'Content', 'elementor' ) )
				->set_items( [
					Image_Control::bind_to( 'image' )
						->set_label( __( 'Image', 'elementor' ) )
						->set_show_mode( 'media' ),
				] ),
		];
	}

	protected function get_settings_controls(): array {
		return [
			Image_Control::bind_to( 'image' )
				->set_label( __( 'Image resolution', 'elementor' ) )
				->set_show_mode( 'sizes' )
				->set_meta( [ 'layout' => 'two-columns' ] ),
			Link_Control::bind_to( 'link' )
				->set_label( __( 'Link', 'elementor' ) )
				->set_meta( [
					'topDivider' => true,
				] ),
		];
	}

	protected function define_base_styles(): array {
		return [
			self::LINK_BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'display', 'inherit' )
						->add_prop( 'width', 'fit-content' )
				),
			self::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'display', 'block' )
				),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-image' => __DIR__ . '/atomic-image.html.twig',
		];
	}
}
