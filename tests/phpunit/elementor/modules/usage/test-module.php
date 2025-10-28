<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Usage;

use Elementor\Modules\Usage\Module;
use Elementor\Plugin;
use Elementor\Settings;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Tests\Phpunit\Elementor\Modules\Usage\DynamicTags\Link;
use Elementor\Tests\Phpunit\Elementor\Modules\Usage\DynamicTags\Title;
use ElementorEditorTesting\Factories\Documents;

class Test_Module extends Elementor_Test_Base {
	/**
	 * TODO: Remove - Backwards compatibility.
	 *
	 * @var array
	 */
	static $document_mock_default = [
		'settings' => [
			'post_status' => 'publish',
		],
		'elements' => [
			[
				'id' => 'd50d8c5',
				'elType' => 'section',
				'isInner' => false,
				'settings' => [],
				'elements' => [
					[
						'id' => 'a2e9b68',
						'elType' => 'column',
						'isInner' => false,
						'settings' => [ '_column_size' => 100, ],
						'elements' => [
							[
								'id' => '5a1e8e5',
								'elType' => 'widget',
								'isInner' => false,
								'settings' => [ 'text' => 'I\'m not a default', ],
								'elements' => [],
								'widgetType' => 'button',
							],
						],
					],
				],
			],
		],
	];

	public static $document_mock_default_with_container = [
		'settings' => [
			'post_status' => 'publish',
		],
		'elements' => [
			[
				'id' => 'd50d8c5',
				'elType' => 'container',
				'isInner' => false,
				'settings' => [
					'container_type' => 'grid',
					'presetTitle' => 'Container',
					'presetIcon' => 'eicon-container',
				],
				'elements' => [
					[
						'id' => 'a2e9b68',
						'elType' => 'container',
						'isInner' => false,
						'settings' => [
							'presetTitle' => 'Container',
							'presetIcon' => 'eicon-container',
						],
						'elements' => [
							[
								'id' => '5a1e8e5',
								'elType' => 'container',
								'settings' => [
									'presetTitle' => 'Container',
									'presetIcon' => 'eicon-container',
								],
								'isInner' => false,
								'elements' => [],
							],
							[
								'id' => 'b0bf8fd',
								'elType' => 'container',
								'settings' => [
									'presetTitle' => 'Container',
									'presetIcon' => 'eicon-container',
								],
								'isInner' => false,
								'elements' => [
									[
										'id' => '5a1e8e5',
										'elType' => 'widget',
										'isInner' => false,
										'settings' => [ 'text' => 'I\'m not a default', ],
										'elements' => [],
										'widgetType' => 'button',
									],
								],
							],
						],
					],
				],
			],
		],
	];

	/**
	 * @var array
	 */
	public static $document_mock_nested_tabs = [
		'settings' => [
			'post_status' => 'publish',
		],
		'elements' => [
			[
				'id' => '96a5894',
				'elType' => 'container',
				'settings' => [],
				'elements' => [
					[
						'id' => 'fecdc45',
						'elType' => 'widget',
						'widgetType' => 'nested-tabs',
						'settings' => [
							'tabs' => [
								[
									'tab_title' => 'Tab #1',
									'_id' => '477a473',
									'tab_icon' => '',
								],
								[
									'tab_title' => 'Tab #2',
									'_id' => '4fb407a',
									'tab_icon' => '',
								],
								[
									'tab_title' => 'Tab #3',
									'_id' => '59f7a8a',
									'tab_icon' => '',
								],
							],
						],
						'elements' => [
							[
								'id' => 'cfe8a34',
								'elType' => 'container',
								'settings' => [
									'_title' => 'Tab #1',
									'content_width' => 'full',
								],
								'elements' => [
									[
										'id' => '43454c4',
										'elType' => 'container',
										'settings' => [],
										'elements' => [],
										'isInner' => false,
									],
								],
								'isInner' => false,
								'isLocked' => true,
							],
							[
								'id' => '06b8b26',
								'elType' => 'container',
								'settings' => [
									'_title' => 'Tab #2',
									'content_width' => 'full',
								],
								'elements' => [],
								'isInner' => false,
								'isLocked' => true,
							],
							[
								'id' => 'de89d62',
								'elType' => 'container',
								'settings' => [
									'_title' => 'Tab #3',
									'content_width' => 'full',
								],
								'elements' => [],
								'isInner' => false,
								'isLocked' => true,
							],
						],
					],
				],
				'isInner' => false,
			],
		],
	];

