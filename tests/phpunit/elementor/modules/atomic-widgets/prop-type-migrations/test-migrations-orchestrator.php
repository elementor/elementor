<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Mock_String_V2_Prop_Type extends String_Prop_Type {
	public static function get_key(): string {
		return 'string_v2';
	}
}

/**
 * @group prop-type-migrations
 */
class Test_Migrations_Orchestrator extends Elementor_Test_Base {
	use MatchesSnapshots;

	private const WIDGET_TYPE_HEADING = 'e-heading';
	private const WIDGET_TYPE_PARAGRAPH = 'e-paragraph';
	private const WIDGET_TYPE_GENERIC = 'e-widget';

	public static function setUpBeforeClass(): void {
		parent::setUpBeforeClass();

		if ( ! defined( 'ELEMENTOR_MIGRATIONS_PATH' ) ) {
			define( 'ELEMENTOR_MIGRATIONS_PATH', __DIR__ . '/fixtures/orchestrator/migrations/' );
		}

		Migrations_Orchestrator::destroy();
	}

	public function tearDown(): void {
		Migrations_Orchestrator::destroy();
		parent::tearDown();
	}

	private function create_element_data( string $widget_type, array $settings ): array {
		return [
			[
				'elType' => 'widget',
				'widgetType' => $widget_type,
				'settings' => $settings,
			],
		];
	}

	private function extract_settings( array $data ): array {
		return $data[0]['settings'] ?? [];
	}

	public function test_no_migration_needed_validation_passes() {
		$orchestrator = Migrations_Orchestrator::make();

		$settings = [
			'title' => [
				'$$type' => 'string',
				'value' => 'Hello World',
			],
			'count' => [
				'$$type' => 'number',
				'value' => 42,
			],
		];

		$data = $this->create_element_data( self::WIDGET_TYPE_HEADING, $settings );
		$saved_data = null;
		$save_callback = function( $migrated ) use ( &$saved_data ) {
			$saved_data = $migrated;
		};

		$orchestrator->migrate( $data, 1, $save_callback );

		$this->assertNull( $saved_data, 'No changes expected when validation passes' );
		$this->assertMatchesJsonSnapshot( $this->extract_settings( $data ) );
	}

	public function test_migration_needed_but_no_path_exists() {
		$orchestrator = Migrations_Orchestrator::make();

		$settings = [
			'title' => [
				'$$type' => 'nonexistent_type',
				'value' => 'Hello World',
			],
		];

		$data = $this->create_element_data( self::WIDGET_TYPE_HEADING, $settings );
		$saved_data = null;
		$save_callback = function( $migrated ) use ( &$saved_data ) {
			$saved_data = $migrated;
		};

		$orchestrator->migrate( $data, 2, $save_callback );

		$this->assertNull( $saved_data, 'No changes when migration path does not exist' );
		$this->assertMatchesJsonSnapshot( $this->extract_settings( $data ) );
	}

	public function test_single_prop_migration_direct_path() {
		$orchestrator = Migrations_Orchestrator::make();

		$settings = [
			'title' => [
				'$$type' => 'string',
				'value' => 'Hello World',
			],
			'count' => [
				'$$type' => 'number',
				'value' => 42,
			],
		];

		$data = $this->create_element_data( self::WIDGET_TYPE_HEADING, $settings );
		$saved_data = null;
		$save_callback = function( $migrated ) use ( &$saved_data ) {
			$saved_data = $migrated;
		};

		$orchestrator->migrate( $data, 3, $save_callback );

		$this->assertNotNull( $saved_data, 'Changes expected when prop type migration occurs' );
		$this->assertMatchesJsonSnapshot( $this->extract_settings( $data ) );
	}

	public function test_widget_level_migration_direct_path() {
		$orchestrator = Migrations_Orchestrator::make();

		$settings = [
			'title' => [
				'$$type' => 'string',
				'value' => 'Hello',
			],
			'subtitle' => [
				'$$type' => 'string',
				'value' => 'World',
			],
		];

		$data = $this->create_element_data( self::WIDGET_TYPE_HEADING, $settings );
		$saved_data = null;
		$save_callback = function( $migrated ) use ( &$saved_data ) {
			$saved_data = $migrated;
		};

		$orchestrator->migrate( $data, 4, $save_callback );

		$this->assertNotNull( $saved_data, 'Changes expected for widget-level migration' );
		$this->assertMatchesJsonSnapshot( $this->extract_settings( $data ) );
	}

	public function test_single_prop_migration_chained_path() {
		$orchestrator = Migrations_Orchestrator::make();

		$settings = [
			'description' => [
				'$$type' => 'string',
				'value' => 'test',
			],
		];

		$data = $this->create_element_data( self::WIDGET_TYPE_PARAGRAPH, $settings );
		$saved_data = null;
		$save_callback = function( $migrated ) use ( &$saved_data ) {
			$saved_data = $migrated;
		};

		$orchestrator->migrate( $data, 5, $save_callback );

		$this->assertNotNull( $saved_data, 'Changes expected for chained migration' );
		$this->assertMatchesJsonSnapshot( $this->extract_settings( $data ) );
	}

