<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\List_Assets_Ability;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_List_Assets_Ability extends Elementor_Test_Base {

	private List_Assets_Ability $ability;
	private array $created_attachment_ids = [];

	public function setUp(): void {
		parent::setUp();
		$this->ability = new List_Assets_Ability();
	}

	public function tearDown(): void {
		foreach ( $this->created_attachment_ids as $attachment_id ) {
			wp_delete_attachment( $attachment_id, true );
		}
		$this->created_attachment_ids = [];
		parent::tearDown();
	}

	public function test_execute__returns_403_for_subscriber() {
		// Arrange
		$user_id = $this->factory()->user->create( [ 'role' => 'subscriber' ] );
		wp_set_current_user( $user_id );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__excludes_pdf_attachments() {
		// Arrange
		$this->act_as_admin();
		$this->create_attachment( 'image/png', 'a-photo.png' );
		$this->create_attachment( 'application/pdf', 'a-report.pdf' );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertIsArray( $result );
		$mime_types = array_column( $result['assets'], 'mime_type' );
		$this->assertContains( 'image/png', $mime_types );
		$this->assertNotContains( 'application/pdf', $mime_types );
	}

	public function test_execute__type_svg_returns_only_svg() {
		// Arrange
		$this->act_as_admin();
		$this->create_attachment( 'image/png', 'raster.png' );
		$this->create_attachment( 'image/svg+xml', 'icon.svg' );

		// Act
		$result = $this->ability->execute( [ 'type' => 'svg' ] );

		// Assert
		$this->assertNotEmpty( $result['assets'] );
		foreach ( $result['assets'] as $asset ) {
			$this->assertSame( 'image/svg+xml', $asset['mime_type'] );
		}
	}

	public function test_execute__type_video_returns_only_video() {
		// Arrange
		$this->act_as_admin();
		$this->create_attachment( 'image/png', 'raster.png' );
		$this->create_attachment( 'video/mp4', 'clip.mp4' );

		// Act
		$result = $this->ability->execute( [ 'type' => 'video' ] );

		// Assert
		$this->assertNotEmpty( $result['assets'] );
		foreach ( $result['assets'] as $asset ) {
			$this->assertSame( 'video/mp4', $asset['mime_type'] );
		}
	}

	public function test_execute__type_all_excludes_video() {
		// Arrange
		$this->act_as_admin();
		$this->create_attachment( 'image/png', 'raster.png' );
		$this->create_attachment( 'video/mp4', 'clip.mp4' );

		// Act
		$result = $this->ability->execute( [ 'type' => 'all' ] );

		// Assert
		$mime_types = array_column( $result['assets'], 'mime_type' );
		$this->assertContains( 'image/png', $mime_types );
		$this->assertNotContains( 'video/mp4', $mime_types );
	}

	public function test_execute__per_page_is_clamped_to_maximum() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute( [ 'per_page' => 9999 ] );

		// Assert
		$this->assertSame( List_Assets_Ability::MAX_PER_PAGE, $result['per_page'] );
	}

	public function test_execute__paginates_and_reports_total() {
		// Arrange
		$this->act_as_admin();
		for ( $i = 0; $i < 3; $i++ ) {
			$this->create_attachment( 'image/png', "img-{$i}.png" );
		}

		// Act
		$first_page = $this->ability->execute( [ 'per_page' => 2, 'page' => 1 ] );
		$second_page = $this->ability->execute( [ 'per_page' => 2, 'page' => 2 ] );

		// Assert
		$this->assertGreaterThanOrEqual( 3, $first_page['total'] );
		$this->assertCount( 2, $first_page['assets'] );
		$this->assertSame( 1, $first_page['page'] );
		$this->assertSame( 2, $second_page['page'] );
		$this->assertNotEmpty( $second_page['assets'] );
	}

	public function test_execute__search_matches_by_title() {
		// Arrange
		$this->act_as_admin();
		$needle_id = $this->create_attachment( 'image/png', 'searchable.png', 'FindMeUniqueTitle' );
		$this->create_attachment( 'image/png', 'other.png', 'UnrelatedTitle' );

		// Act
		$result = $this->ability->execute( [ 'search' => 'FindMeUniqueTitle' ] );

		// Assert
		$ids = array_column( $result['assets'], 'id' );
		$this->assertContains( $needle_id, $ids );
	}

	public function test_execute__never_returns_filesystem_paths() {
		// Arrange
		$this->act_as_admin();
		$this->create_attachment( 'image/png', 'test.png' );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		foreach ( $result['assets'] as $asset ) {
			foreach ( $asset as $value ) {
				if ( is_string( $value ) ) {
					$this->assertStringNotContainsString( ABSPATH, $value );
					$this->assertStringNotContainsString( WP_CONTENT_DIR, $value );
				}
			}
		}
	}

	public function test_execute__empty_result_includes_upload_hint() {
		// Arrange — no attachments in this test's factory scope; still filter to guarantee empty
		$this->act_as_admin();

		// Act — a search string that cannot match any real attachment
		$result = $this->ability->execute( [ 'search' => 'nonexistent-needle-' . wp_generate_password( 12, false ) ] );

		// Assert
		$this->assertSame( 0, $result['total'] );
		$this->assertArrayHasKey( 'llm_instructions', $result );
		$this->assertNotEmpty( $result['llm_instructions'] );
	}

	private function create_attachment( string $mime_type, string $filename, string $title = '' ): int {
		$attachment_id = $this->factory()->attachment->create_object(
			$filename,
			0,
			[
				'post_mime_type' => $mime_type,
				'post_type' => 'attachment',
				'post_status' => 'inherit',
				'post_title' => $title !== '' ? $title : $filename,
			]
		);

		$this->created_attachment_ids[] = $attachment_id;

		return $attachment_id;
	}
}
