<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Background_Video\Atomic_Background_Video_Play;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\Elements\Base\Html_Tag_Computer;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Escaped_Html_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Background_Video_Play extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public static $widget_description = 'Play button for the Background Video element. REQUIRED child: e-paragraph with the button label text (e.g. "Play"). Drop any element inside to replace the default label.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'permanently_locked', true );
	}

	public static function get_type() {
		return 'e-background-video-play';
	}

	public static function get_element_type(): string {
		return 'e-background-video-play';
	}

	public function get_title() {
		return esc_html__( 'Play Button', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'background', 'video', 'play' ];
	}

	public function get_icon() {
		return 'eicon-play';
	}

	public function should_show_in_panel() {
		return false;
	}

	public static function get_computed_html_tag( array $settings ): string {
		return Html_Tag_Computer::compute( $settings, 'button' );
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()->default( [] ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	public static function get_props_schema(): array {
		$schema = parent::get_props_schema();

		// Locked sub-element: Display Conditions belong on the Background Video root only.
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

	protected function define_initial_attributes() {
		return [
			'type' => 'button',
			'aria-label' => esc_attr__( 'Play video', 'elementor' ),
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
							'background' => Background_Prop_Type::generate( [
								'color' => Color_Prop_Type::generate( 'transparent' ),
							] ),
							'padding' => Size_Prop_Type::generate( [
								'size' => 8,
								'unit' => 'px',
							] ),
						] )
				),
		];
	}

	public static function build_default_element( bool $mark_required = false ): array {
		$builder = static::generate()
			->children( [ static::build_label_paragraph() ] )
			->editor_settings( [
				'title' => esc_html__( 'Play Button', 'elementor' ),
			] );

		if ( $mark_required ) {
			$builder->meta( [ 'required' => true ] );
		}

		return $builder->build();
	}

	private static function build_label_paragraph(): array {
		return Atomic_Paragraph::generate()
			->meta( [ 'required' => true ] )
			->settings( [
				'paragraph' => Escaped_Html_Prop_Type::generate( esc_html__( 'Play', 'elementor' ) ),
				'tag' => String_Prop_Type::generate( 'span' ),
			] )
			->build();
	}

	protected function define_default_children() {
		return [
			static::build_label_paragraph(),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-background-video-play' => __DIR__ . '/atomic-background-video-play.html.twig',
		];
	}

	protected function build_template_context(): array {
		return array_merge( $this->build_base_template_context(), [
			'initial_attributes' => $this->define_initial_attributes(),
		] );
	}
}
