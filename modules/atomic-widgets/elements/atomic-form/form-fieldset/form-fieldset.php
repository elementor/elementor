<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Form\Form_Fieldset;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Inline_Editing_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Form_Fieldset extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public static $widget_description = 'Group related form fields such as radio buttons or checkboxes for WebMCP parameter schemas.';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'is_container', true );
	}

	public static function get_type() {
		return 'e-form-fieldset';
	}

	public static function get_element_type(): string {
		return self::get_type();
	}

	public function get_title() {
		return esc_html__( 'Fieldset', 'elementor' );
	}

	public function get_keywords() {
		return [ 'atomic', 'form', 'fieldset', 'radio', 'checkbox', 'group' ];
	}

	public function get_icon() {
		return 'eicon-form-horizontal';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'legend' => Html_V3_Prop_Type::make()
				->default( [
					'content' => String_Prop_Type::generate( '' ),
					'children' => [],
				] ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_id( 'content' )
				->set_items( [
					Inline_Editing_Control::bind_to( 'legend' )
						->set_label( __( 'Legend', 'elementor' ) )
						->set_placeholder( __( 'Group label', 'elementor' ) ),
				] ),
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [
					Text_Control::bind_to( '_cssid' )
						->set_label( __( 'ID', 'elementor' ) )
						->set_meta( $this->get_css_id_control_meta() ),
				] ),
		];
	}

	protected function define_panel_categories(): array {
		return [ 'atomic-form' ];
	}

	protected function define_default_html_tag() {
		return 'fieldset';
	}

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_props( [
							'border' => String_Prop_Type::generate( 'none' ),
							'margin' => Size_Prop_Type::generate( [
								'size' => 0,
								'unit' => 'px',
							] ),
							'padding' => Size_Prop_Type::generate( [
								'size' => 0,
								'unit' => 'px',
							] ),
						] )
				),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/form-fieldset' => __DIR__ . '/form-fieldset.html.twig',
		];
	}

	protected function build_template_context(): array {
		$context = $this->build_base_template_context();
		$legend = $this->resolve_legend_text();

		$context['legend_text'] = $legend;
		$context['tool_param_description'] = $legend;

		return $context;
	}

	private function resolve_legend_text(): string {
		$settings = $this->get_atomic_settings();
		$legend = $settings['legend'] ?? '';

		if ( is_array( $legend ) ) {
			return trim( (string) ( $legend['content'] ?? '' ) );
		}

		return trim( (string) $legend );
	}

	protected function get_css_id_control_meta(): array {
		return [
			'layout' => 'two-columns',
			'topDivider' => false,
		];
	}
}
