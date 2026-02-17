<?php
namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Form;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Chips_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Email_Form_Action_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Toggle_Control;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Button\Atomic_Button;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Element_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Base\Widget_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Div_Block\Div_Block;
use Elementor\Modules\AtomicWidgets\PropDependencies\Manager as Dependency_Manager;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Email_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V2_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Array_Prop_Type;
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
		return self::get_type();
	}

	public function get_title() {
		return esc_html__( 'Atomic Form', 'elementor' );
	}

	public function get_keywords() {
		return [ 'atomic', 'form' ];
	}

	public function get_icon() {
		return 'eicon-atomic-form';
	}

	protected static function define_props_schema(): array {
		$email_dependencies = Dependency_Manager::make()
			->where( [
				'operator' => 'contains',
				'path' => [ 'actions-after-submit' ],
				'value' => 'email',
				'effect' => 'hide',
			] )
			->get();

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
			'email' => Email_Prop_Type::make()
				->set_dependencies( $email_dependencies )
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
					Email_Form_Action_Control::bind_to( 'email' )
						->set_meta( [
							'topDivider' => true,
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
			// First row - two columns (Name and Last name)
			$this->build_form_row( [
				$this->build_field_group(
					__( 'Name', 'elementor' ),
					'name',
					'text',
					__( 'Placeholder', 'elementor' )
				),
				$this->build_field_group(
					__( 'Last name', 'elementor' ),
					'last-name',
					'text',
					__( 'your@mail.com', 'elementor' )
				),
			], 'two-columns' ),

			// Second row - Email field (full width)
			$this->build_field_group(
				__( 'Email', 'elementor' ),
				'email',
				'email',
				__( 'your@mail.com', 'elementor' )
			),

			// Third row - Message field (textarea)
			$this->build_textarea_group(
				__( 'Message', 'elementor' ),
				'message',
				__( 'Your message', 'elementor' )
			),

			// Submit button
			Widget_Builder::make( Atomic_Button::get_element_type() )
				->settings( [
					'text' => Html_V2_Prop_Type::generate( [
						'content'  => __( 'Submit', 'elementor' ),
						'children' => [],
					] ),
					'attributes' => Attributes_Prop_Type::generate( [
						Key_Value_Prop_Type::generate( [
							'key' => String_Prop_Type::generate( 'type' ),
							'value' => String_Prop_Type::generate( 'submit' ),
						] ),
					] ),
				] )
				->is_locked( true )
				->build(),

			// Status messages
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

	private function build_field_group( string $label_text, string $field_id, string $input_type, string $placeholder ): array {
		$children = [];
		
		// Add Label widget with Html_V2_Prop_Type format
		$children[] = Widget_Builder::make( 'e-form-label' )
			->settings( [
				'text' => Html_V2_Prop_Type::generate( [
					'content'  => $label_text,
					'children' => [],
				] ),
				'input-id' => String_Prop_Type::generate( $field_id ),
			] )
			->build();
		
		// Add input field
		$children[] = Widget_Builder::make( 'e-form-input' )
			->settings( [
				'placeholder' => String_Prop_Type::generate( $placeholder ),
				'type' => String_Prop_Type::generate( $input_type ),
				'attributes' => Attributes_Prop_Type::generate( [
					Key_Value_Prop_Type::generate( [
						'key' => String_Prop_Type::generate( 'id' ),
						'value' => String_Prop_Type::generate( $field_id ),
					] ),
					Key_Value_Prop_Type::generate( [
						'key' => String_Prop_Type::generate( 'name' ),
						'value' => String_Prop_Type::generate( $field_id ),
					] ),
				] ),
			] )
			->build();
		
		return Element_Builder::make( Div_Block::get_element_type() )
			->settings( [
				'attributes' => Attributes_Prop_Type::generate( [
					Key_Value_Prop_Type::generate( [
						'key' => String_Prop_Type::generate( 'style' ),
						'value' => String_Prop_Type::generate( 'flex: 1;' ),
					] ),
				] ),
			] )
			->editor_settings( [
				'title' => $label_text . ' ' . __( 'Field', 'elementor' ),
			] )
			->children( $children )
			->build();
	}

	private function build_textarea_group( string $label_text, string $field_id, string $placeholder ): array {
		$children = [];
		
		// Add Label widget with Html_V2_Prop_Type format
		$children[] = Widget_Builder::make( 'e-form-label' )
			->settings( [
				'text' => Html_V2_Prop_Type::generate( [
					'content'  => $label_text,
					'children' => [],
				] ),
				'input-id' => String_Prop_Type::generate( $field_id ),
			] )
			->build();
		
		// Add textarea field
		$children[] = Widget_Builder::make( 'e-form-textarea' )
			->settings( [
				'placeholder' => String_Prop_Type::generate( $placeholder ),
				'rows' => Number_Prop_Type::generate( 4 ),
				'attributes' => Attributes_Prop_Type::generate( [
					Key_Value_Prop_Type::generate( [
						'key' => String_Prop_Type::generate( 'id' ),
						'value' => String_Prop_Type::generate( $field_id ),
					] ),
					Key_Value_Prop_Type::generate( [
						'key' => String_Prop_Type::generate( 'name' ),
						'value' => String_Prop_Type::generate( $field_id ),
					] ),
				] ),
			] )
			->build();
		
		return Element_Builder::make( Div_Block::get_element_type() )
			->editor_settings( [
				'title' => $label_text . ' ' . __( 'Field', 'elementor' ),
			] )
			->children( $children )
			->build();
	}

	private function build_form_row( array $children, string $layout_type = 'single' ): array {
		$row_settings = [
			'attributes' => Attributes_Prop_Type::generate( [
				Key_Value_Prop_Type::generate( [
					'key' => String_Prop_Type::generate( 'data-layout' ),
					'value' => String_Prop_Type::generate( $layout_type ),
				] ),
				Key_Value_Prop_Type::generate( [
					'key' => String_Prop_Type::generate( 'style' ),
					'value' => String_Prop_Type::generate( 'display: flex; gap: 10px;' ),
				] ),
			] ),
		];

		return Element_Builder::make( Div_Block::get_element_type() )
			->settings( $row_settings )
			->editor_settings( [
				'title' => __( 'Form Row', 'elementor' ),
			] )
			->children( $children )
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
