<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Form;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Toggle_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Button\Atomic_Button;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Element_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Form extends Atomic_Element_Base {
	const BASE_STYLE_KEY = 'base';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'is_container', true );
	}

	public static function get_type() {
		return 'e-form';
	}

	public static function get_element_type(): string {
		return 'e-form';
	}

	public function get_title() {
		return esc_html__( 'Atomic Form', 'elementor' );
	}

	public function get_keywords() {
		return [ 'atomic', 'form' ];
	}

	public function get_icon() {
		return 'eicon-form-horizontal';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()
				->default( [] ),
			'form-name' => String_Prop_Type::make()
				->default( __( 'Form', 'elementor' ) ),
			'form-state' => String_Prop_Type::make()
				->enum( [ 'default', 'success', 'error' ] )
				->default( 'default' ),
			'attributes' => Attributes_Prop_Type::make(),
		];
	}

	protected function define_atomic_controls(): array {
		$state_control = Toggle_Control::bind_to( 'form-state' )
			->set_label( __( 'States', 'elementor' ) );

		if ( $state_control instanceof Toggle_Control ) {
			$state_control
				->add_options( [
					'default' => [
						'title' => __( 'Normal', 'elementor' ),
					],
					'success' => [
						'title' => __( 'Success', 'elementor' ),
					],
					'error' => [
						'title' => __( 'Error', 'elementor' ),
					],
				] )
				->set_exclusive( true )
				->set_convert_options( true )
				->set_size( 'tiny' );
		}

		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_items( [
					Text_Control::bind_to( 'form-name' )
						->set_label( __( 'Form Name', 'elementor' ) ),
					$state_control,
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

	protected function define_panel_categories(): array {
		return [ 'atomic-form' ];
	}

	protected function define_default_html_tag() {
		return 'form';
	}

	protected function define_default_children() {
		$is_inline_editing_active = Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_INLINE_EDITING );

		return [
			Widget_Builder::make( 'e-form-input' )
				->build(),
			Widget_Builder::make( Atomic_Button::get_element_type() )
				->settings( [
					'text' => String_Prop_Type::generate( __( 'Submit', 'elementor' ) ),
					'attributes' => Attributes_Prop_Type::generate( [
						Key_Value_Prop_Type::generate( [
							'key' => String_Prop_Type::generate( 'type' ),
							'value' => String_Prop_Type::generate( 'submit' ),
						] ),
					] ),
				] )
				->is_locked( true )
				->build(),
			$this->build_status_message(
				'e-form-success',
				__( 'Thank you! Your submission has been received.', 'elementor' ),
				$is_inline_editing_active,
				__( 'Success message', 'elementor' )
			),
			$this->build_status_message(
				'e-form-error',
				__( 'Oops! Something went wrong.', 'elementor' ),
				$is_inline_editing_active,
				__( 'Error message', 'elementor' )
			),
		];
	}

	private function build_status_message( string $class_name, string $message, bool $is_inline_editing_active, string $title ): array {
		$paragraph_value = $is_inline_editing_active
			? Html_Prop_Type::generate( $message )
			: String_Prop_Type::generate( $message );

		return Element_Builder::make( Div_Block::get_element_type() )
			->settings( [
				'classes' => Classes_Prop_Type::generate( [ $class_name ] ),
			] )
			->editor_settings( [
				'title' => $title,
			] )
			->children( [
				Widget_Builder::make( Atomic_Paragraph::get_element_type() )
					->settings( [
						'paragraph' => $paragraph_value,
					] )
					->build(),
			] )
			->is_locked( true )
			->build();
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

		if ( ! empty( $settings['_cssid'] ) ) {
			$attributes['id'] = esc_attr( $settings['_cssid'] );
		}

		if ( ! empty( $settings['form-name'] ) ) {
			$attributes['aria-label'] = esc_attr( $settings['form-name'] );
			$attributes['data-form-name'] = esc_attr( $settings['form-name'] );
		}

		$is_edit_mode = Plugin::$instance->editor->is_edit_mode();
		$is_preview_mode = Plugin::$instance->preview->is_preview_mode();
		$form_state = ( $is_edit_mode || $is_preview_mode ) ? ( $settings['form-state'] ?? 'default' ) : 'default';
		$attributes['data-form-state'] = esc_attr( $form_state );

		$this->add_render_attribute( '_wrapper', $attributes );
	}
}
