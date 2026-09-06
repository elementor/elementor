<?php

namespace Elementor\Testing\Core\Utils\Document;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Document\Document_Mutator;
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
