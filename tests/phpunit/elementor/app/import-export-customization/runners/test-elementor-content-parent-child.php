<?php
namespace Elementor\Tests\Phpunit\Elementor\App\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Export\Elementor_Content as Export_Elementor_Content;
use Elementor\App\Modules\ImportExportCustomization\Runners\Import\Elementor_Content as Import_Elementor_Content;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Elementor_Content_Parent_Child extends Elementor_Test_Base {

	public function test_get_imported_parent_id_returns_mapped_parent_when_available() {
		$this->act_as_admin();

		$mock_imported_data = [];
		$mock_post_settings = [
			'parent' => [
				'id' => 100,
				'title' => 'Parent Page',
				'doc_type' => 'wp-page',
			],
			'child' => [
				'id' => 200,
				'title' => 'Child Page',
				'doc_type' => 'wp-page',
				'post_parent' => 100,
			],
		];

		$importer = new Import_Elementor_Content();
		$importer->import( [
			'session_id' => 'test-session',
			'customization' => [ 'content' => null ],
		], $mock_imported_data);

		$reflection = new \ReflectionClass( $importer );
		$method = $reflection->getMethod( 'get_imported_parent_id' );
		$method->setAccessible( true );

		$property = $reflection->getProperty( 'processed_posts' );
		$property->setAccessible( true );
		$property->setValue( $importer, [ 100 => 500 ] );

		$result = $method->invoke( $importer, [ 'post_parent' => 100 ], 200 );

		$this->assertEquals( 500, $result );
	}
}
