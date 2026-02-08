<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Form;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Chips_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Toggle_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Button\Atomic_Button;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Element_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V2_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_Prop_Type;

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
		return self::get_type();
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
			'actions-after-submit' => String_Array_Prop_Type::make()
				->default( [] ),
			'attributes' => Attributes_Prop_Type::make(),
		];
	}

	protected function define_atomic_controls(): array {
		$state_control = Toggle_Control::bind_to( 'form-state' )
			->set_label( __( 'States', 'elementor' ) )
			->set_meta( [ 'topDivider' => true ] );

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
				->set_size( 'tiny' )
				->set_full_width( true );
		}

		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_items( [
					Text_Control::bind_to( 'form-name' )
						->set_label( __( 'Form Name', 'elementor' ) ),
					$state_control,
					Chips_Control::bind_to( 'actions-after-submit' )
						->set_label( __( 'Actions after submit', 'elementor' ) )
						->set_meta( [ 'topDivider' => true ] )
						->set_options( [
							[
								'label' => __( 'Collect submissions', 'elementor' ),
								'value' => 'collect-submissions',
							],
							[
								'label' => __( 'Email', 'elementor' ),
								'value' => 'email',
							],
							[
								'label' => __( 'Webhook', 'elementor' ),
								'value' => 'webhook',
							],
						] ),
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
		return [
			Widget_Builder::make( 'e-form-input' )
				->build(),
			Widget_Builder::make( Atomic_Button::get_element_type() )
				->settings( [
					'text' => Html_Prop_Type::generate( __( 'Submit', 'elementor' ) ),
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
				__( 'Thank you! Your submission has been received.', 'elementor' ),
				'success',
				__( 'Success message', 'elementor' )
			),
			$this->build_status_message(
				__( 'Oops! Something went wrong.', 'elementor' ),
				'error',
				__( 'Error message', 'elementor' )
			),
		];
	}

	private function build_status_message( string $message, string $state, string $title ): array {
		$paragraph_value = Html_V2_Prop_Type::generate( [
			'content'  => $message,
			'children' => [],
		] );

		return Element_Builder::make( Div_Block::get_element_type() )
			->settings( [
				'attributes' => Attributes_Prop_Type::generate( [
					Key_Value_Prop_Type::generate( [
						'key' => String_Prop_Type::generate( 'data-e-state' ),
						'value' => String_Prop_Type::generate( $state ),
					] ),
				] ),
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
			'x-data' => 'eForm' . $this->get_id(),
			'x-on:submit' => 'submit',
		];

		if ( ! empty( $settings['_cssid'] ) ) {
			$attributes['id'] = esc_attr( $settings['_cssid'] );
		}

		if ( ! empty( $settings['form-name'] ) ) {
			$attributes['aria-label'] = esc_attr( $settings['form-name'] );
			$attributes['data-form-name'] = esc_attr( $settings['form-name'] );
		}

		$form_state = $settings['form-state'] ?? 'default';
		$attributes['data-form-state'] = esc_attr( $form_state );

		$this->add_render_attribute( '_wrapper', $attributes );
	}
}
