<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Background_Video\Atomic_Background_Video_Controls;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Background_Video\Atomic_Background_Video;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_States;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Background_Video_Controls extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public static $widget_description = 'Controls wrapper for the Background Video element. Contains play and pause buttons positioned over the video.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'permanently_locked', true );
	}

	public static function get_type() {
		return 'e-background-video-controls';
	}

	public static function get_element_type(): string {
		return 'e-background-video-controls';
	}

	public function get_title() {
		return esc_html__( 'Controls', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'background', 'video', 'controls' ];
	}

	public function get_icon() {
		return 'eicon-play';
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

	protected function define_atomic_style_states(): array {
		$class_states = Style_States::get_class_states_map();

		return [
			$class_states['playing'],
			$class_states['paused'],
		];
	}

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
							'display' => String_Prop_Type::generate( 'flex' ),
							'position' => String_Prop_Type::generate( 'absolute' ),
							'bottom' => Size_Prop_Type::generate( [
								'size' => 20,
								'unit' => 'px',
							] ),
							'right' => Size_Prop_Type::generate( [
								'size' => 20,
								'unit' => 'px',
							] ),
							'z-index' => String_Prop_Type::generate( '2' ),
							'gap' => Size_Prop_Type::generate( [
								'size' => 8,
								'unit' => 'px',
							] ),
						] )
				),
		];
	}

	protected function define_allowed_child_types() {
		return [
			Atomic_Background_Video::ELEMENT_TYPE_PLAY,
			Atomic_Background_Video::ELEMENT_TYPE_PAUSE,
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-background-video-controls' => __DIR__ . '/atomic-background-video-controls.html.twig',
		];
	}
}