	/**
	 * @var array
	 */
	public static $document_mock_flex_gap = [
		'settings' => [
			'post_status' => 'publish',
		],
		'elements' => [
			[
				'id' => '145b8fc',
				'elType' => 'container',
				'settings' => [
					'flex_gap' => [
						'unit' => 'px',
						'size' => 99,
						'sizes' => [],
					],
					'flex_gap_tablet' => [
						'unit' => 'px',
						'size' => 88,
						'sizes' => [],
					],
					'flex_gap_mobile' => [
						'unit' => 'px',
						'size' => 77,
						'sizes' => [],
					],
				],
				'elements' => [
					[
						'id' => 'e1f0015',
						'elType' => 'container',
						'settings' => [
							'flex_gap' => [
								'unit' => 'px',
								'size' => 66,
								'sizes' => [],
							],
							'flex_gap_tablet' => [
								'unit' => 'px',
								'size' => 55,
								'sizes' => [],
							],
							'flex_gap_mobile' => [
								'unit' => 'px',
								'size' => 44,
								'sizes' => [],
							],
						],
					],
				],
				'isInner' => false,
			],
		],
	];

	/**
	 * @var Module
	 */
	private $module;

	/**
	 * @var bool
	 */
	private $isDynamicTags = false;

	public function setUp(): void {
		parent::setUp();

		$this->act_as_admin();

		$this->module = $module = Module::instance();
	}

	public function test_get_doc_type_count() {
		// Arrange.
		$doc_type = self::factory()->documents->publish_and_get()->get_name();
		$doc_class = Plugin::$instance->documents->get_document_type( $doc_type );

		// Act.
		$doc_count = $this->module->get_doc_type_count( $doc_class, $doc_type );

		// Assert.
		$this->assertEquals( 1, $doc_count );
	}

	public function test_get_formatted_usage() {
		// Arrange.
		$document = self::factory()->documents->publish_and_get();

		// Act.
		$formatted_usage = $this->module->get_formatted_usage();

		// Check if button exist and it value is `1`.
		$this->assertEquals( 1, $formatted_usage[ $document->get_name() ]['elements']['Button'] );
	}

	public function test_recalc_usage() {
		// Arrange.
		$document = $this->factory()->documents->publish_and_get();
		$this->factory()->documents->publish_and_get();

		// Clear global usage.
		update_option( Module::OPTION_NAME, [] );

		// Act.
		$this->module->recalc_usage();


		// Assert.
		$this->assertEquals( 2, $this->get_global_usage_by_document( $document )['button']['count'] );
	}

	public function test_add_to_global() {
		// Act.
		$document = $this->factory()->documents->publish_and_get();

		// Assert.
		$this->assertTrue( !! $this->get_global_usage_by_document( $document ) );
	}

	public function test_add_to_global__ensure_elements() {
		// Arrange.
		$count = 2;
		for ( $i = 0 ; $i != $count; $i++ ) {
			// Act.
			$document = $this->factory()->documents->publish_and_get();

			// Assert.
			$global_document_usage = $this->get_global_usage_by_document( $document );
			$this->assertEquals( $i + 1, $global_document_usage['button']['count'] );
		}
	}

	public function test_add_to_global__ensure_elements__from_same_document() {
		// Act.
		$document = $this->factory()->documents->publish_with_duplicated_widget();

		// Assert.
		$global_document_usage = $this->get_global_usage_by_document( $document );
		$this->assertEquals( 2, $global_document_usage['button']['count'] );
	}

