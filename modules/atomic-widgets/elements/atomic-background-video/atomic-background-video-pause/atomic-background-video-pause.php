<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Background_Video\Atomic_Background_Video_Pause;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg\Atomic_Svg;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Svg_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Background_Video_Pause extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public static $widget_description = 'Pause button for the Background Video element. Drop any element inside to replace the default icon.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'permanently_locked', true );
	}

	public static function get_type() {
		return 'e-background-video-pause';
	}

	public static function get_element_type(): string {
		return 'e-background-video-pause';
	}

	public function get_title() {
		return esc_html__( 'Pause Button', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'background', 'video', 'pause' ];
	}

	public function get_icon() {
		return 'eicon-pause';
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

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [] ),
		];
	}

	protected function define_default_html_tag() {
		return 'button';
	}

	protected function define_initial_attributes() {
		return [
			'type' => 'button',
			'aria-label' => esc_attr__( 'Pause video', 'elementor' ),
		];
	}

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
							'display' => String_Prop_Type::generate( 'inline-flex' ),
							'align-items' => String_Prop_Type::generate( 'center' ),
							'justify-content' => String_Prop_Type::generate( 'center' ),
							'cursor' => String_Prop_Type::generate( 'pointer' ),
							'border-style' => String_Prop_Type::generate( 'none' ),
							'background' => String_Prop_Type::generate( 'transparent' ),
							'padding' => Size_Prop_Type::generate( [
								'size' => 8,
								'unit' => 'px',
							] ),
							'width' => Size_Prop_Type::generate( [
								'size' => 40,
								'unit' => 'px',
							] ),
							'height' => Size_Prop_Type::generate( [
								'size' => 40,
								'unit' => 'px',
							] ),
						] )
				),
		];
	}

	protected function define_default_children() {
		$icon_url = plugins_url(
			'modules/atomic-widgets/elements/atomic-background-video/assets/pause-icon.svg',
			ELEMENTOR__FILE__
		);

		return [
			Atomic_Svg::generate()
				->settings( [
					'svg' => Svg_Src_Prop_Type::generate( [
						'id' => null,
						'url' => Url_Prop_Type::generate( $icon_url ),
					] ),
				] )
				->build(),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-background-video-pause' => __DIR__ . '/atomic-background-video-pause.html.twig',
		];
	}
}
