<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Icon_Button\Atomic_Icon_Button_Icon;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg\Atomic_Svg;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Flex_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Icon_Button_Icon extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public static $widget_description = 'Icon slot for the Icon Button element. Holds the decorative icon; drop any V4 element here to replace the default SVG.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'permanently_locked', true );
	}

	public static function get_type() {
		return 'e-icon-button-icon';
	}

	public static function get_element_type(): string {
		return 'e-icon-button-icon';
	}

	public function get_title() {
		return esc_html__( 'Icon', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'button', 'icon' ];
	}

	public function get_icon() {
		return 'eicon-svg';
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

		// Locked sub-element: Display Conditions belong on the Icon Button root only.
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

	protected function define_default_html_tag() {
		return 'span';
	}

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
							// `flex-shrink: 0` — there is no standalone `flex-shrink` entry in the style
							// schema, so it is expressed through the `flex` shorthand with the CSS
							// initial values for grow (0) and basis (auto), which renders `flex: 0 0 auto`.
							'flex' => Flex_Prop_Type::generate( [
								'flexGrow' => Number_Prop_Type::generate( 0 ),
								'flexShrink' => Number_Prop_Type::generate( 0 ),
								'flexBasis' => Size_Prop_Type::generate( [
									'size' => 'auto',
									'unit' => 'custom',
								] ),
							] ),
						] )
				),
		];
	}

	protected function define_default_children() {
		return [
			Atomic_Svg::generate()->build(),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-icon-button-icon' => __DIR__ . '/atomic-icon-button-icon.html.twig',
		];
	}
}