	public function test_add_to_global__ensure_controls() {
		// Arrange.
		$count = 2;
		for ( $i = 0 ; $i != $count; $i++ ) {
			// Act.
			$document = $this->factory()->documents->publish_and_get();

			// Assert.
			$global_document_usage = $this->get_global_usage_by_document( $document );
			$this->assertEquals( $i + 1, $global_document_usage['button']['controls']['content']['section_button']['text'] );
		}
	}

	public function test_remove_from_global() {
		// Arrange.
		$document = $this->factory()->documents->publish_and_get();

		// Assert.
		$this->assertTrue( !! $this->get_global_usage_by_document( $document ) );

		// Act.
		wp_delete_post( $document->get_id(), true );

		// Assert.
		$this->assertFalse( !! $this->get_global_usage_by_document( $document ) );
	}

	public function test_remove_from_global__ensure_elements() {
		// Arrange.
		$count = 2;
		$documents = [];

		for ( $i = 0 ; $i < $count; $i++ ) {
			$documents [] = $this->factory()->documents->publish_and_get();
		}

		$i = count( $documents );
		foreach ( $documents as $document ) {
			// Assert.
			$global_document_usage = $this->get_global_usage_by_document( $document );
			$this->assertEquals( $i, $global_document_usage['button']['count'] );

			// Act.
			wp_delete_post( $document->get_id(), true );


			$i--;
		}
	}

	public function test_remove_from_global__ensure_elements_from_same_document() {
		// Arrange.
		$document = $this->factory()->documents->publish_with_duplicated_widget();
		$elementor_data = $document->get_json_meta( '_elementor_data' );

		$section = &$elementor_data[ 0 ];
		$column = &$section['elements'][ 0 ];

		unset( $column['elements'][ 1 ] );

		// Act.
		$document->save( [
			'settings' => [
				'post_status' => 'publish'
			],
			'elements' => $elementor_data,
		] );

		// Assert.
		$global_document_usage = $this->get_global_usage_by_document( $document );
		$this->assertEquals( 1, $global_document_usage['button']['count'] );
	}

	public function test_remove_from_global__ensure_controls() {
		// Arrange.
		$count = 2;
		$documents = [];

		for ( $i = 0 ; $i < $count; $i++) {
			$documents [] = $this->factory()->documents->publish_and_get();
		}

		foreach ( $documents as $document ) {
			// Assert.
			$global_document_usage = $this->get_global_usage_by_document( $document );
			$this->assertEquals( $count, $global_document_usage['button']['controls']['content']['section_button']['text'] );

			// Act.
			wp_delete_post( $document->get_id(), true );

			$count--;
		}
	}

	public function test_remove_from_global__ensure_dynamic_controls() {
		// Arrange.
		$this->ensure_dynamic_tags();

		$count = 2;
		$documents = [];

		for ( $i = 0 ; $i < $count; $i++) {
			$document = $this->factory()->documents->publish_and_get( [
				'meta_input' => [
					'_elementor_data' => Documents::DOCUMENT_DATA_MOCK_WITH_DYNAMIC_WIDGET,
				]
			] );

			$documents [] = $document;
		}

		foreach ( $documents as $document ) {
			$global_document_usage = $this->get_global_usage_by_document( $document );

			$link_controls_count = $global_document_usage['heading']['controls']['content']['section_title']['link'];
			$title_controls_count = $global_document_usage['heading']['controls']['content']['section_title']['link'];

			// Assert.
			$this->assertEquals( $count, $link_controls_count );
			$this->assertEquals( $count, $title_controls_count );
			$this->assertEquals( $link_controls_count + $title_controls_count,
				$global_document_usage['heading']['controls']['general']['__dynamic__']['count']
			);

			// Act.
			wp_delete_post( $document->get_id(), true );

			$count--;
		}
	}

