<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel\Atomic_Carousel_Pagination;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Dot container. The dots themselves are created by the handler, because their count depends on
 * the slide count and `slides_to_scroll` and changes as the user edits — one V4 element per dot
 * would mean rewriting the element tree on every repeater change.
 *
 * The dots are still ordinary DOM we own, so styling props and extra pagination types (fraction,
 * progress) can be layered on later without changing this structure.
 */
class Atomic_Carousel_Pagination extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public static $widget_description = 'The pagination dot strip of a carousel. Locked element with no children of its own: the dots are generated at runtime, one per snap position. Must be a direct child of e-carousel.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'permanently_locked', true );
	}

	public static function get_type() {
		return 'e-carousel-pagination';
	}

	public static function get_element_type(): string {
		return 'e-carousel-pagination';
	}

	public function get_title() {
		return esc_html__( 'Pagination', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'carousel', 'pagination', 'dots' ];
	}

	public function get_icon() {
		return 'eicon-ellipsis-h';
	}

	public function should_show_in_panel() {
		return false;
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()->default( [] ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	public static function get_props_schema(): array {
		$schema = parent::get_props_schema();

		unset( $schema['display-conditions'] );

		return $schema;
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [] ),
		];
	}

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
							'display' => String_Prop_Type::generate( 'flex' ),
							'justify-content' => String_Prop_Type::generate( 'center' ),
							'align-items' => String_Prop_Type::generate( 'center' ),
							'gap' => Size_Prop_Type::generate( [
								'size' => 8,
								'unit' => 'px',
							] ),
						] )
				),
		];
	}

	protected function define_initial_attributes() {
		return [
			'role' => 'tablist',
			'aria-label' => esc_attr__( 'Slides', 'elementor' ),
		];
	}

	protected function define_allowed_child_types() {
		return [];
	}

	public static function build_default_element(): array {
		return static::generate()
			->editor_settings( [
				'title' => esc_html__( 'Pagination', 'elementor' ),
			] )
			->build();
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-carousel-pagination' => __DIR__ . '/atomic-carousel-pagination.html.twig',
		];
	}
}
