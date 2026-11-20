<?php
namespace Elementor\Tests\Phpunit\Elementor\App\ImportExportCustomization\Processes;

use Elementor\App\Modules\ImportExportCustomization\Processes\Export;
use Elementor\App\Modules\ImportExportCustomization\Runners\Export\Export_Runner_Base;
use ElementorEditorTesting\Elementor_Test_Base;

/**
 * @group Elementor
 * @group Elementor/ImportExportCustomization
 * @group Elementor/ImportExportCustomization/Processes
 *
 * @group kit-import-export-customization
 */
class Test_Export_Runner_Order extends Elementor_Test_Base {
	public function test_get_sorted_runners__keeps_registration_order_for_default_priority() {
		// Arrange
		$export = new Export();
		$export->register( new Fake_Export_Runner_Templates() );
		$export->register( new Fake_Export_Runner_Components() );
		$export->register( new Fake_Export_Runner_Global_Classes() );

		// Act
		$result = array_keys( $this->invoke_method( $export, 'get_sorted_runners' ) );

		// Assert
		$this->assertSame( [ 'templates', 'components', 'global-classes' ], $result );
	}

	public function test_get_sorted_runners__sorts_by_priority_override() {
		// Arrange
		$export = new Export();
		$export->register( new Fake_Export_Runner_Templates(), 10 );
		$export->register( new Fake_Export_Runner_Components(), -5 );
		$export->register( new Fake_Export_Runner_Global_Classes(), -10 );

		// Act
		$result = array_keys( $this->invoke_method( $export, 'get_sorted_runners' ) );

		// Assert
		$this->assertSame( [ 'global-classes', 'components', 'templates' ], $result );
	}

	public function test_register__moves_runner_to_new_priority_bucket_without_duplicates() {
		// Arrange
		$export = new Export();
		$export->register( new Fake_Export_Runner_Templates() );
		$export->register( new Fake_Export_Runner_Components() );
		$export->register( new Fake_Export_Runner_Templates(), -10 );

		// Act
		$result = array_keys( $this->invoke_method( $export, 'get_sorted_runners' ) );

		// Assert
		$this->assertSame( [ 'templates', 'components' ], $result );
	}

	public function test_remove_runner__removes_runner_and_priority_lookup_entries() {
		// Arrange
		$export = new Export();
		$export->register( new Fake_Export_Runner_Templates(), -10 );
		$export->register( new Fake_Export_Runner_Components(), 10 );

		// Act
		$this->invoke_method( $export, 'remove_runner', [ 'templates' ] );

		// Assert
		$this->assertSame( [ 'components' ], array_keys( $this->invoke_method( $export, 'get_sorted_runners' ) ) );
		$this->assertArrayNotHasKey( 'templates', $this->get_property( $export, 'runner_priorities' ) );
	}

	private function invoke_method( object $object, string $method_name, array $arguments = [] ) {
		$method = new \ReflectionMethod( $object, $method_name );
		$method->setAccessible( true );

		return $method->invokeArgs( $object, $arguments );
	}

	private function get_property( object $object, string $property_name ) {
		$property = new \ReflectionProperty( $object, $property_name );
		$property->setAccessible( true );

		return $property->getValue( $object );
	}
}

abstract class Fake_Export_Runner_Base extends Export_Runner_Base {
	public function should_export( array $data ) {
		return true;
	}

	public function export( array $data ) {
		return [
			'manifest' => [],
			'files' => [],
		];
	}
}

class Fake_Export_Runner_Templates extends Fake_Export_Runner_Base {
	public static function get_name(): string {
		return 'templates';
	}
}

class Fake_Export_Runner_Components extends Fake_Export_Runner_Base {
	public static function get_name(): string {
		return 'components';
	}
}

class Fake_Export_Runner_Global_Classes extends Fake_Export_Runner_Base {
	public static function get_name(): string {
		return 'global-classes';
	}
}