	public function test_remove_from_global__ensure_elements_removed_by_empty_document() {
		// Arrange.
		$document = $this->factory()->documents->publish_and_get();

		// Act.
		$document->save( Documents::DOCUMENT_DATA_MOCK_WITHOUT_ELEMENTS );

		// Assert.
		$this->assertFalse( !! $this->get_global_usage_by_document( $document ) );
	}

	public function test_remove_from_global__ensure__draft_removed_and_can_be_republished() {
		// Arrange.
		$document = self::factory()->documents->publish_and_get();

		// Act - Put to draft.
		self::factory()->documents->update_object( $document->get_id(), [
			'post_status' => 'draft'
		] );

		// Assert.
		$this->assertFalse( !! $this->get_global_usage_by_document( $document ) );

		// Act - Put to published.
		self::factory()->documents->update_object( $document->get_id(), [
			'post_status' => 'publish'
		] );

		// Assert.
		$this->assertTrue( !! $this->get_global_usage_by_document( $document ) );
	}

	public function test_remove_from_global__ensure_draft_removed_and_private_can_be_republished() {
		// Arrange.
		$document = self::factory()->documents->publish_and_get();

		// Act - Put to draft.
		self::factory()->documents->update_object( $document->get_id(), [
			'post_status' => 'draft'
		] );

		// Assert.
		$this->assertFalse( !! $this->get_global_usage_by_document( $document ) );

		// Act - Put to published.
		self::factory()->documents->update_object( $document->get_id(), [
			'post_status' => 'private'
		] );

		// Assert.
		$this->assertTrue( !! $this->get_global_usage_by_document( $document ) );
	}

	// Cover issue: 'Widgets count shows negative values in some cases'.
	public function test_remove_from_global__ensure_autosave_not_affecting() {
		// Arrange - Create additional document in order that after remove from global the usage will not be empty.
		$this->factory()->documents->publish_and_get(); // Adds one button.
		$document = $this->factory()->documents->publish_and_get(); // Adds another one button

		// Act - Create document using autosave.
		$document->get_autosave( 0, true )->save( Documents::DEFAULT_DOCUMENT_DATA_MOCK );

		// Assert - Still only two buttons.
		$this->assertEquals( 2, $this->get_global_usage_by_document( $document )['button']['count'] );
	}

	public function test_save_document_usage() {
		// Arrange.
		$document = $this->factory()->documents->publish_and_get();

		// Act.
		$usage = $document->get_meta( Module::META_KEY );

		// Assert.
		$this->assertEquals( 1, $usage['button']['count'] );
	}

	private function get_global_usage_by_document( $document ) {
		$global_usage = get_option( Module::OPTION_NAME, [] );

		$document_name = $document->get_name();
		if ( ! empty( $global_usage[ $document_name] ) ) {
			$global_usage = $global_usage[ $document_name ];
		}

		return $global_usage;
	}

	private function ensure_dynamic_tags() {
		if ( ! $this->isDynamicTags ) {
			Plugin::$instance->dynamic_tags->register( new Title() );
			Plugin::$instance->dynamic_tags->register( new Link() );

			$this->isDynamicTags = true;
		}
	}

	public function test_get_settings_usage() {
		// Arrange.
		update_option( 'elementor_disable_color_schemes', 'no' );
		update_option( 'elementor_editor_break_lines', '1' );

		// Default value should not exist in the result
		update_option( 'elementor_css_print_method', 'external' );

		// Not an Elementor option should not exist in the result
		update_option( Settings::UPDATE_TIME_FIELD, time() );

		// Act
		$settings_usage = Module::get_settings_usage();

		// Assert
		$this->assertEquals( 'no', $settings_usage['disable_color_schemes'] );
		$this->assertEquals( '1', $settings_usage['editor_break_lines'] );

		$this->assertArrayNotHasKey( 'css_print_method', $settings_usage );
		$this->assertArrayNotHasKey( Settings::UPDATE_TIME_FIELD, $settings_usage );
	}

