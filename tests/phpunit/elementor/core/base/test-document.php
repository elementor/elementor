<?php

namespace Elementor\Testing\Core\Base;
use Elementor\Testing\Elementor_Test_Base;

use Elementor\Plugin;
use Elementor\Controls_Manager;

class Test_Document extends Elementor_Test_Base {

	/**
	 * @var array
	 */
	static $document_mock_default = [
		'settings' => [
			'post_status' => 'publish',
			'background_background' => 'classic',
			'background_color' => '#ffffff',
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
						'settings' => [ '_column_size' => 100 ],
						'elements' => [
							[
								'id' => '5a1e8e5',
								'elType' => 'widget',
								'settings' => [
									'style' => 'dots_tribal',
									'text' => 'Divider',
								],
								'elements' => [],
								'widgetType' => 'divider',
							],
						],
					],
				],
			],
		]
	];

	public function test_save() {
		// Arrange.
		require_once __DIR__ . '/document.php';

		$this->act_as_admin();

		$post = $this->factory()->create_and_get_default_post();

		$document = new Document( [
			'post_id' => $post->ID,
		] );

		$expected_document_settings = self::$document_mock_default['settings'];

		// The post status is not saved to the document settings in order to avoid conflicts with `wo_posts.post_status` column.
		unset( $expected_document_settings['post_status'] );

		// Act.
		$document->save( self::$document_mock_default );

		// Assert.
		$this->assertEquals( self::$document_mock_default['elements'], $document->get_elements_data() );
		$this->assertEquals( $expected_document_settings, $document->get_db_document_settings() );
	}

	// TODO: Full test of get_editor_panel_config.

	public function test_get_editor_panel_config_ensure_default_route() {
		$before_user = wp_get_current_user();

		// Set editor user.
		wp_set_current_user( $this->factory()->get_editor_user()->ID );

		$default_route_excepted = 'panel/elements/categories';
		$document = Plugin::$instance->documents->get( $this->factory()->create_and_get_default_post()->ID );

		query_posts( [
			'p' => $document->get_main_id(),
		] );

		the_post();

		$config = $document->get_config();

		$this->assertEquals( $default_route_excepted, $config['panel']['default_route'],
			"Ensure user without design restriction have '$default_route_excepted' as default route");

		add_filter( 'elementor/editor/user/restrictions', function( $restrictions ) {
			$restrictions['editor'] = [ 'design' ];

			return $restrictions;
		} );

		$default_route_excepted = 'panel/page-settings/settings';
		$document = Plugin::$instance->documents->get( $this->factory()->create_and_get_default_post()->ID );
		$config = $document->get_config();

		$this->assertEquals( $default_route_excepted, $config['panel']['default_route'],
			"Ensure user with design restriction have '$default_route_excepted' as default route");

		wp_set_current_user( $before_user->ID );
	}

	public function tearDown() {
		parent::tearDown();

		remove_action( 'elementor/element/section/section_layout/after_section_start', [ __CLASS__, 'add_external_control' ] );
	}
}
