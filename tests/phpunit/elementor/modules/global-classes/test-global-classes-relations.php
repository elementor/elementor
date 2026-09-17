<?php

namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Global_Classes_Relations;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Classes_Relations extends Elementor_Test_Base {

	public function test_get_styles_by_post_in_preview_does_not_throw_when_document_is_deleted(): void {
		// Arrange.
		$relations = ( new Global_Classes_Relations() )->set_preview( true );

		$post_id = $this->factory()->post->create( [ 'post_status' => 'publish' ] );

		wp_delete_post( $post_id, true );
		$this->flush_documents_cache();

		$this->assertFalse( Plugin::$instance->documents->get( $post_id ) );

		$result = $relations->get_styles_by_post( $post_id );

		// Assert.
		$this->assertIsArray( $result );
		$this->assertEmpty( $result );
	}

	private function flush_documents_cache(): void {
		$reflection = new \ReflectionProperty( Plugin::$instance->documents, 'documents' );
		$reflection->setAccessible( true );
		$reflection->setValue( Plugin::$instance->documents, [] );
	}
}
