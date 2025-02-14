<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Image;

use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Elements\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\WpRest\Classes\WP_Post;
use Elementor\Utils;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Controls\Types\Image_Control;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Image extends Atomic_Widget_Base {
	use Has_Template;

	public static function get_element_type(): string {
		return 'a-image';
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-image' => __DIR__ . '/atomic-image.html.twig',
		];
	}

	public function get_title() {
		return esc_html__( 'Atomic Image', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-image';
	}

	protected function define_atomic_controls(): array {
		$content_section = Section::make()
			->set_label( esc_html__( 'Content', 'elementor' ) )
			->set_items( [
				Image_Control::bind_to( 'image' ),

				Link_Control::bind_to( 'link' )
					->set_endpoint( WP_Post::ENDPOINT )
					->set_request_params( [
						WP_Post::KEYS_FORMAT_MAP_KEY => wp_json_encode( [
							'ID' => 'id',
							'post_title' => 'label',
							'post_type' => 'groupLabel',
						] ),
					] )
					->set_allow_custom_values( true )
					->set_placeholder( __( 'Paste URL or type', 'elementor' ) ),
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

			'link' => Link_Prop_Type::make(),
		];
	}
}