	/**
	 * Test atomic widget usage counter with nested properties and arrays.
	 */
	public function test_atomic_widget_usage_counter_with_nested_styles() {
		// Arrange.
		$document = $this->factory()->documents->publish_and_get( [
			'meta_input' => [
				'_elementor_data' => self::get_atomic_widget_payload_with_complex_styles(),
			]
		] );

		// Act.
		$usage = $document->get_meta( Module::META_KEY );

		// Assert - Check that e-heading widget is tracked.
		$this->assertArrayHasKey( 'e-heading', $usage );
		$this->assertEquals( 1, $usage['e-heading']['count'] );

		// Assert - Check that general controls are counted.
		$this->assertArrayHasKey( 'controls', $usage['e-heading'] );
		$this->assertArrayHasKey( 'General', $usage['e-heading']['controls'] );

		// Assert - Check that style controls are counted.
		$this->assertArrayHasKey( 'Style', $usage['e-heading']['controls'] );
		$style_controls = $usage['e-heading']['controls']['Style'];

		// Assert - Check for basic style properties.
		$this->assertArrayHasKey( 'Background', $style_controls );
		$this->assertArrayHasKey( 'Typography', $style_controls );
	}

	/**
	 * Test atomic widget usage counter counts nested array items.
	 */
	public function test_atomic_widget_usage_counter_counts_array_items() {
		// Arrange.
		$document = $this->factory()->documents->publish_and_get( [
			'meta_input' => [
				'_elementor_data' => self::get_atomic_widget_payload_with_complex_styles(),
			]
		] );

		// Act.
		$usage = $document->get_meta( Module::META_KEY );

		// Assert - Check that background-overlay array items are counted.
		$style_controls = $usage['e-heading']['controls']['Style'];
		$this->assertArrayHasKey( 'Background', $style_controls );

		// The background overlay has 3 items (2 images + 1 color), all should be counted.
		$background_controls = $style_controls['Background'];
		$this->assertTrue(
			! empty( $background_controls['background-background-overlay-background-image-overlay-image-size'] ) ||
			! empty( $background_controls['background-background-color-overlay-color'] ),
			'Background overlay items should be counted'
		);
	}

	/**
	 * Test atomic widget usage counter with custom CSS.
	 */
	public function test_atomic_widget_usage_counter_with_custom_css() {
		// Arrange.
		$document = $this->factory()->documents->publish_and_get( [
			'meta_input' => [
				'_elementor_data' => self::get_atomic_widget_payload_with_custom_css(),
			]
		] );

		// Act.
		$usage = $document->get_meta( Module::META_KEY );

		// Assert - Check that custom CSS is tracked in Style tab.
		$this->assertArrayHasKey( 'e-heading', $usage );
		$style_controls = $usage['e-heading']['controls']['Style'];
		$this->assertArrayHasKey( 'Custom CSS', $style_controls );
		$this->assertEquals( 1, $style_controls['Custom CSS']['custom_css'] );
	}

	/**
	 * Test atomic widget usage counter with general settings.
	 */
	public function test_atomic_widget_usage_counter_tracks_general_settings() {
		// Arrange.
		$document = $this->factory()->documents->publish_and_get( [
			'meta_input' => [
				'_elementor_data' => self::get_atomic_widget_payload_with_complex_styles(),
			]
		] );

		// Act.
		$usage = $document->get_meta( Module::META_KEY );

		// Assert - Check that general settings (tag, title) are tracked.
		$style_controls = $usage['e-heading']['controls']['General'];
		$this->assertArrayHasKey( 'Settings', $style_controls );
		$this->assertArrayHasKey( 'tag', $style_controls['Settings'] );

		$this->assertArrayHasKey( 'Content', $style_controls );
		$this->assertArrayHasKey( 'title', $style_controls['Content'] );
	}

