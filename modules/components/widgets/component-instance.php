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

	// public function get_settings( $setting = null ) {
	// 	$settings = parent::get_settings( $setting );

	// 	$component_id = $settings['component_instance']['value']['component_id']['value'] ?? null;
	// 	$instance_id = $this->get_id();

	// 	if ( ! $component_id ) {
	// 		return $settings;
	// 	}

	// 	switch ( $component_id ) {
	// 		// case 3059:
	// 		// $overrides = $this->get_overrides_3059($instance_id);
	// 		// break;
	// 		// // btn
	// 		// case 3076:
	// 		// $overrides = $this->get_overridable_overrides_3076($instance_id);
	// 		// break;

	// 		case 3181:
	// 			$overrides = $this->get_overrides_for_styled_button( $instance_id );
	// 			break;
	// 		case 3199:
	// 			$overrides = $this->get_overrides_for_card( $instance_id );
	// 			break;
	// 		case 3239:
	// 			$overrides = $this->get_overrides_for_cards_accordion( $instance_id );
	// 			break;
	// 		default:
	// 			$overrides = [];
	// 			break;
	// 	}

	// 	$settings['component_instance']['value']['overrides'] = $overrides;

	// 	return $settings;
	// }

	private function get_overrides_for_cards_accordion( $instance_id ) {
		$californication_image_id = 3191;
		$pina_colada_image_id = 3250;
		$mojito_image_id = 3249;

		$first_card_instance_id = '9e67369';
		$second_card_instance_id = 'c37a872';
		$third_card_instance_id = '6ab307c';

		return [
			'$$type' => 'overrides',
			'value' => [
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'prop-1765388406486-drc0fpe',
						'override_value' => [
							'$$type' => 'string',
							'value' => 'The Cocktail Lounge',
						],
						'schema_source' => [
							'type' => 'component',
							'id' => 3239,
						],
					],
				],
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'prop-1765388423234-kte80aq',
						'override_value' => [
							'$$type' => 'string',
							'value' => 'Experience the newest additions of the cocktail lounge.',
						],
						'schema_source' => [
							'type' => 'component',
							'id' => 3239,
						],
					],
				],
				// overrides for first card instance
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'madeup-override-for-card-title' . $first_card_instance_id,
						'override_value' => [
							'$$type' => 'string',
							'value' => 'Californication',
						],
						'schema_source' => [
							'type' => 'component',
							'id' => 3239,
						],
					],
				],
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'madeup-override-for-card-image' . $first_card_instance_id,
						'override_value' => [
							'$$type' => 'image',
							'value' => [
								'src' => [
									'$$type' => 'image-src',
									'value' => [
										'id' => $californication_image_id,
										'url' => null,
									],
								],
							],
						],
						'schema_source' => [
							'type' => 'component',
							'id' => 3239,
						],
					],
				],
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'madeup-override-for-button-link' . $first_card_instance_id,
						'override_value' => [
							'$$type' => 'link',
							'value' => [
								'destination' => [
									'$$type' => 'url',
									'value' => 'https://www.thebottleclub.com/blogs/recipes/californication-cocktail-recipe',
								],
								'isTargetBlank' => true,
							],
						],
						'schema_source' => [
							'type' => 'component',
							'id' => 3239,
						],
					],
				],
				// overrides for second card instance
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'madeup-override-for-card-title' . $second_card_instance_id,
						'override_value' => [
							'$$type' => 'string',
							'value' => 'Pina Colada',
						],
						'schema_source' => [
							'type' => 'component',
							'id' => 3239,
						],
					],
				],
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'madeup-override-for-card-image' . $second_card_instance_id,
						'override_value' => [
							'$$type' => 'image',
							'value' => [
								'src' => [
									'$$type' => 'image-src',
									'value' => [
										'id' => $pina_colada_image_id,
										'url' => null,
									],
								],
							],
						],
						'schema_source' => [
							'type' => 'component',
							'id' => 3239,
						],
					],
				],
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'madeup-override-for-button-link' . $second_card_instance_id,
						'override_value' => [
							'$$type' => 'link',
							'value' => [
								'destination' => [
									'$$type' => 'url',
									'value' => 'https://vanillaandbean.com/fresh-pina-colada/',
								],
								'isTargetBlank' => true,
							],
						],
						'schema_source' => [
							'type' => 'component',
							'id' => 3239,
						],
					],
				],
				// overrides for third card instance
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'madeup-override-for-card-title' . $third_card_instance_id,
						'override_value' => [
							'$$type' => 'string',
							'value' => 'Mojito',
						],
						'schema_source' => [
							'type' => 'component',
							'id' => 3239,
						],
					],
				],
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'madeup-override-for-card-image' . $third_card_instance_id,
						'override_value' => [
							'$$type' => 'image',
							'value' => [
								'src' => [
									'$$type' => 'image-src',
									'value' => [
										'id' => $mojito_image_id,
										'url' => null,
									],
								],
							],
						],
						'schema_source' => [
							'type' => 'component',
							'id' => 3239,
						],
					],
				],
				// [
				// '$$type' => 'override',
				// 'value' => [
				// 'override_key' => "madeup-override-for-button-link" . $third_card_instance_id,
				// 'override_value' => [
				// '$$type' => 'link',
				// 'value' => [
				// 'destination' => [
				// '$$type' => 'url',
				// 'value' => 'https://www.loveandlemons.com/mojito-recipe/',
				// ],
				// 'isTargetBlank' => true,
				// ],
				// ],
				// 'schema_source' => [
				// 'type' => 'component',
				// 'id' => 3239,
				// ],
				// ],
				// ],
			],
		];
	}

	private function get_overrides_for_card( $instance_id ) {
		$forth_card_instance_id = '2fa9315';
		$negroni_image_id = 3255;

		switch ( $instance_id ) {
			case $forth_card_instance_id:
				$image_override_value = [
					'$$type' => 'image',
					'value' => [
						'src' => [
							'$$type' => 'image-src',
							'value' => [
								'id' => $negroni_image_id,
								'url' => null,
							],
						],
					],
				];
				$title_override_value = [
					'$$type' => 'string',
					'value' => 'Negroni',
				];
				$button_link_override_value = [
					'$$type' => 'link',
					'value' => [
						'destination' => [
							'$$type' => 'url',
							'value' => 'https://cookidoo.com.au/recipes/recipe/en-AU/r408276',
						],
						'isTargetBlank' => true,
					],
				];
				break;
			default:
				$image_override_value = null;
				$title_override_value = null;
				$button_link_override_value = null;
				break;
		}

		return [
			'$$type' => 'overrides',
			'value' => [
				[
					'$$type' => 'overridable',
					'value' => [
						'override_key' => 'madeup-override-for-card-image' . $instance_id,
						'origin_value' => [
							'$$type' => 'override',
							'value' => [
								'override_key' => 'prop-1765388360002-x4es95b',
								'override_value' => $image_override_value,
								'schema_source' => [
									'type' => 'component',
									'id' => 3199,
								],
							],
						],
					],
				],
				[
					'$$type' => 'overridable',
					'value' => [
						'override_key' => 'madeup-override-for-card-title' . $instance_id,
						'origin_value' => [
							'$$type' => 'override',
							'value' => [
								'override_key' => 'prop-1765388333485-4zj8554',
								'override_value' => $title_override_value,
								'schema_source' => [
									'type' => 'component',
									'id' => 3199,
								],
							],
						],
					],
				],
				[
					'$$type' => 'overridable',
					'value' => [
						'override_key' => 'madeup-override-for-button-link' . $instance_id,
						'origin_value' => [
							'$$type' => 'override',
							'value' => [
								'override_key' => 'madeup-override-for-button-link',
								'override_value' => $button_link_override_value,
								'schema_source' => [
									'type' => 'component',
									'id' => 3199,
								],
							],
						],
					],
				],
			],
		];
	}

	private function get_overrides_for_styled_button( $instance_id ) {
		return [
			'$$type' => 'overrides',
			'value' => [
				[
					'$$type' => 'overridable',
					'value' => [
						'override_key' => 'madeup-override-for-button-text',
						'origin_value' => [
							'$$type' => 'override',
							'value' => [
								'override_key' => 'prop-1765388284202-a9uogbh',
								'override_value' => [
									'$$type' => 'string',
									'value' => 'Learn More',
								],
								'schema_source' => [
									'type' => 'component',
									'id' => 3181,
								],
							],
						],
					],
				],
				[
					'$$type' => 'overridable',
					'value' => [
						'override_key' => 'madeup-override-for-button-link',
						'origin_value' => [
							'$$type' => 'override',
							'value' => [
								'override_key' => 'prop-1765390126288-ejypv25',
								'override_value' => null,
								'schema_source' => [
									'type' => 'component',
									'id' => 3181,
								],
							],
						],
					],
				],
			],
		];
	}

	private function get_overrides_3059( $instance_id ) {
		// my comp

		$first_instance_id = '0ea9a96';
		$second_instance_id = 'ed9f416';

		if ( $instance_id === $first_instance_id ) {
			$title = 'My new title - first';
			$title_tag = 'h1';
			$first_button_text = 'First Button 🔴';
			$second_button_text = 'Second Button 🔴';
		} elseif ( $instance_id === $second_instance_id ) {
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

	private function get_overrides_3076( $instance_id ) {
		// btn

		$first_instance_id = 'fab70db';
		$second_instance_id = 'b56b4c0';

		if ( $instance_id === $first_instance_id ) {
			$text = 'First button text';
		} elseif ( $instance_id === $second_instance_id ) {
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

	private function get_overridable_overrides_3076( $instance_id ) {
		// btn

		$first_instance_id = 'fab70db';
		$second_instance_id = 'b56b4c0';

		if ( $instance_id === $first_instance_id ) {
			$text = 'First button text';
			$link = 'https://en.wikipedia.org/wiki/1st_(album)';
		} elseif ( $instance_id === $second_instance_id ) {
			$text = 'Second button text';
			$link = 'https://en.wikipedia.org/wiki/Second';
		} else {
			$text = 'Button text';
			$link = 'https://en.wikipedia.org';
		}

		return [
			'$$type' => 'overrides',
			'value' => [
				[
					'$$type' => 'overridable',
					'value' => [
						'override_key' => 'madeup-override-key-' . ( $instance_id === $first_instance_id ? 'first' : 'second' ),
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
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'prop-1765354768294-mwp6ezi',
						'override_value' => [
							'$$type' => 'link',
							'value' => [
								'destination' => [
									'$$type' => 'url',
									'value' => $link,
								],
								// 'isTargetBlank' => true,
							],
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
}
