<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Cache;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Loader;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group prop-type-migrations
 */
class Test_Migrations_Orchestrator extends Elementor_Test_Base {
	private const TRANSIENT_KEY = 'elementor_migrations_manifest';

	public function setUp(): void {
		parent::setUp();
		$this->seed_manifest_transient();
	}

	public function tearDown(): void {
		delete_transient( self::TRANSIENT_KEY );
		Migrations_Orchestrator::destroy();
		parent::tearDown();
	}

	public function test_invalidates_manifest_when_elementor_is_updated() {
		// Arrange
		$this->assertNotFalse( get_transient( self::TRANSIENT_KEY ), 'Transient should be seeded before the test.' );

		// Act
		Migrations_Orchestrator::maybe_invalidate_manifest_on_upgrade( null, [
			'action'  => 'update',
			'type'    => 'plugin',
			'bulk'    => true,
			'plugins' => [ 'elementor/elementor.php' ],
		] );

		// Assert
		$this->assertFalse( get_transient( self::TRANSIENT_KEY ) );
	}

	public function test_invalidates_manifest_when_elementor_pro_is_updated() {
		// Act
		Migrations_Orchestrator::maybe_invalidate_manifest_on_upgrade( null, [
			'action'  => 'update',
			'type'    => 'plugin',
			'bulk'    => true,
			'plugins' => [ 'elementor-pro/elementor-pro.php' ],
		] );

		// Assert
		$this->assertFalse( get_transient( self::TRANSIENT_KEY ) );
	}

	public function test_invalidates_manifest_when_elementor_is_part_of_bulk_update() {
		// Act
		Migrations_Orchestrator::maybe_invalidate_manifest_on_upgrade( null, [
			'action'  => 'update',
			'type'    => 'plugin',
			'bulk'    => true,
			'plugins' => [
				'akismet/akismet.php',
				'elementor/elementor.php',
				'hello-dolly/hello.php',
			],
		] );

		// Assert
		$this->assertFalse( get_transient( self::TRANSIENT_KEY ) );
	}

	public function test_does_not_invalidate_manifest_for_unrelated_plugin_update() {
		// Act
		Migrations_Orchestrator::maybe_invalidate_manifest_on_upgrade( null, [
			'action'  => 'update',
			'type'    => 'plugin',
			'bulk'    => true,
			'plugins' => [ 'akismet/akismet.php' ],
		] );

		// Assert
		$this->assertNotFalse( get_transient( self::TRANSIENT_KEY ) );
	}

	public function test_does_not_invalidate_manifest_for_theme_update() {
		// Act
		Migrations_Orchestrator::maybe_invalidate_manifest_on_upgrade( null, [
			'action' => 'update',
			'type'   => 'theme',
			'themes' => [ 'twentytwentyfour' ],
		] );

		// Assert
		$this->assertNotFalse( get_transient( self::TRANSIENT_KEY ) );
	}

	public function test_does_not_invalidate_manifest_for_core_update() {
		// Act
		Migrations_Orchestrator::maybe_invalidate_manifest_on_upgrade( null, [
			'action' => 'update',
			'type'   => 'core',
		] );

		// Assert
		$this->assertNotFalse( get_transient( self::TRANSIENT_KEY ) );
	}

	public function test_does_not_invalidate_manifest_when_plugins_key_is_missing() {
		// Act
		Migrations_Orchestrator::maybe_invalidate_manifest_on_upgrade( null, [
			'action' => 'update',
			'type'   => 'plugin',
		] );

		// Assert
		$this->assertNotFalse( get_transient( self::TRANSIENT_KEY ) );
	}

	public function test_does_not_invalidate_manifest_when_plugins_key_is_empty() {
		// Act
		Migrations_Orchestrator::maybe_invalidate_manifest_on_upgrade( null, [
			'action'  => 'update',
			'type'    => 'plugin',
			'plugins' => [],
		] );

		// Assert
		$this->assertNotFalse( get_transient( self::TRANSIENT_KEY ) );
	}

	public function test_does_not_invalidate_manifest_when_type_key_is_missing() {
		// Act
		Migrations_Orchestrator::maybe_invalidate_manifest_on_upgrade( null, [
			'plugins' => [ 'elementor/elementor.php' ],
		] );

		// Assert
		$this->assertNotFalse( get_transient( self::TRANSIENT_KEY ) );
	}

	public function test_invalidation_resets_loader_singleton_in_memory() {
		// Arrange
		$loader_before = Migrations_Loader::make( Migrations_Orchestrator::MIGRATIONS_URL );

		// Act
		Migrations_Orchestrator::maybe_invalidate_manifest_on_upgrade( null, [
			'action'  => 'update',
			'type'    => 'plugin',
			'bulk'    => true,
			'plugins' => [ 'elementor/elementor.php' ],
		] );

		$loader_after = Migrations_Loader::make( Migrations_Orchestrator::MIGRATIONS_URL );

		// Assert
		$this->assertNotSame( $loader_before, $loader_after, 'A fresh loader instance should be created after invalidation.' );
	}

	private function seed_manifest_transient(): void {
		set_transient( self::TRANSIENT_KEY, [
			'version'  => Migrations_Cache::get_version_fingerprint(),
			'manifest' => [
				'widgetKeys' => [],
				'propTypes'  => [],
			],
		], HOUR_IN_SECONDS );
	}
}
