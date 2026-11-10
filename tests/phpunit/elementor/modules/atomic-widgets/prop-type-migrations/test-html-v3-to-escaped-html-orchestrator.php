<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group prop-type-migrations
 */
class Test_Html_V3_To_Escaped_Html_Orchestrator extends Elementor_Test_Base {

	public static function setUpBeforeClass(): void {
		parent::setUpBeforeClass();
		Migrations_Orchestrator::destroy();
	}

	public function setUp(): void {
		parent::setUp();

		$widgets_manager = Plugin::$instance->widgets_manager;

		if ( ! $widgets_manager->get_widget_types( Atomic_Heading::get_element_type() ) ) {
			$widgets_manager->register( new Atomic_Heading( [], [] ) );
		}

		Migrations_Orchestrator::clear_migration_cache();
		Migrations_Orchestrator::destroy();
	}

	public function tearDown(): void {
		Migrations_Orchestrator::destroy();
		parent::tearDown();
	}

	public function test_migrate__heading_title_html_v3_is_converted_to_escaped_html() {
		// Arrange.
		$orchestrator = Migrations_Orchestrator::make( dirname( __DIR__, 6 ) . '/migrations/' );
		$document_data = [
			[
				'id' => 'heading-1',
				'elType' => 'widget',
				'widgetType' => Atomic_Heading::get_element_type(),
				'settings' => [
					'title' => [
						'$$type' => 'html-v3',
						'value' => [
							'content' => [
								'$$type' => 'string',
								'value' => 'Hello <strong>world</strong>',
							],
							'children' => [],
						],
					],
				],
			],
		];

		$save_callback_called = false;
		$save_callback = function () use ( &$save_callback_called ) {
			$save_callback_called = true;
		};

		// Act.
		$orchestrator->migrate( $document_data, 3001, 'test_html_v3_to_escaped_html', $save_callback );

		// Assert.
		$this->assertTrue( $save_callback_called );
		$this->assertSame( 'escaped-html', $document_data[0]['settings']['title']['$$type'] );
		$this->assertSame( 'Hello <strong>world</strong>', $document_data[0]['settings']['title']['value'] );
		$this->assertIsString( $document_data[0]['settings']['title']['value'] );
	}

	public function test_migrate_data__migrates_in_place_without_cache_short_circuit() {
		// Arrange.
		$orchestrator = Migrations_Orchestrator::make( dirname( __DIR__, 6 ) . '/migrations/' );
		$first = [ $this->make_heading_with_html_v3_title() ];
		$second = [ $this->make_heading_with_html_v3_title() ];

		// Act.
		$first_changed = $orchestrator->migrate_data( $first );
		$second_changed = $orchestrator->migrate_data( $second );

		// Assert.
		$this->assertTrue( $first_changed );
		$this->assertTrue( $second_changed );
		$this->assertSame( 'escaped-html', $first[0]['settings']['title']['$$type'] );
		$this->assertSame( 'escaped-html', $second[0]['settings']['title']['$$type'] );
	}

	public function test_migrate_data__returns_false_when_nothing_changes() {
		// Arrange.
		$orchestrator = Migrations_Orchestrator::make( dirname( __DIR__, 6 ) . '/migrations/' );
		$data = [ $this->make_heading_with_html_v3_title() ];
		$orchestrator->migrate_data( $data );

		// Act.
		$changed = $orchestrator->migrate_data( $data );

		// Assert.
		$this->assertFalse( $changed );
	}

	private function make_heading_with_html_v3_title(): array {
		return [
			'elType' => 'widget',
			'widgetType' => Atomic_Heading::get_element_type(),
			'settings' => [
				'title' => [
					'$$type' => 'html-v3',
					'value' => [
						'content' => [
							'$$type' => 'string',
							'value' => 'Hello',
						],
						'children' => [],
					],
				],
			],
		];
	}

	public function test_find_migration_path__escaped_html_to_html_v3_uses_down() {
		$loader = \Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Loader::make(
			dirname( __DIR__, 6 ) . '/migrations/'
		);

		$result = $loader->find_migration_path( 'escaped-html', 'html-v3' );

		$this->assertNotNull( $result );
		$this->assertSame( 'down', $result['direction'] );
		$this->assertSame( 'html-v3-to-escaped-html', $result['migrations'][0]['id'] );
	}
}
