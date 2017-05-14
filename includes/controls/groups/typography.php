<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Group_Control_Typography extends Group_Control_Base {

	protected static $fields;

	private static $_scheme_fields_keys = [ 'font_family', 'font_weight' ];

	public static function get_scheme_fields_keys() {
		return self::$_scheme_fields_keys;
	}

	public static function get_type() {
		return 'typography';
	}

	protected function init_fields() {
		$fields = [];

		$fields['typography'] = [
			'label' => _x( 'Typography', 'Typography Control', 'elementor' ),
			'type' => Controls_Manager::SWITCHER,
			'default' => '',
			'label_on' => __( 'On', 'elementor' ),
			'label_off' => __( 'Off', 'elementor' ),
			'return_value' => 'custom',
			'render_type' => 'ui',
		];

		$fields['font_size'] = [
			'label' => _x( 'Size', 'Typography Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'size_units' => [ 'px', 'em', 'rem' ],
			'range' => [
				'px' => [
					'min' => 1,
					'max' => 200,
				],
			],
			'responsive' => true,
			'selector_value' => 'font-size: {{SIZE}}{{UNIT}}',
		];

		$default_fonts = get_option( 'elementor_default_generic_fonts', 'Sans-serif' );

		if ( $default_fonts ) {
			$default_fonts = ', ' . $default_fonts;
		}

		$fields['font_family'] = [
			'label' => _x( 'Family', 'Typography Control', 'elementor' ),
			'type' => Controls_Manager::FONT,
			'default' => '',
			'selector_value' => 'font-family: "{{VALUE}}"' . $default_fonts . ';',
		];

		$typo_weight_options = [ '' => __( 'Default', 'elementor' ) ];

		foreach ( array_merge( [ 'normal', 'bold' ], range( 100, 900, 100 ) ) as $weight ) {
			$typo_weight_options[ $weight ] = ucfirst( $weight );
		}

		$fields['font_weight'] = [
			'label' => _x( 'Weight', 'Typography Control', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => '',
			'options' => $typo_weight_options,
		];

		$fields['text_transform'] = [
			'label' => _x( 'Transform', 'Typography Control', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => '',
			'options' => [
				'' => __( 'Default', 'elementor' ),
				'uppercase' => _x( 'Uppercase', 'Typography Control', 'elementor' ),
				'lowercase' => _x( 'Lowercase', 'Typography Control', 'elementor' ),
				'capitalize' => _x( 'Capitalize', 'Typography Control', 'elementor' ),
				'none' => _x( 'Normal', 'Typography Control', 'elementor' ),
			],
		];

		$fields['font_style'] = [
			'label' => _x( 'Style', 'Typography Control', 'elementor' ),
			'type' => Controls_Manager::SELECT,
			'default' => '',
			'options' => [
				'' => __( 'Default', 'elementor' ),
				'normal' => _x( 'Normal', 'Typography Control', 'elementor' ),
				'italic' => _x( 'Italic', 'Typography Control', 'elementor' ),
				'oblique' => _x( 'Oblique', 'Typography Control', 'elementor' ),
			],
		];

		$fields['line_height'] = [
			'label' => _x( 'Line-Height', 'Typography Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'default' => [
				'unit' => 'em',
			],
			'range' => [
				'px' => [
					'min' => 1,
				],
			],
			'responsive' => true,
			'size_units' => [ 'px', 'em' ],
			'selector_value' => 'line-height: {{SIZE}}{{UNIT}}',
		];

		$fields['letter_spacing'] = [
			'label' => _x( 'Letter Spacing', 'Typography Control', 'elementor' ),
			'type' => Controls_Manager::SLIDER,
			'range' => [
				'px' => [
					'min' => -5,
					'max' => 10,
					'step' => 0.1,
				],
			],
			'responsive' => true,
			'selector_value' => 'letter-spacing: {{SIZE}}{{UNIT}}',
		];

		return $fields;
	}

	protected function prepare_fields( $fields ) {
		array_walk( $fields, function( &$field, $field_name ) {
			if ( 'typography' === $field_name ) {
				return;
			}

			$selector_value = ! empty( $field['selector_value'] ) ? $field['selector_value'] : str_replace( '_', '-', $field_name ) . ': {{VALUE}};';

			$field['selectors'] = [
				'{{SELECTOR}}' => $selector_value,
			];

			$field['condition'] = [
				'typography' => [ 'custom' ],
			];
		} );

		return parent::prepare_fields( $fields );
	}

	protected function add_group_args_to_field( $control_id, $field_args ) {
		$field_args = parent::add_group_args_to_field( $control_id, $field_args );

		$args = $this->get_args();

		if ( in_array( $control_id, self::get_scheme_fields_keys() ) && ! empty( $args['scheme'] ) ) {
			$field_args['scheme'] = [
				'type' => self::get_type(),
				'value' => $args['scheme'],
				'key' => $control_id,
			];
		}

		return $field_args;
	}
}
