<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Usage\Collection;

use Elementor\Modules\Usage\Collection\DocumentSettingsUsage;
use ElementorEditorTesting\Elementor_Test_Base;

class TestDocumentSettingsUsage extends Elementor_Test_Base {
	const DOCUMENTS_TEST_COUNT = 2;
	const DOCUMENT_TEST_SETTINGS = [
		'background_background' => 'red',
		'hide_title' => 'yes',
	];

	private function create_document() {
		$document = $this->factory()->create_post();
		$document->save( [
			'settings' => self::DOCUMENT_TEST_SETTINGS,
		] );

		return $document;
	}

	public function test_add() {
		// Arrange.
		$collection = new DocumentSettingsUsage( [] );

		$document = $this->create_document();

		// Act.
		for( $i = 0 ; $i < self::DOCUMENTS_TEST_COUNT ; ++$i ) {
			$collection = $collection->add( $document );
		}

		// Assert - Ensure collection added.
		$this->assertEquals( self::DOCUMENTS_TEST_COUNT, $collection->get( 'wp-post' )['background_background'] );
	}

	public function test_remove() {
		// Arrange.
		$collection = new DocumentSettingsUsage( [] );

		$document = $this->create_document();

		for( $i = 0 ; $i < self::DOCUMENTS_TEST_COUNT ; ++$i ) {
			$collection = $collection->add( $document );
		}

		for( $i = self::DOCUMENTS_TEST_COUNT ; $i != 0  ; $i-- ) {
			$current = $collection->get( 'wp-post' );

			// Assert.
			$this->assertEquals( $i, $current['background_background'] );

			// Act.
			$collection = $collection->remove( $document );
		}

		// Assert - Validate nothing left.
		$this->assertEmpty( $collection->get('wp-post' ) );
	}
}
