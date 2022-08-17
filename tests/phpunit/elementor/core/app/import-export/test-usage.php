<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\App\ImportExport;

use Elementor\Core\App\Modules\ImportExport\Usage;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Usage extends Elementor_Test_Base {

	public function setUp()
	{
		parent::setUp();

		remove_all_filters('elementor/tracker/send_tracking_data_params');

		(new Usage())->register();
	}

	public function test_get_usage_data__without_any_data()	{
		// Act.
		$usage = apply_filters('elementor/tracker/send_tracking_data_params', []);

		// Assert
		$import_export_usage = $usage['usages']['import_export'];

		$this->assertEquals( [], $import_export_usage['revert'] );
	}

	public function test_get_usage_data__adds_usage_without_delete_existing() {
		// Arrange.
		update_option( 'elementor_revert_sessions', [
			[
				'kit_name' => 'Kit Name',
				'kit_id' => 'Kit ID',
				'source' => 'Source',
				'revert_timestamp' => time(),
				'import_timestamp' => time() - 100,
			],
		] );

		$expected_usage_data = [
			[
				'kit_name' => 'Kit Name',
//				'kit_id' => 'Kit ID',
				'source' => 'Source',
				'revert_timestamp' => time(),
				'total_time' => 100,
			],
		];

		// Act.
		$usage = apply_filters( 'elementor/tracker/send_tracking_data_params', [
			'usages' => [],
			'something-that-should-stay' => 123,
		] );

		// Assert.
		$this->assertTrue( is_array( $usage['usages'] ) );
		$this->assertTrue( is_array( $usage['usages']['import_export'] ) );
		$this->assertEquals( 123, $usage['something-that-should-stay'] );

		$this->assertEquals( $expected_usage_data, $usage['usages']['import_export']['revert'] );
	}
}
