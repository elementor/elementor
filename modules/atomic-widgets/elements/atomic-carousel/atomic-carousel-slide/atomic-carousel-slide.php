<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Carousel\Atomic_Carousel_Slide;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * One slide. Empty by default so the user builds whatever layout they want inside; the width
 * comes from `--e-carousel-slides-per-view` on the root, which is why changing Slides Per View
 * needs no JS.
 *
 * `position: relative` is not cosmetic: Embla repositions individual slides in loop mode and
 * needs them to establish their own containing block.
 */
class Atomic_Carousel_Slide extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public static $widget_description = 'A single carousel slide. Accepts any element inside; starts empty so a full layout can be built in it. Lives only inside e-carousel-container.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'permanently_locked', true );
		$this->meta( 'is_container', true );
	}

	public static function get_type() {
		return 'e-carousel-slide';
	}

	public static function get_element_type(): string {
		return 'e-carousel-slide';
	}

	public function get_title() {
		return esc_html__( 'Slide', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'carousel', 'slide' ];
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
							'position' => String_Prop_Type::generate( 'relative' ),
							'flex-grow' => String_Prop_Type::generate( '0' ),
							'flex-shrink' => String_Prop_Type::generate( '0' ),
							// Width comes from a CSS variable the root sets, so changing Slides Per
							// View is a repaint rather than an Embla re-init. Making it per
							// breakpoint needs the variable to come from a style prop instead of
							// an inline attribute: V4 settings props are single-valued, only
							// style props are breakpoint-aware. See R9 in the research doc.
							'flex-basis' => Size_Prop_Type::generate( [
								'size' => 'calc(100% / var(--e-carousel-slides-per-view, 1))',
								'unit' => Size_Constants::UNIT_CUSTOM,
							] ),
							'min-width' => Size_Prop_Type::generate( [
								'size' => 0,
								'unit' => 'px',
							] ),
						] )
				),
		];
	}

	protected function define_initial_attributes() {
		// aria-label is "N of M", which only the handler can know, so it is added at runtime.
		return [
			'role' => 'group',
			'aria-roledescription' => 'slide',
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-carousel-slide' => __DIR__ . '/atomic-carousel-slide.html.twig',
		];
	}
}
