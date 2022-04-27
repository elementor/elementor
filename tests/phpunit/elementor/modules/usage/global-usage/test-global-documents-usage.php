<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Usage\GlobalUsage;

use Elementor\Modules\Usage\GlobalUsage\Global_Documents_Usage;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Global_Documents_Usage extends Elementor_Test_Base {

	public function test_save_global() {
		// Arrange.
		$document = $this->factory()->create_post();
		$document->save( [
			'settings' => [
				'background_background' => 'red',
			],
		] );

		$global_settings_page_usage = new Global_Documents_Usage();

		// Assert current.
		$this->assertEqualSets( [
			'wp-post' => [
				'background_background' => 1,
			],
		], $global_settings_page_usage->create_from_global()->get_collection()->all() );


		// Act - add & save, manually add the same document to global usage.
		$global_settings_page_usage->add( $document );
		$global_settings_page_usage->save_global();

		// That's why it will be 2. since we are testing functionality of `save_global`.
		// Assert.
		$this->assertEqualSets( [
			'wp-post' => [
				'background_background' => 2,
			],
		], $global_settings_page_usage->create_from_global()->get_collection()->all() );
	}

	public function test_remove() {
		// Arrange.
		$document = $this->factory()->create_post();
		$document->save( [
			'settings' => [
				'background_background' => 'red',
			],
		] );

		$global_settings_page_usage = new Global_Documents_Usage();

		// Assert current.
		$this->assertEqualSets( [
			'wp-post' => [
				'background_background' => 1,
			],
		], $global_settings_page_usage->create_from_global()->get_collection()->all() );

		// Act - remove & save, manually add the same document to global usage.
		$global_settings_page_usage->remove( $document );
		$global_settings_page_usage->save_global();

		// That's why it will be 2. since we are testing functionality of `save_global`.
		// Assert.
		$this->assertEmpty( $global_settings_page_usage->create_from_global()->get_collection()->all() );
	}
}
