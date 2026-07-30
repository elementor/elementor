<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Icon_Button;

use Elementor\Modules\AtomicWidgets\ChildrenDependencies\Child_Dependency;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Html_Tag_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Switch_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Icon_Button\Atomic_Icon_Button_Content\Atomic_Icon_Button_Content;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Icon_Button\Atomic_Icon_Button_Icon\Atomic_Icon_Button_Icon;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Element_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Background_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\AtomicWidgets\Utils\Element_Position;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Icon_Button extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';
	const ELEMENT_TYPE_CONTENT = 'e-icon-button-content';
	const ELEMENT_TYPE_ICON = 'e-icon-button-icon';

	public static $widget_description = 'A pre-composed button with an icon and a text label. Structure: e-icon-button contains e-icon-button-content (holds the label, any V4 element) and e-icon-button-icon (holds the icon, any V4 element). Renders as a <button>, or as an <a> when a link is set.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'is_container', true );
	}

	public static function get_type() {
		return 'e-icon-button';
	}

	public static function get_element_type(): string {
		return 'e-icon-button';
	}

	public function get_title() {
		return esc_html__( 'Button', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'button', 'icon' ];
	}

	public function get_icon() {
		return 'eicon-e-button';
	}

	protected static function define_props_schema(): array {
		$tag_dependencies = Dependency_Manager::make( Dependency_Manager::RELATION_AND )
			->where( [
				'operator' => 'ne',
				'path' => [ 'link', 'destination' ],
				'nestedPath' => [ 'group' ],
				'value' => 'action',
				'newValue' => [
					'$$type' => 'string',
					'value' => 'button',
				],
			] )->where( [
				'operator' => 'not_exist',
				'path' => [ 'link', 'destination' ],
				'newValue' => [
					'$$type' => 'string',
					'value' => 'a',
				],
			] )->get();

		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] )
				->description( 'The CSS classes applied to the button.' ),
			'tag' => String_Prop_Type::make()
				->enum( [ 'button', 'a', 'div', 'header', 'section', 'article', 'aside', 'footer' ] )
				->default( 'button' )
				->set_dependencies( $tag_dependencies )
				->description( 'The HTML tag for the button. Defaults to button, and switches to a automatically when a link is set. Could be button, a, div, header, section, article, aside, or footer.' ),
			'link' => Link_Prop_Type::make()
				->description( 'The link destination of the button. When set, the button is rendered as an anchor with an href.' ),
			'show_icon' => Boolean_Prop_Type::make()
				->default( true )
				->description( 'Whether the icon slot is rendered. When false, the icon element is removed from the markup entirely and the button shows text only.' ),
			'attributes' => Attributes_Prop_Type::make()
				->meta( Overridable_Prop_Type::ignore() )
				->description( 'Custom HTML attributes added to the button.' ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [
					Switch_Control::bind_to( 'show_icon' )
						->set_label( esc_html__( 'Show Icon', 'elementor' ) ),
					Html_Tag_Control::bind_to( 'tag' )
						->set_options( [
							[
								'value' => 'button',
								'label' => 'Button',
							],
							[
								'value' => 'div',
								'label' => 'Div',
							],
							[
								'value' => 'header',
								'label' => 'Header',
							],
							[
								'value' => 'section',
								'label' => 'Section',
							],
							[
								'value' => 'article',
								'label' => 'Article',
							],
							[
								'value' => 'aside',
								'label' => 'Aside',
							],
							[
								'value' => 'footer',
								'label' => 'Footer',
							],
						] )
						->set_fallback_labels( [
							'a' => 'a (link)',
							'button' => 'Button',
						] )
						->set_label( esc_html__( 'HTML Tag', 'elementor' ) ),
					Link_Control::bind_to( 'link' )
						->set_placeholder( __( 'Type or paste your URL', 'elementor' ) )
						->set_label( __( 'Link', 'elementor' ) )
						->set_meta( [
							'topDivider' => true,
						] ),
					Text_Control::bind_to( '_cssid' )
						->set_label( __( 'ID', 'elementor' ) )
						->set_meta( $this->get_css_id_control_meta() ),
				] ),
		];
	}

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
							// `inline-flex` also reveals the Style tab flex controls, so the icon can be
							// moved before/after the label without any dedicated setting.
							'display' => String_Prop_Type::generate( 'inline-flex' ),
							'align-items' => String_Prop_Type::generate( 'center' ),
							'gap' => Size_Prop_Type::generate( [
								'size' => 8,
								'unit' => 'px',
							] ),
							'padding' => Dimensions_Prop_Type::generate( [
								'block-start' => Size_Prop_Type::generate( [
									'size' => 12,
									'unit' => 'px',
								] ),
								'inline-end' => Size_Prop_Type::generate( [
									'size' => 24,
									'unit' => 'px',
								] ),
								'block-end' => Size_Prop_Type::generate( [
									'size' => 12,
									'unit' => 'px',
								] ),
								'inline-start' => Size_Prop_Type::generate( [
									'size' => 24,
									'unit' => 'px',
								] ),
							] ),
							'background' => Background_Prop_Type::generate( [
								'color' => Color_Prop_Type::generate( '#375EFB' ),
							] ),
							'border-radius' => Size_Prop_Type::generate( [
								'size' => 2,
								'unit' => 'px',
							] ),
							'border-width' => Size_Prop_Type::generate( [
								'size' => 0,
								'unit' => 'px',
							] ),
							'text-align' => String_Prop_Type::generate( 'center' ),
						] )
				),
		];
	}

	protected function define_default_children() {
		return [
			Atomic_Icon_Button_Content::generate()
				->editor_settings( [
					'title' => esc_html__( 'Content', 'elementor' ),
				] )
				->hydrate_default_children( true )
				->build(),
			Atomic_Icon_Button_Icon::generate()
				->editor_settings( [
					'title' => esc_html__( 'Icon', 'elementor' ),
				] )
				->hydrate_default_children( true )
				->build(),
		];
	}

	protected function define_children_dependencies(): array {
		return [
			Child_Dependency::for( self::ELEMENT_TYPE_ICON )
				->when(
					Dependency_Manager::make()->where( [
						'operator' => 'ne',
						'path' => [ 'show_icon' ],
						'value' => false,
					] )
				)
				->position( Element_Position::last() )
				->stash( true )
				->default_model(
					Element_Builder::make( self::ELEMENT_TYPE_ICON )
						->is_locked( true )
						->hydrate_default_children( true )
						->build()
				),
		];
	}

	protected function define_allowed_child_types() {
		return [
			self::ELEMENT_TYPE_CONTENT,
			self::ELEMENT_TYPE_ICON,
		];
	}

	protected function define_default_html_tag() {
		return 'button';
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-icon-button' => __DIR__ . '/atomic-icon-button.html.twig',
		];
	}

	public function render_markdown(): string {
		$text = trim( wp_strip_all_tags( parent::render_markdown() ) );

		if ( empty( $text ) ) {
			return '';
		}

		$settings = $this->get_atomic_settings();

		if ( ! empty( $settings['link']['href'] ) ) {
			return '[' . $text . '](' . esc_url( $settings['link']['href'] ) . ')';
		}

		return '**' . $text . '**';
	}
}