	/**
	 * Get atomic widget payload with complex nested styles.
	 *
	 * @return array
	 */
	private static function get_atomic_widget_payload_with_complex_styles() {
		return [
			[
				'id' => '736802e',
				'elType' => 'container',
				'settings' => [],
				'elements' => [
					[
						'id' => 'bf895cd',
						'elType' => 'widget',
						'settings' => [
							'classes' => [
								'$$type' => 'classes',
								'value' => [
									'e-bf895cd-acc0fb9',
									'g-2095820',
								],
							],
							'tag' => [
								'$$type' => 'string',
								'value' => 'h3',
							],
							'title' => [
								'$$type' => 'string',
								'value' => 'This is a title 123',
							],
						],
						'elements' => [],
						'widgetType' => 'e-heading',
						'styles' => [
							'e-bf895cd-acc0fb9' => [
								'id' => 'e-bf895cd-acc0fb9',
								'label' => 'local',
								'type' => 'class',
								'variants' => [
									[
										'meta' => [
											'breakpoint' => 'desktop',
											'state' => null,
										],
										'props' => [
											'color' => [
												'$$type' => 'color',
												'value' => '#15ec2c',
											],
											'background' => [
												'$$type' => 'background',
												'value' => [
													'color' => [
														'$$type' => 'color',
														'value' => '#d01414',
													],
													'background-overlay' => [
														'$$type' => 'background-overlay',
														'value' => [
															[
																'$$type' => 'background-image-overlay',
																'value' => [
																	'image' => [
																		'$$type' => 'image',
																		'value' => [
																			'src' => [
																				'$$type' => 'image-src',
																				'value' => [
																					'id' => [
																						'$$type' => 'image-attachment-id',
																						'value' => 108,
																					],
																					'url' => null,
																				],
																			],
																			'size' => [
																				'$$type' => 'string',
																				'value' => 'large',
																			],
																		],
																	],
																],
															],
															[
																'$$type' => 'background-image-overlay',
																'value' => [
																	'image' => [
																		'$$type' => 'image',
																		'value' => [
																			'src' => [
																				'$$type' => 'image-src',
																				'value' => [
																					'id' => [
																						'$$type' => 'image-attachment-id',
																						'value' => 12,
																					],
																					'url' => null,
																				],
																			],
																			'size' => [
																				'$$type' => 'string',
																				'value' => 'large',
																			],
																		],
																	],
																],
															],
															[
																'$$type' => 'background-color-overlay',
																'value' => [
																	'color' => [
																		'$$type' => 'color',
																		'value' => '#21a4b5cf',
																	],
																],
															],
														],
													],
												],
											],
										],
										'custom_css' => [
											'raw' => 'YmFja2dyb3VuZC1jb2xvcjogcmVkOw==',
										],
									],
								],
							],
						],
						'editor_settings' => [],
						'version' => '0.0',
					],
				],
				'isInner' => false,
			],
		];
	}

	/**
	 * Get atomic widget payload with custom CSS.
	 *
	 * @return array
	 */
	private static function get_atomic_widget_payload_with_custom_css() {
		return [
			[
				'id' => '736802e',
				'elType' => 'container',
				'settings' => [],
				'elements' => [
					[
						'id' => 'bf895cd',
						'elType' => 'widget',
						'settings' => [
							'tag' => [
								'$$type' => 'string',
								'value' => 'h2',
							],
							'title' => [
								'$$type' => 'string',
								'value' => 'Title with Custom CSS',
							],
						],
						'elements' => [],
						'widgetType' => 'e-heading',
						'styles' => [
							'e-bf895cd-css' => [
								'id' => 'e-bf895cd-css',
								'label' => 'local',
								'type' => 'class',
								'variants' => [
									[
										'meta' => [
											'breakpoint' => 'desktop',
											'state' => null,
										],
										'props' => [
											'color' => [
												'$$type' => 'color',
												'value' => '#333333',
											],
										],
										'custom_css' => [
											'raw' => 'Zm9udC13ZWlnaHQ6IGJvbGQ7IHBhZGRpbmc6IDEwcHg7',
										],
									],
								],
							],
						],
						'editor_settings' => [],
						'version' => '0.0',
					],
				],
				'isInner' => false,
			],
		];
	}
}
