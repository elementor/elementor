<?php
namespace Elementor\Testing\Modules\Components;

use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Testing\Modules\Components\Mocks\Nested_Components_Mocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/mocks/nested-components/nested-components-mocks.php';

// This is an integration test as multiple classes are involved in the component rendering process.
class Test_Components_Overrides_Rendering extends Elementor_Test_Base {

	private $button_component_id = 1111;
    private $card_component_id = 2222;
    private $card_accordion_component_id = 3333;

	public function setUp(): void {
		parent::setUp();

		// Register the component document type
		Plugin::$instance->documents->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);

		// Register post type for components
		register_post_type( Component_Document::TYPE, [
			'label' => Component_Document::get_title(),
			'labels' => Component_Document::get_labels(),
			'public' => false,
			'supports' => Component_Document::get_supported_features(),
		] );

		$button_component_data = Nested_Components_Mocks::get_button_component_data();
		$card_component_data = Nested_Components_Mocks::get_card_component_data();
		$card_accordion_component_data = Nested_Components_Mocks::get_card_accordion_component_data();

		$this->create_test_component( 'Button Component', $button_component_data, $this->button_component_id );
		$this->create_test_component( 'Card Component', $card_component_data, $this->card_component_id );
		$this->create_test_component( 'Card Accordion Component', $card_accordion_component_data, $this->card_accordion_component_id );
	}

	public function tearDown(): void {
		parent::tearDown();
		$this->clean_up_components();
	}

    private function get_rendered_component( array $instance_data ) {
        ob_start();

        $element = Plugin::$instance->elements_manager->create_element_instance( $instance_data );

        if ( $element ) {
            $element->print_element();
        }

        $result = ob_get_clean();

        $dom = new \DOMDocument();
        $dom->loadHTML( $result );

        return $dom;
    }

    public function test_render_component_with_overridable_props_without_overrides() {
        // Arrange.
        $instance_data = [
            'id' => 'f95d8ae',
            'elType' => 'widget',
            'widgetType' => 'e-component',
            'elements' => [],
            'settings' => [
                'component_instance' => [
                    '$$type' => 'component-instance',
                    'value' => [
                        'component_id' => [
                            '$$type' => 'number',
                            'value' => $this->button_component_id,
                        ],
                    ],
                ],
            ],
            'styles' => [],
        ];

        // Act
        $dom = $this->get_rendered_component( $instance_data );

        // Assert
        $a_elements = $dom->getElementsByTagName('a');
    
        $this->assertEquals(1, $a_elements->length, 'No <a> tag found');
        
        $button = $a_elements->item(0);
        
        $this->assertEquals('https://test-link.com', $button->getAttribute('href'));
        $this->assertEquals('_self', $button->getAttribute('target'));
        $this->assertEquals('Click here', trim($button->textContent));
    }

    public function test_render_component_with_overridable_props_with_overrides() {
        // Arrange.
        $instance_data = [
            'id' => 'f95d8ae',
            'elType' => 'widget',
            'widgetType' => 'e-component',
            'elements' => [],
            'styles' => [],
            'settings' => [
                'component_instance' => [
                    '$$type' => 'component-instance',
                    'value' => [
                        'component_id' => [
                            '$$type' => 'number',
                            'value' => $this->button_component_id,
                        ],
                        'overrides' => [
                            '$$type' => 'overrides',
                            'value' => [
                                [
                                    '$$type' => 'override',
                                    'value' => [
                                        'override_key' => 'prop-0',
                                        'override_value' => [
                                            '$$type' => 'string',
                                            'value' => 'New button text',
                                        ],
                                        'schema_source' => [
                                            'type' => 'component',
                                            'id' => $this->button_component_id,
                                        ],
                                    ],
                                ],
                                [
                                    '$$type' => 'override',
                                    'value' => [
                                        'override_key' => 'prop-1',
                                        'override_value' => [
                                            '$$type' => 'link',
                                            'value' => [
                                                'destination' => [
                                                    '$$type' => 'url',
                                                    'value' => 'https://new-link.com',
                                                ],
                                                'isTargetBlank' => [
                                                    '$$type' => 'boolean',
                                                    'value' => true,
                                                ],
                                            ],
                                        ],
                                        'schema_source' => [
                                            'type' => 'component',
                                            'id' => $this->button_component_id,
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ]
        ];

        // Act
        $dom = $this->get_rendered_component( $instance_data );

        // Assert
        $a_elements = $dom->getElementsByTagName('a');
    
        $this->assertEquals(1, $a_elements->length, 'No <a> tag found');
        
        $button = $a_elements->item(0);
        
        $this->assertEquals('https://new-link.com', $button->getAttribute('href'));
        $this->assertEquals('_blank', $button->getAttribute('target'));
        $this->assertEquals('New button text', trim($button->textContent));
    }

    public function test_render_nested_components_with_overridable_overrides() {
        // Arrange.
        $accordion_title = 'Card accordion title';
        $accordion_subtitle = 'Card accordion subtitle';

        $first_card_background_image_url = 'https://example.com/first-card-background-image.jpg';
        $first_card_title = 'First card title';
        $first_card_button_text = 'First card button text';
        $first_card_button_link = 'https://first-card-button-link.com';

        $second_card_background_image_url = 'https://example.com/second-card-background-image.jpg';
        $second_card_title = 'Second card title';
        $second_card_button_link = 'https://second-card-button-link.com';

        $card_default_button_text = 'Learn more';

        $instance_data = [
            'id' => '0bf5f7e',
            'elType' => 'widget',
            'widgetType' => 'e-component',
            'elements' => [],
            'styles' => [],
            'settings' => [
                'component_instance' => [
                    '$$type' => 'component-instance',
                    'value' => [
                        'component_id' => [
                            '$$type' => 'number',
                            'value' => $this->card_accordion_component_id,
                        ],
                        'overrides' => [
                            '$$type' => 'overrides',
                            'value' => [
                                [
                                    '$$type' => 'override',
                                    'value' => [
                                        'override_key' => 'prop-6',
                                        'override_value' => [
                                            '$$type' => 'string',
                                            'value' => $accordion_title,
                                        ],
                                        'schema_source' => [
                                            'type' => 'component',
                                            'id' => $this->card_accordion_component_id,
                                        ],
                                    ],
                                ],
                                [
                                    '$$type' => 'override',
                                    'value' => [
                                        'override_key' => 'prop-7',
                                        'override_value' => [
                                            '$$type' => 'string',
                                            'value' => $accordion_subtitle,
                                        ],
                                        'schema_source' => [
                                            'type' => 'component',
                                            'id' => $this->card_accordion_component_id,
                                        ],
                                    ],
                                ],
                                [
                                    '$$type' => 'override',
                                    'value' => [
                                        'override_key' => 'prop-8',
                                        'override_value' => [
                                            '$$type' => 'image',
                                            'value' => [
                                                'src' => [
                                                    '$$type' => 'image-src',
                                                    'value' => [
                                                        'id' => null,
                                                        'url' => [
                                                            '$$type' => 'url',
                                                            'value' => $first_card_background_image_url,
                                                        ],
                                                    ],
                                                ],
                                            ],
                                        ],
                                    ],
                                    'schema_source' => [
                                        'type' => 'component',
                                        'id' => $this->card_accordion_component_id,
                                    ],
                                ],
                                [
                                    '$$type' => 'override',
                                    'value' => [
                                        'override_key' => 'prop-9',
                                        'override_value' => [
                                            '$$type' => 'string',
                                            'value' => $first_card_title,
                                        ],
                                    ],
                                    'schema_source' => [
                                        'type' => 'component',
                                        'id' => $this->card_accordion_component_id,
                                    ],
                                ],
                                [
                                    '$$type' => 'override',
                                    'value' => [
                                        'override_key' => 'prop-10',
                                        'override_value' => [
                                            '$$type' => 'string',
                                            'value' => $first_card_button_text,
                                        ],
                                        'schema_source' => [
                                            'type' => 'component',
                                            'id' => $this->card_accordion_component_id,
                                        ],
                                    ],
                                ],
                                [
                                    '$$type' => 'override',
                                    'value' => [
                                        'override_key' => 'prop-11',
                                        'override_value' => [
                                            '$$type' => 'link',
                                            'value' => [
                                                'destination' => [
                                                    '$$type' => 'url',
                                                    'value' => $first_card_button_link,
                                                ],
                                                'isTargetBlank' => [
                                                    '$$type' => 'boolean',
                                                    'value' => true,
                                                ],
                                            ],
                                        ],
                                        'schema_source' => [
                                            'type' => 'component',
                                            'id' => $this->card_accordion_component_id,
                                        ],
                                    ],
                                ],
                                [
                                    '$$type' => 'override', 
                                    'value' => [
                                        'override_key' => 'prop-12',
                                        'override_value' => [
                                            '$$type' => 'image',
                                            'value' => [
                                                'src' => [
                                                    '$$type' => 'image-src',
                                                    'value' => [
                                                        'id' => null,
                                                        'url' => [
                                                            '$$type' => 'url',
                                                            'value' => $second_card_background_image_url,
                                                        ],
                                                    ],
                                                ],
                                            ],
                                        ],
                                        'schema_source' => [
                                            'type' => 'component',
                                            'id' => $this->card_accordion_component_id,
                                        ],
                                    ],
                                ],
                                [
                                    '$$type' => 'override',
                                    'value' => [
                                        'override_key' => 'prop-13',
                                        'override_value' => [
                                            '$$type' => 'string',
                                            'value' => $second_card_title,
                                        ],
                                        'schema_source' => [
                                            'type' => 'component',
                                            'id' => $this->card_accordion_component_id,
                                        ],
                                    ],
                                ],
                                [
                                    '$$type' => 'override',
                                    'value' => [
                                        'override_key' => 'prop-15',
                                        'override_value' => [
                                            '$$type' => 'link',
                                            'value' => [
                                                'destination' => [
                                                    '$$type' => 'url',
                                                    'value' => $second_card_button_link,
                                                ],
                                                'isTargetBlank' => [
                                                    '$$type' => 'boolean',
                                                    'value' => true,
                                                ],
                                            ],
                                        ],
                                        'schema_source' => [
                                            'type' => 'component',
                                            'id' => $this->card_accordion_component_id,
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ]
        ];

        // Act
        $dom = $this->get_rendered_component( $instance_data );

        // Assert
        // Accordion title & subtitle
        $title_elements = $dom->getElementsByTagName('h2');
        $accordion_title_element = $title_elements->item(0);
        $this->assertEquals($accordion_title, trim($accordion_title_element->textContent));

        $accordion_subtitle_elements = $dom->getElementsByTagName('h4');
        $accordion_subtitle_element  = $accordion_subtitle_elements->item(0);
        $this->assertEquals($accordion_subtitle, trim($accordion_subtitle_element->textContent));

        // Cards
        $image_elements = $dom->getElementsByTagName('img');
        $button_elements = $dom->getElementsByTagName('a');

        // First card
        $first_card_background_image_element = $image_elements->item(0);
        $this->assertEquals($first_card_background_image_url, $first_card_background_image_element->getAttribute('src'));

        $first_card_title_element = $title_elements->item(1);
        $this->assertEquals($first_card_title, trim($first_card_title_element->textContent));

        $first_card_button_text_element = $button_elements->item(0);
        $this->assertEquals($first_card_button_text, trim($first_card_button_text_element->textContent));

        $first_card_button_link_element = $button_elements->item(0);
        $this->assertEquals($first_card_button_link, $first_card_button_link_element->getAttribute('href'));
        
        // Second card
        $second_card_background_image_element = $image_elements->item(1);
        $this->assertEquals($second_card_background_image_url, $second_card_background_image_element->getAttribute('src'));

        $second_card_title_element = $title_elements->item(2);
        $this->assertEquals($second_card_title, trim($second_card_title_element->textContent));

        $second_card_button_text_element = $button_elements->item(1);
        $this->assertEquals($card_default_button_text, trim($second_card_button_text_element->textContent));

        $second_card_button_link_element = $button_elements->item(1);
        $this->assertEquals($second_card_button_link, $second_card_button_link_element->getAttribute('href'));
    }

    private function create_test_component( string $name, array $data, int $id ): int {
		$this->act_as_admin();
		$document = Plugin::$instance->documents->create(
			Component_Document::get_type(),
			[
				'post_title' => $name,
				'post_status' => 'publish',
                'import_id' => $id,
			]
		);

		$document->save( [
			'elements' => $data['elements'],
            'settings' => [
                'overridable_props' => $data['overridable_props'],
            ]
		] );

		return $document->get_main_id();
	}

    private function clean_up_components() {
		// Clean up created components
		$components = get_posts( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'any',
			'posts_per_page' => -1,
		] );

		foreach ( $components as $component ) {
			wp_delete_post( $component->ID, true );
		}
	}
}
