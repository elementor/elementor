<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Div_Block;

use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Div_Block extends Atomic_Element_Base {
	const BASE_STYLE_KEY = 'base';

	public static function get_type() {
		return 'e-div-block';
	}

	public static function get_element_type(): string {
		return 'e-div-block';
	}

	public function get_title() {
		return esc_html__( 'Div Block', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic' ];
	}

	public function get_icon() {
		return 'eicon-div-block';
	}

	protected static function define_props_schema(): array {
		$tag_dependencies = Dependency_Manager::make()
			->where( [
				'operator' => 'not_exist',
				'path' => [ 'link', 'destination' ],
			] )
		->get();

		$props = [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'tag' => String_Prop_Type::make()
				->enum( [ 'div', 'header', 'section', 'article', 'aside', 'footer' ] )
				->default( 'div' )
				->set_dependencies( $tag_dependencies ),
			'link' => Link_Prop_Type::make(),

			'attributes' => Key_Value_Array_Prop_Type::make(),
		];

		return $props;
	}

	protected function define_atomic_controls(): array {
		return [];
	}

	protected function get_settings_controls(): array {
		return [
			Select_Control::bind_to( 'tag' )
				->set_label( esc_html__( 'HTML Tag', 'elementor' ) )
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
				]),
			Link_Control::bind_to( 'link' )
				->set_label( __( 'Link', 'elementor' ) )
				->set_meta( [
					'topDivider' => true,
				] ),
		];
	}

	protected function _get_default_child_type( array $element_data ) {
		$el_types = array_keys( Plugin::$instance->elements_manager->get_element_types() );

		if ( in_array( $element_data['elType'], $el_types, true ) ) {
			return Plugin::$instance->elements_manager->get_element_types( $element_data['elType'] );
		}

		return Plugin::$instance->widgets_manager->get_widget_types( $element_data['widgetType'] );
	}

	protected function content_template() {
		?>
		<?php
	}

	public function before_render() {
		?>
		<<?php $this->print_html_tag(); ?> <?php $this->print_render_attribute_string( '_wrapper' );
		$this->print_custom_attributes(); ?>>
		<?php
	}

	public function after_render() {
		?>
		</<?php $this->print_html_tag(); ?>>
		<?php
	}

	private function print_custom_attributes() {
		$settings = $this->get_atomic_settings();
		$attributes = $settings['attributes'];
		if ( ! empty( $attributes ) && is_string( $attributes ) ) {
			// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
			echo ' ' . $attributes;
		}
	}

	/**
	 * Print safe HTML tag for the element based on the element settings.
	 *
	 * @return void
	 */
	protected function print_html_tag() {
		$html_tag = $this->get_html_tag();
		Utils::print_validated_html_tag( $html_tag );
	}

	protected function get_html_tag(): string {
		$settings = $this->get_atomic_settings();

		return ! empty( $settings['link']['href'] ) ? 'a' : ( $settings['tag'] ?? 'div' );
	}

	protected function define_base_styles(): array {
		$display = String_Prop_Type::generate( 'block' );

		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'display', $display )
						->add_prop( 'padding', $this->get_base_padding() )
						->add_prop( 'min-width', $this->get_base_min_width() )
				),
		];
	}

	protected function get_base_padding(): array {
		return Size_Prop_Type::generate( [
			'size' => 10,
			'unit' => 'px',
		] );
	}

	protected function get_base_min_width(): array {
		return Size_Prop_Type::generate( [
			'size' => 30,
			'unit' => 'px',
		] );
	}

	protected function add_render_attributes() {
		parent::add_render_attributes();
		$settings = $this->get_atomic_settings();
		$base_style_class = $this->get_base_styles_dictionary()[ static::BASE_STYLE_KEY ];

		$attributes = [
			'class' => [
				'e-con',
				$base_style_class,
				...( $settings['classes'] ?? [] ),
			],
		];

		if ( ! empty( $settings['_cssid'] ) ) {
			$attributes['id'] = esc_attr( $settings['_cssid'] );
		}

		if ( ! empty( $settings['link']['href'] ) ) {
			$attributes = array_merge( $attributes, $settings['link'] );
		}

		$this->add_render_attribute( '_wrapper', $attributes );
	}
}