	public function test_multiple_props_migration() {
		$orchestrator = Migrations_Orchestrator::make();

		$settings = [
			'title' => [
				'$$type' => 'string',
				'value' => 'Hello',
			],
			'count' => [
				'$$type' => 'number',
				'value' => 42,
			],
			'unchanged' => [
				'$$type' => 'string',
				'value' => 'Static',
			],
		];

		$data = $this->create_element_data( self::WIDGET_TYPE_GENERIC, $settings );
		$saved_data = null;
		$save_callback = function( $migrated ) use ( &$saved_data ) {
			$saved_data = $migrated;
		};

		$orchestrator->migrate( $data, 6, $save_callback );

		$this->assertNotNull( $saved_data, 'Changes expected when multiple props migrate' );
		$this->assertMatchesJsonSnapshot( $this->extract_settings( $data ) );
	}

	public function test_widget_key_migration_upgrade() {
		$orchestrator = Migrations_Orchestrator::make();

		$settings = [
			'text' => [
				'$$type' => 'string',
				'value' => 'Hello',
			],
		];

		$data = $this->create_element_data( 'test-widget-key-upgrade', $settings );
		$saved_data = null;
		$save_callback = function( $migrated ) use ( &$saved_data ) {
			$saved_data = $migrated;
		};

		$orchestrator->migrate( $data, 7, $save_callback );

		$this->assertNotNull( $saved_data, 'Changes expected for widget key migration' );
		$this->assertMatchesJsonSnapshot( $this->extract_settings( $data ) );
	}

	public function test_widget_key_migration_downgrade() {
		$orchestrator = Migrations_Orchestrator::make();

		$settings = [
			'icon' => [
				'$$type' => 'string',
				'value' => 'logo.svg',
			],
		];

		$data = $this->create_element_data( 'test-widget-key-downgrade', $settings );
		$saved_data = null;
		$save_callback = function( $migrated ) use ( &$saved_data ) {
			$saved_data = $migrated;
		};

		$orchestrator->migrate( $data, 8, $save_callback );

		$this->assertNotNull( $saved_data, 'Changes expected for widget key downgrade' );
		$this->assertMatchesJsonSnapshot( $this->extract_settings( $data ) );
	}

	public function test_widget_key_and_prop_type_migration() {
		$orchestrator = Migrations_Orchestrator::make();

		$settings = [
			'text' => [
				'$$type' => 'string',
				'value' => 'Hello',
			],
		];

		$data = $this->create_element_data( 'test-widget-key-and-type', $settings );
		$saved_data = null;
		$save_callback = function( $migrated ) use ( &$saved_data ) {
			$saved_data = $migrated;
		};

		$orchestrator->migrate( $data, 9, $save_callback );

		$this->assertNotNull( $saved_data, 'Changes expected for key and type migration' );
		$this->assertMatchesJsonSnapshot( $this->extract_settings( $data ) );
	}

	public function test_no_widget_key_migration_when_no_path_exists() {
		$orchestrator = Migrations_Orchestrator::make();

		$settings = [
			'unknown' => [
				'$$type' => 'string',
				'value' => 'value',
			],
		];

		$data = $this->create_element_data( 'test-no-migration-path', $settings );
		$saved_data = null;
		$save_callback = function( $migrated ) use ( &$saved_data ) {
			$saved_data = $migrated;
		};

		$orchestrator->migrate( $data, 10, $save_callback );

		$this->assertNull( $saved_data, 'No changes when no migration path exists' );
		$this->assertMatchesJsonSnapshot( $this->extract_settings( $data ) );
	}

	public function test_multiple_orphaned_keys_to_one_missing_key_skips_migration() {
		$orchestrator = Migrations_Orchestrator::make();

		$settings = [
			'text' => [
				'$$type' => 'string',
				'value' => 'Hello',
			],
			'oldSize' => [
				'$$type' => 'string',
				'value' => 'large',
			],
		];

		$data = $this->create_element_data( 'test-multiple-to-one', $settings );
		$saved_data = null;
		$save_callback = function( $migrated ) use ( &$saved_data ) {
			$saved_data = $migrated;
		};

		$orchestrator->migrate( $data, 11, $save_callback );

		$this->assertNull( $saved_data, 'No changes when multiple orphaned keys target one' );
		$this->assertMatchesJsonSnapshot( $this->extract_settings( $data ) );
	}

	public function test_one_orphaned_key_with_multiple_targets_skips_migration() {
		$orchestrator = Migrations_Orchestrator::make();

		$settings = [
			'text' => [
				'$$type' => 'string',
				'value' => 'Hello',
			],
		];

		$data = $this->create_element_data( 'test-one-to-multiple', $settings );
		$saved_data = null;
		$save_callback = function( $migrated ) use ( &$saved_data ) {
			$saved_data = $migrated;
		};

		$orchestrator->migrate( $data, 12, $save_callback );

		$this->assertNull( $saved_data, 'No changes when one orphaned key has multiple targets' );
		$this->assertMatchesJsonSnapshot( $this->extract_settings( $data ) );
	}

	public function test_multiple_unambiguous_widget_key_migrations() {
		$orchestrator = Migrations_Orchestrator::make();

		$settings = [
			'text' => [
				'$$type' => 'string',
				'value' => 'Hello',
			],
			'oldSize' => [
				'$$type' => 'string',
				'value' => 'large',
			],
		];

		$data = $this->create_element_data( 'test-unambiguous-multiple', $settings );
		$saved_data = null;
		$save_callback = function( $migrated ) use ( &$saved_data ) {
			$saved_data = $migrated;
		};

		$orchestrator->migrate( $data, 13, $save_callback );

		$this->assertNotNull( $saved_data, 'Changes expected for multiple unambiguous migrations' );
		$this->assertMatchesJsonSnapshot( $this->extract_settings( $data ) );
	}
}

