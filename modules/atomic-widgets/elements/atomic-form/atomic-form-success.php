<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Form;

use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Plugin;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Form_Success extends Atomic_Element_Base {
	const BASE_STYLE_KEY = 'base';

	public static function get_type() {
		return 'e-form-success';
	}

	public static function get_element_type(): string {
		return 'e-form-success';
	}

	public function get_title() {
		return esc_html__( 'Success message', 'elementor' );
	}

	public function should_show_in_panel() {
		return false;
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'attributes' => Attributes_Prop_Type::make(),
		];
	}

	protected function define_atomic_controls(): array {
		return [];
	}

	protected function define_base_styles(): array {
		$display = String_Prop_Type::generate( 'block' );

		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'display', $display )
				),
		];
	}

	protected function define_default_children() {
		$message = __( 'Thank you! Your submission has been received.', 'elementor' );
		$is_inline_editing_active = Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_INLINE_EDITING );
		$paragraph_value = $is_inline_editing_active
			? Html_Prop_Type::generate( $message )
			: String_Prop_Type::generate( $message );

		return [
			Widget_Builder::make( Atomic_Paragraph::get_element_type() )
				->settings( [
					'paragraph' => $paragraph_value,
				] )
				->build(),
		];
	}

	protected function add_render_attributes() {
		parent::add_render_attributes();
		$settings = $this->get_atomic_settings();
		$base_style_class = $this->get_base_styles_dictionary()[ static::BASE_STYLE_KEY ];

		$attributes = [
			'class' => [
				'e-con',
				'e-atomic-element',
				$base_style_class,
				...( $settings['classes'] ?? [] ),
			],
		];

		$this->add_render_attribute( '_wrapper', $attributes );
	}
}
