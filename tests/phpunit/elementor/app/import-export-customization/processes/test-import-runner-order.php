<?php
namespace Elementor\Tests\Phpunit\Elementor\App\ImportExportCustomization\Processes;

use Elementor\App\Modules\ImportExportCustomization\Processes\Import;
use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Import_Runner_Base;
use Elementor\Modules\Components\ImportExportCustomization\Import_Export_Customization as Components_Import_Export_Customization;
use Elementor\Modules\GlobalClasses\ImportExportCustomization\Import_Export_Customization as Global_Classes_Import_Export_Customization;
use Elementor\Modules\Variables\ImportExportCustomization\Import_Export_Customization as Variables_Import_Export_Customization;
use ElementorEditorTesting\Elementor_Test_Base;

/**
 * @group Elementor
 * @group Elementor/ImportExportCustomization
 * @group Elementor/ImportExportCustomization/Processes
 *
 * @group kit-import-export-customization
 */
class Test_Import_Runner_Order extends Elementor_Test_Base {
	public function test_get_runners_name__keeps_registration_order_for_default_priority() {
		// Arrange
		$import = $this->make_import_process();
		$import->register( new Fake_Import_Runner_Templates() );
		$import->register( new Fake_Import_Runner_Components() );
		$import->register( new Fake_Import_Runner_Global_Classes() );

		// Act
		$result = $import->get_runners_name();

		// Assert
		$this->assertSame( [ 'templates', 'components', 'global-classes' ], $result );
	}

	public function test_get_runners_name__sorts_by_priority_override() {
		// Arrange
		$import = $this->make_import_process();
		$import->register( new Fake_Import_Runner_Templates(), 10 );
		$import->register( new Fake_Import_Runner_Components(), -5 );
		$import->register( new Fake_Import_Runner_Global_Classes(), -10 );

		// Act
		$result = $import->get_runners_name();

		// Assert
		$this->assertSame( [ 'global-classes', 'components', 'templates' ], $result );
	}

	public function test_register_default_runners__applies_core_tiers() {
		// Arrange
		$import = $this->make_import_process();
		$import->register_default_runners();
		$import->register( new Fake_Import_Runner_Global_Variables(), Import::PRIORITY_GLOBAL_VARIABLES );
		$import->register( new Fake_Import_Runner_Global_Classes(), Import::PRIORITY_GLOBAL_CLASSES );
		$import->register( new Fake_Import_Runner_Components(), Import::PRIORITY_COMPONENTS );

		// Act
		$result = array_keys( $this->invoke_method( $import, 'get_sorted_runners' ) );

		// Assert
		$this->assertSame( [
			'site-settings',
			'plugins',
			'global-variables',
			'global-classes',
			'components',
			'templates',
			'taxonomies',
			'elementor-content',
			'wp-content',
			'floating-elements',
		], $result );
	}

	public function test_register__moves_runner_to_new_priority_bucket_without_duplicates() {
		// Arrange
		$import = $this->make_import_process();
		$import->register( new Fake_Import_Runner_Templates() );
		$import->register( new Fake_Import_Runner_Components() );
		$import->register( new Fake_Import_Runner_Templates(), -10 );

		// Act
		$result = $import->get_runners_name();

		// Assert
		$this->assertSame( [ 'templates', 'components' ], $result );
	}

	public function test_get_runners_name__supports_legacy_flat_runner_storage_shape() {
		// Arrange
		$import = $this->make_import_process();
		$this->set_property( $import, 'runners', [
			'templates' => new Fake_Import_Runner_Templates(),
			'components' => new Fake_Import_Runner_Components(),
			'global-classes' => new Fake_Import_Runner_Global_Classes(),
		] );

		// Act
		$result = $import->get_runners_name();

		// Assert
		$this->assertSame( [ 'templates', 'components', 'global-classes' ], $result );
	}

	public function test_is_last_runner__uses_last_active_sorted_runner() {
		// Arrange
		$import = $this->make_import_process();
		$import->register( new Fake_Import_Runner_Templates( false ), 20 );
		$import->register( new Fake_Import_Runner_Components(), -10 );
		$import->register( new Fake_Import_Runner_Global_Classes(), 10 );
		$data = $this->invoke_method( $import, 'build_runner_data' );

		// Act
		$is_components_last = $this->invoke_method( $import, 'is_last_runner', [ 'components', $data ] );
		$is_global_classes_last = $this->invoke_method( $import, 'is_last_runner', [ 'global-classes', $data ] );

		// Assert
		$this->assertFalse( $is_components_last );
		$this->assertTrue( $is_global_classes_last );
	}

