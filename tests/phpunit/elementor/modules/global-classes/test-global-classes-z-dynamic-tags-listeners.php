<?php
namespace Elementor\Tests\Phpunit\Modules\GlobalClasses;

use Elementor\Modules\AtomicWidgets\DynamicTags\Dynamic_Tags_Module;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Classes_Z_Dynamic_Tags_Listeners extends Elementor_Test_Base {
	public function test_post_styles_has_dynamic_filter__reads_from_post_meta() {
		$post_id = $this->factory()->post->create();
		update_post_meta( $post_id, Dynamic_Tags_Module::META_KEY_POST_DYNAMIC, '1' );

		$result = apply_filters( 'elementor/atomic-widgets/post-styles/has-dynamic', false, $post_id );

		$this->assertTrue( $result );
	}

	public function test_post_styles_has_dynamic_filter__returns_false_when_meta_absent() {
		$post_id = $this->factory()->post->create();

		$result = apply_filters( 'elementor/atomic-widgets/post-styles/has-dynamic', false, $post_id );

		$this->assertFalse( $result );
	}

	public function test_z_document_after_save__sets_post_dynamic_meta_to_zero_for_post_without_elements() {
		$doc = $this->factory()->documents->publish_and_get();
		$post_id = $doc->get_main_post()->ID;

		do_action( 'elementor/document/after_save', $doc, [] );

		$this->assertSame( '0', get_post_meta( $post_id, Dynamic_Tags_Module::META_KEY_POST_DYNAMIC, true ) );
	}
}
