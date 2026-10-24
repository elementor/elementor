<?php

namespace Elementor\Testing\App\Modules\ImportExportCustomization\Processes;

use Elementor\App\Modules\ImportExportCustomization\Processes\Import;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Import extends TestCase {
	public function test_get_imported_data_replacements_merges_component_mappings_into_post_ids() {
		// Arrange.
		$import = ( new \ReflectionClass( Import::class ) )->newInstanceWithoutConstructor();

		$this->set_private_property( $import, 'imported_data', [
			'templates' => [
				'succeed' => [
					11 => 111,
				],
			],
			'content' => [
				'page' => [
					'succeed' => [
						22 => 222,
					],
				],
			],
			'components' => [
				'succeed' => [
					33 => 333,
					44 => 444,
				],
			],
		] );

		// Act.
		$replacements = $this->invoke_private_method( $import, 'get_imported_data_replacements' );

		// Assert.
		$this->assertSame(
			[
				11 => 111,
				22 => 222,
				33 => 333,
				44 => 444,
			],
			$replacements['post_ids']
		);
		$this->assertSame( [], $replacements['term_ids'] );
	}

	private function set_private_property( object $instance, string $property_name, $value ): void {
		$property = new \ReflectionProperty( Import::class, $property_name );
		$property->setAccessible( true );
		$property->setValue( $instance, $value );
	}

	private function invoke_private_method( object $instance, string $method_name ) {
		$method = new \ReflectionMethod( Import::class, $method_name );
		$method->setAccessible( true );

		return $method->invoke( $instance );
	}
}
