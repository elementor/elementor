<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel\Atomic_Carousel_Container;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * The slide track. Embla drives this node with an inline `transform`, so anything the user sets
 * on `transform`, and on `opacity` while fade is active, would be silently overridden — the
 * style system emits CSS classes and inline styles always win. See R3 in the research doc.
 *
 * Slide spacing is the standard CSS `gap` on this element. Embla measures rendered geometry, so
 * it snaps gap-aware with no extra configuration; verified in the POC harness.
 */
class Atomic_Carousel_Container extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public static $widget_description = 'The slide track of a carousel. Locked structural element whose only children are e-carousel-slide elements. Set the space between slides with the CSS gap property on this element.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'permanently_locked', true );
	}

	public static function get_type() {
		return 'e-carousel-container';
	}

	public static function get_element_type(): string {
		return 'e-carousel-container';
	}

	public function get_title() {
		return esc_html__( 'Slides', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'carousel', 'slides' ];
	}

	public function get_icon() {
		return 'eicon-slider-push';
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
						] )
				),
		];
	}

	protected function define_initial_attributes() {
		// Autoplay moves slides without the visitor asking, so the track must not be announced
		// as a live region. Slide labels carry the position instead.
		return [
			'aria-live' => 'off',
		];
	}

	protected function define_allowed_child_types() {
		return [ 'e-carousel-slide' ];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-carousel-container' => __DIR__ . '/atomic-carousel-container.html.twig',
		];
	}
}
