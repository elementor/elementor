<?php

namespace Elementor\Testing\Modules\Components\ImportExportCustomization;

use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\ImportExportCustomization\Runners\Import as Import_Runner;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Import_Runner extends Elementor_Test_Base {
	public function test_should_import__returns_true_when_content_is_included_and_manifest_has_components() {
		// Arrange
		$runner = new Import_Runner();
		$data = [
			'include' => [ 'content' ],
			'manifest' => [
				'content' => [
					Component_Document::TYPE => [
						123 => [ 'title' => 'Component' ],
					],
				],
			],
			'extracted_directory_path' => '/tmp/kit/',
		];

		// Act
		$result = $runner->should_import( $data );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_should_import__returns_false_when_content_is_not_included() {
		// Arrange
		$runner = new Import_Runner();
		$data = [
			'include' => [ 'settings' ],
			'manifest' => [
				'content' => [
					Component_Document::TYPE => [
						123 => [ 'title' => 'Component' ],
					],
				],
			],
			'extracted_directory_path' => '/tmp/kit/',
		];

		// Act
		$result = $runner->should_import( $data );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_should_import__returns_false_when_manifest_has_no_components() {
		// Arrange
		$runner = new Import_Runner();
		$data = [
			'include' => [ 'content' ],
			'manifest' => [ 'content' => [] ],
			'extracted_directory_path' => '/tmp/kit/',
		];

		// Act
		$result = $runner->should_import( $data );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_import__returns_empty_result_and_creates_no_posts() {
		// Arrange
		$runner = new Import_Runner();
		$before = get_posts( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'any',
			'fields' => 'ids',
			'posts_per_page' => -1,
		] );

		// Act
		$result = $runner->import( [], [] );
		$after = get_posts( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'any',
			'fields' => 'ids',
			'posts_per_page' => -1,
		] );

		// Assert
		$this->assertSame( [], $result );
		$this->assertSame( $before, $after );
	}
}
