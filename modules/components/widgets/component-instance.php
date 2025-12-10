<?php
namespace Elementor\Modules\Components\Widgets;

use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Template;
use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Component_Instance extends Atomic_Widget_Base {
	use Has_Template;

	public static function get_element_type(): string {
		return 'e-component';
	}

	public function show_in_panel() {
		return false;
	}

	public function get_title() {
		return esc_html__( 'Component', 'elementor' );
	}

	public function get_keywords() {
		return [ 'component' ];
	}

	public function get_icon() {
		return 'eicon-components';
	}

	protected static function define_props_schema(): array {
		return [
			'component_instance' => Component_Instance_Prop_Type::make()->required(),
		];
	}

	protected function parse_editor_settings( array $data ): array {
		$editor_data = parent::parse_editor_settings( $data );

		if ( isset( $data['component_uid'] ) && is_string( $data['component_uid'] ) ) {
			$editor_data['component_uid'] = sanitize_text_field( $data['component_uid'] );
		}

		return $editor_data;
	}

	protected function define_atomic_controls(): array {
		return [];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/component' => __DIR__ . '/component.html.twig',
		];
	}

	// protected function define_render_context(): array {
	// 	$component_instance = $this->get_atomic_setting( 'component_instance' );
	// 	$overrides = $component_instance['overrides']['value'] ?? [];

	// 	return [ 'overrides' => $overrides ];
	// }

	public function get_settings( $setting = null ) {
		$settings = parent::get_settings( $setting );

		$component_id = $settings['component_instance']['value']['component_id']['value'] ?? null;
		$instance_id = $this->get_id();

		if ( ! $component_id ) {
			return $settings;
		}

		switch ( $component_id ) {
			case 3059:
				$overrides = $this->get_overrides_3059($instance_id);
				break;
			// btn
			case 3076:
				$overrides = $this->get_overridable_overrides_3076($instance_id);
				break;
			default:
				$overrides = [];
				break;
		}

		$settings['component_instance']['value']['overrides'] = $overrides;

		return $settings;
	}

	private function get_overrides_3059($instance_id) {
		// my comp

		$first_instance_id = '0ea9a96';
		$second_instance_id = 'ed9f416';

		if ( $instance_id === $first_instance_id ) {
			$title = 'My new title - first';
			$title_tag = 'h1';
			$first_button_text = 'First Button 🔴';
			$second_button_text = 'Second Button 🔴';
		} else if ( $instance_id === $second_instance_id ) {
			$title = 'My new title - second';
			$title_tag = 'h3';
			$first_button_text = 'First Button 🟢';
			$second_button_text = 'Second Button 🟢';
		} else {
			$title = 'My new title - default';
			$title_tag = 'h6';
			$first_button_text = 'First Button 🟡';
			$second_button_text = 'Second Button 🟡';
		}


		return [
			'$$type' => 'overrides',
			'value' => [
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'prop-1765272165324-n5vf1l0',
						'override_value' => [
							'$$type' => 'string',
							'value' => $title,
						],
						'schema_source' => [
							'type' => 'component',
							'id' => 3059,
						],
					],
				],
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'prop-1765272255288-62lh8ds',
						'override_value' => [
							'$$type' => 'string',
							'value' => $title_tag,
						],
						'schema_source' => [
							'type' => 'component',
							'id' => 3059,
						],
					],
				],
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'madeup-override-key-first',
						'override_value' => [
							'$$type' => 'string',
							'value' => $first_button_text,
						],
						'schema_source' => [
							'type' => 'component',
							'id' => 3059,
						],
					],
				],
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'madeup-override-key-second',
						'override_value' => [
							'$$type' => 'string',
							'value' => $second_button_text,
						],
						'schema_source' => [
							'type' => 'component',
							'id' => 3059,
						],
					],
				],
			],
		];
	}

	private function get_overrides_3076($instance_id) {
		// btn

		$first_instance_id = 'fab70db';
		$second_instance_id = 'b56b4c0';

		if ( $instance_id === $first_instance_id ) {
			$text = 'First button text';
		} else if ( $instance_id === $second_instance_id ) {
			$text = 'Second button text';
		} else {
			$text = 'Button text';
		}

		return [
			'$$type' => 'overrides',
			'value' => [
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'prop-1765289267702-ydp9ugh',
						'override_value' => [
							'$$type' => 'string',
							'value' => $text,
						],
						'schema_source' => [
							'type' => 'component',
							'id' => 3076,
						],
					],
				],
			],
		];
	}

	private function get_overridable_overrides_3076($instance_id) {
		// btn

		$first_instance_id = 'fab70db';
		$second_instance_id = 'b56b4c0';

		if ( $instance_id === $first_instance_id ) {
			$text = 'First button text';
		} else if ( $instance_id === $second_instance_id ) {
			$text = 'Second button text';
		} else {
			$text = 'Button text';
		}

		return [
			'$$type' => 'overrides',
			'value' => [
				[
					'$$type' => 'overridable',
					'value' => [
						'override_key' => 'madeup-override-key' . '-' . ( $instance_id === $first_instance_id ? 'first' : 'second' ),
						'origin_value' => [
							'$$type' => 'override',
							'value' => [
								'override_key' => 'prop-1765289267702-ydp9ugh',
								'override_value' => [
									'$$type' => 'string',
									'value' => $text,
								],
								'schema_source' => [
									'type' => 'component',
									'id' => 3076,
								],
							],
						],
					],
				],
			],
		];
	}
}
