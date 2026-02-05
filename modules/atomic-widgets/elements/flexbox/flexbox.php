<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Flexbox;

use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Html_Tag_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Flexbox extends Atomic_Element_Base {
	const BASE_STYLE_KEY = 'base';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'is_container', true );
	}

	public static function get_type() {
		return 'e-flexbox';
	}

	public static function get_element_type(): string {
		return 'e-flexbox';
	}

	public function get_title() {
		return esc_html__( 'Flexbox', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic' ];
	}

	public function get_icon() {
		return 'eicon-flexbox';
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
				->default( [] ),
			'tag' => String_Prop_Type::make()
				->enum( [ 'div', 'header', 'section', 'article', 'aside', 'footer', 'a', 'button' ] )
				->default( 'div' )
				->description( 'The HTML tag for the flexbox container. Could be div, header, section, article, aside, footer, or a (link).' )
				->set_dependencies( $tag_dependencies ),
			'link' => Link_Prop_Type::make(),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];

		return $schema;
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [
					Html_Tag_Control::bind_to( 'tag' )
						->set_options( [
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
						])
						->set_label( esc_html__( 'HTML Tag', 'elementor' ) )
						->set_fallback_labels( [
							'a' => 'a (link)',
						] ),
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
		$display = String_Prop_Type::generate( 'flex' );
		$flex_direction = String_Prop_Type::generate( 'row' );

		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'display', $display )
						->add_prop( 'flex-direction', $flex_direction )
						->add_prop( 'padding', $this->get_base_padding() )
				),
		];
	}

	protected function get_base_padding(): array {
		return Size_Prop_Type::generate( [
			'size' => 10,
			'unit' => 'px',
		] );
	}

	protected function add_render_attributes() {
		parent::add_render_attributes();
		$settings = $this->get_atomic_settings();
		$base_style_class = $this->get_base_styles_dictionary()[ static::BASE_STYLE_KEY ];
		$initial_attributes = $this->define_initial_attributes();

		$attributes = [
			'class' => [
				'e-con',
				'e-atomic-element',
				$base_style_class,
				...( $settings['classes'] ?? [] ),
			],
		];

		if ( ! empty( $settings['_cssid'] ) ) {
			$attributes['id'] = esc_attr( $settings['_cssid'] );
		}

		if ( ! empty( $settings['link']['href'] ) ) {
			$link_attributes = $this->get_link_attributes( $settings['link'] );
			$attributes = array_merge( $attributes, $link_attributes );
		}

		$this->add_render_attribute( '_wrapper', array_merge( $initial_attributes, $attributes ) );
	}
}
