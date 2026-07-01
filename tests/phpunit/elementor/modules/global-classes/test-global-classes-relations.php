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

		// Without elementor_data, get_styles_by_post would short-circuit before
		// reaching get_document_for_post — inject meta so the full path runs.
		add_post_meta( $post_id, '_elementor_used_global_class_preview', 'g-123' );
		update_post_meta( $post_id, '_elementor_global_class_usage_indexed_preview', '1' );

		wp_delete_post( $post_id, true );
		$this->flush_documents_cache();

		// documents->get() returns false (not null) for a deleted post;
		// that false is what the ?? null bug passes through as the ?Document return.
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
