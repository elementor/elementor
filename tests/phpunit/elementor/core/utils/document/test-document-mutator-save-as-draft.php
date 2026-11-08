<?php

namespace Elementor\Testing\Core\Utils\Document;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\PageTemplates\Module as Page_Templates_Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Document_Mutator_Save_As_Draft extends Elementor_Test_Base {

	private const NEW_ELEMENTS = [
		[
			'id' => 'e0000001',
			'elType' => 'container',
			'settings' => [],
			'elements' => [],
			'isInner' => false,
		],
	];

	private const ORIGINAL_ELEMENTS = [
		[
			'id' => 'e0000000',
			'elType' => 'container',
			'settings' => [],
			'elements' => [],
			'isInner' => false,
		],
	];

	public function test_save_as_draft__preserve_flag_on__published_post__writes_autosave_and_keeps_main_published() {
		// Arrange.
		$this->act_as_admin();
		$post = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'publish' ] );
		$document = Plugin::$instance->documents->get( $post->ID );
		$document->save( [ 'elements' => self::ORIGINAL_ELEMENTS ] );

		// Act.
		$result = Document_Mutator::instance()->save_as_draft( $document, self::NEW_ELEMENTS, true );

		// Assert.
		$this->assertInstanceOf( Document::class, $result );
		$this->assertNotEquals(
			$document->get_main_id(),
			$result->get_post()->ID,
			'save_as_draft should write to a different (autosave) post when the main post is published.'
		);
		$this->assertEquals( 'publish', get_post_status( $document->get_main_id() ) );
		$this->assertEquals( self::ORIGINAL_ELEMENTS, $document->get_elements_data() );
		$this->assertEquals( self::NEW_ELEMENTS, $result->get_elements_data() );
	}

	public function test_save_as_draft__preserve_flag_off__downgrades_publish_to_draft() {
		// Arrange.
		$this->act_as_admin();
		$post = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'publish' ] );
		$document = Plugin::$instance->documents->get( $post->ID );

		// Act.
		$result = Document_Mutator::instance()->save_as_draft( $document, self::NEW_ELEMENTS );

		// Assert.
		$this->assertTrue( $result );
		$this->assertEquals( 'draft', get_post_status( $document->get_main_id() ) );
		$this->assertEquals( self::NEW_ELEMENTS, $document->get_elements_data() );
	}

	public function test_save_as_draft__preserve_flag_off__draft_post__saves_directly() {
		// Arrange.
		$this->act_as_admin();
		$post = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'draft' ] );
		$document = Plugin::$instance->documents->get( $post->ID );

		// Act.
		$result = Document_Mutator::instance()->save_as_draft( $document, self::NEW_ELEMENTS );

		// Assert.
		$this->assertTrue( $result );
		$this->assertEquals( 'draft', get_post_status( $document->get_main_id() ) );
		$this->assertEquals( self::NEW_ELEMENTS, $document->get_elements_data() );
	}

	public function test_save_as_draft__preserve_flag_off__private_post__saves_without_downgrade() {
		// Arrange.
		$this->act_as_admin();
		$post = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'private' ] );
		$document = Plugin::$instance->documents->get( $post->ID );

		// Act.
		$result = Document_Mutator::instance()->save_as_draft( $document, self::NEW_ELEMENTS );

		// Assert.
		$this->assertTrue( $result );
		$this->assertEquals( 'private', get_post_status( $document->get_main_id() ) );
		$this->assertEquals( self::NEW_ELEMENTS, $document->get_elements_data() );
	}

	public function test_save_as_draft__preserve_flag_on__private_post__writes_autosave() {
		// Arrange.
		$this->act_as_admin();
		$post = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'private' ] );
		$document = Plugin::$instance->documents->get( $post->ID );
		$document->save( [ 'elements' => self::ORIGINAL_ELEMENTS ] );

		// Act.
		$result = Document_Mutator::instance()->save_as_draft( $document, self::NEW_ELEMENTS, true );

		// Assert.
		$this->assertInstanceOf( Document::class, $result );
		$this->assertNotEquals( $document->get_main_id(), $result->get_post()->ID );
		$this->assertEquals( 'private', get_post_status( $document->get_main_id() ) );
		$this->assertEquals( self::ORIGINAL_ELEMENTS, $document->get_elements_data() );
	}

	public function test_save_as_draft__preserve_flag_on__passed_autosave_doc__reuses_same_autosave() {
		// Arrange.
		$this->act_as_admin();
		$post = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'publish' ] );
		$main_document = Plugin::$instance->documents->get( $post->ID );
		$existing_autosave = $main_document->get_autosave( 0, true );

		// Act.
		$result = Document_Mutator::instance()->save_as_draft( $existing_autosave, self::NEW_ELEMENTS, true );

		// Assert.
		$this->assertInstanceOf( Document::class, $result );
		$this->assertEquals(
			$existing_autosave->get_post()->ID,
			$result->get_post()->ID,
			'save_as_draft should reuse the existing autosave when passed one, not nest a new autosave under it.'
		);
		$this->assertEquals( $post->ID, wp_get_post_parent_id( $result->get_post()->ID ) );
	}

	public function test_save_as_draft__preserve_flag_on__published_post__keeps_the_live_template() {
		// Arrange.
		$this->act_as_admin();
		$post = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'publish' ] );
		$document = Plugin::$instance->documents->get( $post->ID );
		$document->save( [ 'elements' => self::ORIGINAL_ELEMENTS ] );
		update_post_meta( $post->ID, '_wp_page_template', Page_Templates_Module::TEMPLATE_CANVAS );

		// Act.
		$result = Document_Mutator::instance()->save_as_draft( $document, self::NEW_ELEMENTS, true );

		// Assert.
		$this->assertSame( Page_Templates_Module::TEMPLATE_CANVAS, get_post_meta( $post->ID, '_wp_page_template', true ) );
		$this->assertSame( Page_Templates_Module::TEMPLATE_CANVAS, get_metadata( 'post', $result->get_post()->ID, '_wp_page_template', true ) );
	}

	public function test_save_as_draft__preserve_flag_on__published_post__allows_template_writes_after_the_save() {
		// Arrange.
		$this->act_as_admin();
		$post = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'publish' ] );
		$document = Plugin::$instance->documents->get( $post->ID );
		$document->save( [ 'elements' => self::ORIGINAL_ELEMENTS ] );
		update_post_meta( $post->ID, '_wp_page_template', Page_Templates_Module::TEMPLATE_CANVAS );
		Document_Mutator::instance()->save_as_draft( $document, self::NEW_ELEMENTS, true );

		// Act.
		update_post_meta( $post->ID, '_wp_page_template', Page_Templates_Module::TEMPLATE_HEADER_FOOTER );

		// Assert.
		$this->assertSame( Page_Templates_Module::TEMPLATE_HEADER_FOOTER, get_post_meta( $post->ID, '_wp_page_template', true ) );
	}

	public function test_save_as_draft__preserve_flag_on__published_post__keeps_third_party_template_writes() {
		// Arrange.
		$this->act_as_admin();
		$post = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'publish' ] );
		$document = Plugin::$instance->documents->get( $post->ID );
		$document->save( [ 'elements' => self::ORIGINAL_ELEMENTS ] );
		update_post_meta( $post->ID, '_wp_page_template', Page_Templates_Module::TEMPLATE_CANVAS );
		$document->get_autosave( 0, true );
		$this->move_modified_date_to_the_past( $post->ID );
		$write_live_template_on_save = function ( $post_id ) use ( $post ) {
			if ( wp_is_post_autosave( $post_id ) ) {
				update_post_meta( $post->ID, '_wp_page_template', Page_Templates_Module::TEMPLATE_HEADER_FOOTER );
			}
		};
		add_action( 'save_post', $write_live_template_on_save );

		try {
			// Act.
			Document_Mutator::instance()->save_as_draft( $document, self::NEW_ELEMENTS, true );
		} finally {
			remove_action( 'save_post', $write_live_template_on_save );
		}

		// Assert.
		$this->assertSame( Page_Templates_Module::TEMPLATE_HEADER_FOOTER, get_post_meta( $post->ID, '_wp_page_template', true ) );
	}

	public function test_save_settings_preserving_live_status__published_post__writes_settings_to_the_autosave() {
		// Arrange.
		$this->act_as_admin();
		$post = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'publish' ] );
		$document = Plugin::$instance->documents->get( $post->ID );
		$document->save( [ 'elements' => self::ORIGINAL_ELEMENTS ] );
		update_post_meta( $post->ID, '_wp_page_template', Page_Templates_Module::TEMPLATE_CANVAS );

		// Act.
		$result = Document_Mutator::instance()->save_settings_preserving_live_status( $document, [
			'template' => Page_Templates_Module::TEMPLATE_HEADER_FOOTER,
			'hide_title' => 'yes',
		] );

		// Assert.
		$this->assertInstanceOf( Document::class, $result );
		$this->assertNotEquals( $post->ID, $result->get_post()->ID );
		$this->assertSame( Page_Templates_Module::TEMPLATE_CANVAS, get_post_meta( $post->ID, '_wp_page_template', true ) );
		$this->assertEmpty( get_post_meta( $post->ID, '_elementor_page_settings', true ) );
		$this->assertSame( Page_Templates_Module::TEMPLATE_HEADER_FOOTER, get_metadata( 'post', $result->get_post()->ID, '_wp_page_template', true ) );
		$this->assertSame( 'yes', get_metadata( 'post', $result->get_post()->ID, '_elementor_page_settings', true )['hide_title'] ?? null );
	}

	/**
	 * `Utils::get_post_autosave` only returns autosaves modified strictly after the main post.
	 */
	private function move_modified_date_to_the_past( int $post_id ): void {
		global $wpdb;

		$past = gmdate( 'Y-m-d H:i:s', strtotime( '-1 day' ) );

		$wpdb->update( $wpdb->posts, [ 'post_modified' => $past, 'post_modified_gmt' => $past ], [ 'ID' => $post_id ] );
		clean_post_cache( $post_id );
	}

	public function test_save_as_draft__preserve_flag_on__draft_post__writes_to_main_document() {
		// Arrange.
		$this->act_as_admin();
		$post = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'draft' ] );
		$document = Plugin::$instance->documents->get( $post->ID );

		// Act.
		$result = Document_Mutator::instance()->save_as_draft( $document, self::NEW_ELEMENTS, true );

		// Assert.
		$this->assertInstanceOf( Document::class, $result );
		$this->assertEquals(
			$document->get_main_id(),
			$result->get_post()->ID,
			'save_as_draft should write directly to the main document when it is not live.'
		);
		$this->assertEquals( 'draft', get_post_status( $document->get_main_id() ) );
		$this->assertEquals( self::NEW_ELEMENTS, $document->get_elements_data() );
	}
}