	public function test_remove_runner__removes_runner_and_priority_lookup_entries() {
		// Arrange
		$import = $this->make_import_process();
		$import->register( new Fake_Import_Runner_Templates(), -10 );
		$import->register( new Fake_Import_Runner_Components(), 10 );

		// Act
		$this->invoke_method( $import, 'remove_runner', [ 'templates' ] );

		// Assert
		$this->assertSame( [ 'components' ], $import->get_runners_name() );
		$this->assertArrayNotHasKey( 'templates', $this->get_property( $import, 'runner_priorities' ) );
	}

	public function test_import_kit_hook__runs_site_settings_before_design_system_runners() {
		// Arrange
		$import = $this->make_import_process();
		$import->register_default_runners();
		( new Variables_Import_Export_Customization() )->register_hooks();
		( new Global_Classes_Import_Export_Customization() )->register_hooks();
		( new Components_Import_Export_Customization() )->register_hooks();

		do_action( 'elementor/import-export-customization/import-kit', $import );

		// Act
		$order = array_keys( $this->invoke_method( $import, 'get_sorted_runners' ) );

		// Assert
		$position = array_flip( $order );
		$this->assertLessThan( $position['global-variables'], $position['site-settings'] );
		$this->assertLessThan( $position['global-variables'], $position['plugins'] );
		$this->assertLessThan( $position['global-classes'], $position['global-variables'] );
		$this->assertLessThan( $position['components'], $position['global-classes'] );
		$this->assertLessThan( $position['templates'], $position['components'] );
		$this->assertLessThan( $position['elementor-content'], $position['components'] );
	}

	private function make_import_process(): Import {
		$reflection = new \ReflectionClass( Import::class );
		$import = $reflection->newInstanceWithoutConstructor();

		$this->set_property( $import, 'runners', [] );
		$this->set_property( $import, 'runner_priorities', [] );
		$this->set_property( $import, 'session_id', 'test-session' );
		$this->set_property( $import, 'kit_id', '' );
		$this->set_property( $import, 'adapters', [] );
		$this->set_property( $import, 'documents_data', [] );
		$this->set_property( $import, 'extracted_directory_path', '' );
		$this->set_property( $import, 'manifest', [] );
		$this->set_property( $import, 'site_settings', [] );
		$this->set_property( $import, 'settings_include', [] );
		$this->set_property( $import, 'settings_referrer', 'local' );
		$this->set_property( $import, 'settings_conflicts', [] );
		$this->set_property( $import, 'settings_selected_override_conditions', [] );
		$this->set_property( $import, 'settings_selected_custom_post_types', [] );
		$this->set_property( $import, 'settings_selected_plugins', [] );
		$this->set_property( $import, 'settings_customization', [] );
		$this->set_property( $import, 'imported_data', [] );
		$this->set_property( $import, 'runners_import_metadata', [] );

		return $import;
	}

	private function set_property( object $object, string $property_name, $value ): void {
		$property = new \ReflectionProperty( $object, $property_name );
		$property->setAccessible( true );
		$property->setValue( $object, $value );
	}

	private function get_property( object $object, string $property_name ) {
		$property = new \ReflectionProperty( $object, $property_name );
		$property->setAccessible( true );

		return $property->getValue( $object );
	}

	private function invoke_method( object $object, string $method_name, array $arguments = [] ) {
		$method = new \ReflectionMethod( $object, $method_name );
		$method->setAccessible( true );

		return $method->invokeArgs( $object, $arguments );
	}
}

abstract class Fake_Import_Runner_Base extends Import_Runner_Base {
	private bool $should_import;

	public function __construct( bool $should_import = true ) {
		$this->should_import = $should_import;
	}

	public function should_import( array $data ) {
		return $this->should_import;
	}

	public function import( array $data, array $imported_data ) {
		return [];
	}
}

class Fake_Import_Runner_Templates extends Fake_Import_Runner_Base {
	public static function get_name(): string {
		return 'templates';
	}
}

class Fake_Import_Runner_Components extends Fake_Import_Runner_Base {
	public static function get_name(): string {
		return 'components';
	}
}

class Fake_Import_Runner_Global_Variables extends Fake_Import_Runner_Base {
	public static function get_name(): string {
		return 'global-variables';
	}
}

class Fake_Import_Runner_Global_Classes extends Fake_Import_Runner_Base {
	public static function get_name(): string {
		return 'global-classes';
	}
}
