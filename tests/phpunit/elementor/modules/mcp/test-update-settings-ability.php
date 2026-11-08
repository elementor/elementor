<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Documents_Manager;
use Elementor\Core\Settings\Page\Manager as Page_Settings_Manager;
use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\Mcp\Abilities\Publish_Document_Ability;
use Elementor\Modules\Mcp\Abilities\Update_Settings_Ability;
use Elementor\Modules\PageTemplates\Module as Page_Templates_Module;
use Elementor\Plugin;
use Elementor\Tests\Phpunit\Modules\Mcp\Fixtures\Revision_Test_Helpers;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/fixtures/revision-test-helpers.php';

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Update_Settings_Ability extends Elementor_Test_Base {

	use Revision_Test_Helpers;

	const BACKGROUND_SETTINGS = [
		'background_background' => 'classic',
		'background_color' => '#12ab34',
	];

	private Update_Settings_Ability $ability;
	private Documents_Manager $original_documents;

	public function setUp(): void {
		parent::setUp();

		$this->ability = new Update_Settings_Ability();
		$this->original_documents = Plugin::$instance->documents;
	}

	public function tearDown(): void {
		Plugin::$instance->documents = $this->original_documents;
		parent::tearDown();
	}

	public function test_execute__returns_400_when_post_id_missing() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute( [ 'settings' => [ 'key' => 'value' ] ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_post_id', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_400_when_settings_missing() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute( [ 'post_id' => 1 ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_settings', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_404_when_document_not_found() {
		// Arrange
		$this->act_as_admin();

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( null );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_id' => 999999, 'settings' => [] ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'document_not_found', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_403_when_document_not_editable() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( false );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id, 'settings' => [ 'foo' => 'bar' ] ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_cannot_edit', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_500_when_save_fails() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->method( 'save' )->willReturn( false );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id, 'settings' => [ 'foo' => 'bar' ] ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'save_failed', $result->get_error_code() );
		$this->assertSame( \WP_Http::INTERNAL_SERVER_ERROR, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_success_on_save() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->method( 'save' )->willReturn( true );
		$mock_document->method( 'get_wp_preview_url' )->willReturn( 'https://example.com/?p=1&preview_id=1&preview_nonce=abc&preview=true' );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id, 'settings' => [ 'template' => 'elementor_canvas' ] ] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertTrue( $result['success'] );
		$this->assertSame( $post_id, $result['post_id'] );
		$this->assertArrayHasKey( 'preview_url', $result );
		$this->assertArrayHasKey( 'llm_instructions', $result );
		$this->assertStringContainsString( $result['preview_url'], $result['llm_instructions'] );
		$this->assertStringNotContainsString( 'preview_nonce=', $result['preview_url'] );
		$this->assertStringContainsString( 'preview=true', $result['preview_url'] );
	}

	public function test_execute__passes_settings_to_document_save() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();
		$settings = [ 'template' => 'elementor_canvas', 'hide_title' => 'yes' ];

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->expects( $this->once() )
			->method( 'save' )
			->with( [ 'settings' => $settings ] )
			->willReturn( true );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$this->ability->execute( [ 'post_id' => $post_id, 'settings' => $settings ] );
	}

	public function test_execute__keeps_staged_element_edits_when_settings_change_on_a_published_page() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_elementor_page( 'publish', $this->containers( 1 ) );
		Document_Mutator::instance()->save_as_draft( Plugin::$instance->documents->get( $post_id, false ), $this->containers( 2 ), true );

		// Act
		$this->ability->execute( [ 'post_id' => $post_id, 'settings' => self::BACKGROUND_SETTINGS ] );
		$this->publish( $post_id );

		// Assert
		$this->assertCount( 2, $this->elements_of( $post_id ), 'The staged element edit must survive the settings change.' );
		$this->assertSame( self::BACKGROUND_SETTINGS, $this->live_page_settings( $post_id ) );
	}

	public function test_execute__stages_settings_on_a_published_page_until_publish() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_elementor_page( 'publish', $this->containers( 1 ) );

		// Act
		$result = $this->ability->execute( [
			'post_id' => $post_id,
			'settings' => [ 'template' => Page_Templates_Module::TEMPLATE_CANVAS ] + self::BACKGROUND_SETTINGS,
		] );
		$live_settings_before_publish = $this->live_page_settings( $post_id );
		$live_template_before_publish = get_post_meta( $post_id, '_wp_page_template', true );
		$autosave_template = get_metadata( 'post', $this->find_autosave_id( $post_id ), '_wp_page_template', true );
		$this->publish( $post_id );

		// Assert
		$this->assertTrue( $result['staged'] );
		$this->assertStringContainsString( 'elementor/publish-document', $result['llm_instructions'] );
		$this->assertSame( [], $live_settings_before_publish );
		$this->assertNotSame( Page_Templates_Module::TEMPLATE_CANVAS, $live_template_before_publish );
		$this->assertSame( Page_Templates_Module::TEMPLATE_CANVAS, $autosave_template );
		$this->assertSame( self::BACKGROUND_SETTINGS, $this->live_page_settings( $post_id ) );
		$this->assertSame( Page_Templates_Module::TEMPLATE_CANVAS, get_post_meta( $post_id, '_wp_page_template', true ) );
	}

	public function test_execute__writes_draft_settings_to_the_post() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_elementor_page( 'draft', $this->containers( 1 ) );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id, 'settings' => self::BACKGROUND_SETTINGS ] );

		// Assert
		$this->assertFalse( $result['staged'] );
		$this->assertSame( self::BACKGROUND_SETTINGS, $this->live_page_settings( $post_id ) );
		$this->assertSame( 0, $this->find_autosave_id( $post_id ) );
	}

	public function test_execute__stages_title_and_excerpt_until_publish() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_elementor_post_type_post();
		update_post_meta( $post_id, '_wp_page_template', Page_Templates_Module::TEMPLATE_CANVAS );
		$original_post = get_post( $post_id );

		// Act
		$this->ability->execute( [
			'post_id' => $post_id,
			'settings' => [ 'post_title' => 'Staged "title"', 'post_excerpt' => 'Staged excerpt' ],
		] );
		$live_post_before_publish = get_post( $post_id );
		$live_template_before_publish = get_post_meta( $post_id, '_wp_page_template', true );
		$this->publish( $post_id );

		// Assert
		$this->assertSame( $original_post->post_title, $live_post_before_publish->post_title );
		$this->assertSame( $original_post->post_excerpt, $live_post_before_publish->post_excerpt );
		$this->assertSame( Page_Templates_Module::TEMPLATE_CANVAS, $live_template_before_publish );
		$this->assertSame( 'Staged "title"', get_post( $post_id )->post_title );
		$this->assertSame( 'Staged excerpt', get_post( $post_id )->post_excerpt );
	}

	public function test_execute__stages_a_featured_image_until_publish() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_elementor_page( 'publish', $this->containers( 1 ) );
		$image_id = $this->create_image();

		// Act
		$this->ability->execute( [ 'post_id' => $post_id, 'settings' => [ 'post_featured_image' => [ 'id' => $image_id ] ] ] );
		$live_thumbnail_before_publish = get_post_thumbnail_id( $post_id );
		$this->publish( $post_id );

		// Assert
		$this->assertSame( 0, $live_thumbnail_before_publish );
		$this->assertSame( $image_id, get_post_thumbnail_id( $post_id ) );
	}

	public function test_execute__stages_a_featured_image_removal_until_publish() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_elementor_page( 'publish', $this->containers( 1 ) );
		$image_id = $this->create_image();
		set_post_thumbnail( $post_id, $image_id );

		// Act
		$this->ability->execute( [ 'post_id' => $post_id, 'settings' => [ 'post_featured_image' => [ 'id' => '' ] ] ] );
		$live_thumbnail_before_publish = get_post_thumbnail_id( $post_id );
		$this->publish( $post_id );

		// Assert
		$this->assertSame( $image_id, $live_thumbnail_before_publish );
		$this->assertSame( 0, get_post_thumbnail_id( $post_id ) );
	}

	/**
	 * @dataProvider unstageable_settings_provider
	 */
	public function test_execute__rejects_post_fields_that_cannot_be_staged( string $setting, $value ) {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_elementor_page( 'publish', $this->containers( 1 ) );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id, 'settings' => [ $setting => $value ] + self::BACKGROUND_SETTINGS ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_settings', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
		$this->assertStringContainsString( $setting, $result->get_error_message() );
		$this->assertSame( 0, $this->find_autosave_id( $post_id ) );
		$this->assertSame( [], $this->live_page_settings( $post_id ) );
	}

	public function unstageable_settings_provider(): array {
		return [
			'post status' => [ 'post_status', 'draft' ],
			'menu order' => [ 'menu_order', 3 ],
			'comment status' => [ 'comment_status', 'open' ],
		];
	}

	public function test_execute__returns_403_when_staging_a_featured_image_without_publish_posts() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_elementor_page( 'publish', $this->containers( 1 ) );
		$image_id = $this->create_image();
		$deny_publish_posts = fn( array $allcaps ) => [ 'publish_posts' => false ] + $allcaps;
		add_filter( 'user_has_cap', $deny_publish_posts );

		try {
			// Act
			$result = $this->ability->execute( [ 'post_id' => $post_id, 'settings' => [ 'post_featured_image' => [ 'id' => $image_id ] ] ] );
		} finally {
			remove_filter( 'user_has_cap', $deny_publish_posts );
		}

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_cannot_edit', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
		$this->assertSame( 0, $this->find_autosave_id( $post_id ) );
	}

	private function publish( int $post_id ): void {
		( new Publish_Document_Ability() )->execute( [ 'post_id' => $post_id ] );
	}

	private function live_page_settings( int $post_id ): array {
		$settings = get_post_meta( $post_id, Page_Settings_Manager::META_KEY, true );

		return is_array( $settings ) ? $settings : [];
	}

	private function create_elementor_post_type_post(): int {
		$post_id = $this->factory()->post->create( [ 'post_type' => 'post', 'post_status' => 'publish' ] );
		$document = Plugin::$instance->documents->get( $post_id, false );
		$document->set_is_built_with_elementor( true );
		$document->save( [ 'elements' => $this->containers( 1 ) ] );
		$this->move_modified_date_to_the_past( $post_id );

		return $post_id;
	}

	private function create_image(): int {
		return (int) $this->factory()->attachment->create_object( 'image.jpg', 0, [ 'post_mime_type' => 'image/jpeg' ] );
	}
}
