<?php
namespace Elementor\Tests\Phpunit\Elementor\App\ImportExport;

use Elementor\App\Modules\ImportExport\Module;
use Elementor\App\Modules\ImportExport\Usage;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Usage extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		remove_all_filters( 'elementor/tracker/send_tracking_data_params' );

		( new Usage() )->register();
	}

	public function test_get_usage_data__without_any_data()	{
		// Act.
		$usage = apply_filters( 'elementor/tracker/send_tracking_data_params', [] );

		// Assert.
		$import_export_usage = $usage['usages']['import_export'];

		$this->assertEquals( [], $import_export_usage['revert'] );
	}

	public function test_get_usage_data__adds_usage_without_delete_existing() {
		// Arrange.
		$now = time();

		update_option( Module::OPTION_KEY_ELEMENTOR_REVERT_SESSIONS, [
			[
				'kit_name' => 'Kit Name',
				'source' => 'Source',
				'import_timestamp' => $now - 100,
				'revert_timestamp' => $now,
			],
		] );

		// Act.
		$usage = apply_filters( 'elementor/tracker/send_tracking_data_params', [
			'usages' => [
				'something-that-should-stay' => 123,
			],
			'something-that-should-stay' => 456,
		] );

		// Assert.
		$this->assertTrue( is_array( $usage['usages'] ) );
		$this->assertTrue( is_array( $usage['usages']['import_export'] ) );
		$this->assertEquals( 123, $usage['usages']['something-that-should-stay'] );
		$this->assertEquals( 456, $usage['something-that-should-stay'] );

		$expected_usage_data = [
			[
				'kit_name' => 'Kit Name',
				'source' => 'Source',
				'revert_timestamp' => $now,
				'total_time' => 100,
			],
		];

		$this->assertEquals( $expected_usage_data, $usage['usages']['import_export']['revert'] );
	}
}
