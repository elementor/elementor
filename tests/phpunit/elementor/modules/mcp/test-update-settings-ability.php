<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Documents_Manager;
use Elementor\Modules\Mcp\Abilities\Update_Settings_Ability;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Update_Settings_Ability extends Elementor_Test_Base {

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

	/**
	 * @dataProvider valid_background_colors
	 */
	public function test_execute__maps_valid_background_color_to_document_settings( string $background_color ) {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->method( 'get_meta' )->with( '_elementor_page_settings' )->willReturn( [] );
		$mock_document->expects( $this->once() )
			->method( 'save' )
			->with( [
				'settings' => [
					'background_background' => 'classic',
					'background_color' => trim( $background_color ),
				],
			] )
			->willReturn( true );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [
			'post_id' => $post_id,
			'background_color' => $background_color,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertTrue( $result['success'] );
	}

	public static function valid_background_colors(): array {
		return [
			'three-digit hex' => [ '#123' ],
			'four-digit hex with alpha' => [ '#1234' ],
			'six-digit hex' => [ '#123ABC' ],
			'eight-digit hex with alpha' => [ '#123ABCff' ],
			'Elementor global color' => [ 'var(--e-global-color-primary)' ],
			'Elementor global color with whitespace' => [ '  var( --e-global-color-accent_2 )  ' ],
		];
	}

	/**
	 * @dataProvider invalid_background_colors
	 */
	public function test_execute__rejects_invalid_background_color_without_saving( $background_color ) {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->expects( $this->never() )->method( 'save' );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->expects( $this->never() )->method( 'get' );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [
			'post_id' => $post_id,
			'background_color' => $background_color,
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_background_color', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public static function invalid_background_colors(): array {
		return [
			'empty string' => [ '' ],
			'invalid hex length' => [ '#12' ],
			'invalid hex character' => [ '#12345G' ],
			'named CSS color' => [ 'red' ],
			'CSS color function' => [ 'rgb(255, 0, 0)' ],
			'non-Elementor CSS variable' => [ 'var(--brand-color)' ],
			'uppercase Elementor CSS variable prefix' => [ 'var(--E-GLOBAL-COLOR-primary)' ],
			'non-string value' => [ [ '#123456' ] ],
		];
	}

	public function test_execute__merges_partial_settings_and_background_color_with_persisted_settings() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->method( 'get_meta' )
			->with( '_elementor_page_settings' )
			->willReturn( [
				'hide_title' => 'yes',
				'background_background' => 'gradient',
				'background_color' => '#000000',
			] );
		$mock_document->expects( $this->once() )
			->method( 'save' )
			->with( [
				'settings' => [
					'hide_title' => 'yes',
					'background_background' => 'classic',
					'background_color' => '#ABCDEF',
					'template' => 'elementor_canvas',
				],
			] )
			->willReturn( true );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$this->ability->execute( [
			'post_id' => $post_id,
			'settings' => [
				'template' => 'elementor_canvas',
				'background_background' => 'video',
				'background_color' => '#111111',
			],
			'background_color' => '#ABCDEF',
		] );
	}

	public function test_definition__advertises_background_color_input() {
		// Arrange
		$method = new \ReflectionMethod( Update_Settings_Ability::class, 'get_definition' );
		$method->setAccessible( true );

		// Act
		$definition = $method->invoke( $this->ability );
		$property = $definition->input_schema['properties']['background_color'] ?? [];

		// Assert
		$this->assertSame( 'string', $property['type'] ?? null );
		$this->assertStringContainsString( '#RRGGBB', $property['description'] ?? '' );
		$this->assertStringContainsString( '--e-global-color-', $property['description'] ?? '' );
		$this->assertSame( [ 'post_id' ], $definition->input_schema['required'] );
		$this->assertSame(
			[
				[ 'required' => [ 'settings' ] ],
				[ 'required' => [ 'background_color' ] ],
			],
			$definition->input_schema['anyOf'] ?? null
		);
	}
}
