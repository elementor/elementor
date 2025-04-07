<?php

namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\Global_Classes_Cleanup;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Core\Base\Document;

class Test_Global_Classes_Cleanup extends Elementor_Test_Base {
	private $post_ids = [];

	private $mock_global_classes = [
		'items' => [
			'g-4-123' => [
				'type' => 'class',
				'id' => 'g-4-123',
				'label' => 'pinky',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'mobile',
							'state' => null,
						],
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => 'pink',
							],
						],
					],
				],
			],
			'g-4-124' => [
				'id' => 'g-4-124',
				'type' => 'class',
				'label' => 'bluey',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => 'blue',
							]
						],
					],
				],
			],
		],
		'order' => ['g-4-124', 'g-4-123'],
	];

	private $mock_elementor_data = [
		[
			'id' => 'abc123',
			'elType' => 'e-div-block',
			'settings' => [
				'classes' => [
					'value' => ['g-4-123', 'e-4-124']
				]
			],
			'elements' => [
				[
					'id' => 'def456',
					'elType' => 'e-div-block',
					'settings' => [
						'classes' => [
							'value' => ['g-4-124', 'g-4-123', 'e-4-1222']
						]
					],
					'elements' => [
						[
							'id' => 'ghi789',
							'elType' => 'e-heading',
							'settings' => [
								'classes' => [
									'value' => ['g-4-123', 'e-4-1222']
								]
							],
						],
						[
							'id' => 'jkl10122',
							'elType' => 'widget',
							'widgetType' => 'e-heading',
							'settings' => [],
						],
						[
							'id' => 'jkl101',
							'elType' => 'widget',
							'widgetType' => 'heading',
							'settings' => [],
						]
					],
				],
			],
		],
	];

	public function setUp(): void {
		parent::setUp();

		Plugin::$instance->kits_manager->create_new_kit( 'kit' );

		Global_Classes_Repository::make()->put(
			$this->mock_global_classes['items'],
			$this->mock_global_classes['order'],
		);

        remove_all_actions( 'elementor/global_classes/update' );

	}

	public function tear_down() {
		( new Global_Classes_Repository() )->put( [], [] );

		foreach ( $this->post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}

		$this->post_ids = [];

		parent::tear_down();
	}

	public function test_no_deleted_global_classes() {
		// Arrange.
		$global_classes_cleanup = new Global_Classes_Cleanup();
		$global_classes_cleanup->register_hooks();

		$post_id = $this->make_mock_post_with_elements( $this->mock_elementor_data );

		// Act.
		do_action( 'elementor/global_classes/update', Global_Classes_Repository::CONTEXT_FRONTEND, $this->mock_global_classes, $this->mock_global_classes );

		// Assert.
        $document = Plugin::$instance->documents->get( $post_id );
        $elements_data = $document->get_json_meta( Document::ELEMENTOR_DATA_META_KEY );

        $this->assertEquals( $this->mock_elementor_data, $elements_data );

	}

    public function test_deleted_global_classes() {
        // Arrange.
        $global_classes_cleanup = new Global_Classes_Cleanup();
        $global_classes_cleanup->register_hooks();

        $post_id = $this->make_mock_post_with_elements( $this->mock_elementor_data );

        $new_global_classes = [
            'items' => array_filter(
                $this->mock_global_classes['items'],
                fn( $item ) => 'g-4-123' !== $item['id']
            ),
            'order' => array_filter(
                $this->mock_global_classes['order'],
                fn( $item ) => 'g-4-123' !== $item
            ),
        ];

        // Act.
        do_action( 'elementor/global_classes/update', Global_Classes_Repository::CONTEXT_FRONTEND, $new_global_classes, $this->mock_global_classes );

        // Assert.
        $document = Plugin::$instance->documents->get( $post_id );
        $elements_data = $document->get_json_meta( Document::ELEMENTOR_DATA_META_KEY );

        $this->assertEquals( $elements_data, [
            [
                'id' => 'abc123',
                'elType' => 'e-div-block',
                'settings' => [
                    'classes' => [
                        'value' => ['e-4-124']
                    ]
                ],
                'elements' => [
                    [
                        'id' => 'def456',
                        'elType' => 'e-div-block',
                        'settings' => [
                            'classes' => [
                                'value' => ['g-4-124', 'e-4-1222']
                            ]
                        ],
                        'elements' => [
                            [
                                'id' => 'ghi789',
                                'elType' => 'e-heading',
                                'settings' => [
                                    'classes' => [
                                        'value' => ['e-4-1222']
                                    ]
                                ],
                            ],
                            [
                                'id' => 'jkl10122',
                                'elType' => 'widget',
                                'widgetType' => 'e-heading',
                                'settings' => [],
                            ],
                            [
                                'id' => 'jkl101',
                                'elType' => 'widget',
                                'widgetType' => 'heading',
                                'settings' => [],
                            ]
                        ],
                    ],
                ],
            ],
        ]);
    }


	private function make_mock_post_with_elements( $elements_data ) {
		$document = $this->factory()->documents->create_and_get( [
			'post_title' => 'Test Post',
			'post_status' => 'publish',
		] );

		$document->update_json_meta( '_elementor_data', $elements_data );

		$this->post_ids[] = $document->get_main_id();

		return $document->get_main_id();
	}
}
