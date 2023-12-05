<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Utils\ImportExport;

use Elementor\Core\Utils\ImportExport\WP_Exporter;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_WP_Exporter extends Elementor_Test_Base {
	/**
	 * @var array
	 */
	private $expected_error_list;

	/**
	 * @var bool|
	 */
	private $expected_errors_found;

	public function setUp(): void {
		parent::setUp();

		// Should remove the default kit because it is actually a post and it affect
		// the number of posts that exists.
		$this->remove_default_kit();
	}

	protected function expected_error( $error_messages ) {
		$this->expected_error_list = (array) $error_messages;

		set_error_handler( [ &$this, 'expected_errors_handler' ] );
	}

	public function expected_errors_handler( $errno, $errstr ) {
		foreach ( $this->expected_error_list as $expect ) {
			if ( strpos( $errstr, $expect ) !== false ) {
				$this->expected_errors_found = true;

				return true;
			}
		}

		return false;
	}

	private function remove_space_eols_and_tabulation( $content ) {
		return preg_replace('/[\s\t\n]/', '', $content);
	}

	// TODO: To be sure it have the same data in all cases, its require to insert the data for all the cases.
	//public function test_run__ensure_match_to_export_wp_in_all_content_cases() {
	//
	//}

	public function test_run__ensure_limit_and_offset() {
		// Arrange.
		$limit_expected = 2;
		$offset_expected = 3;
		$total_items_expected = $limit_expected * $offset_expected;

		$total_items_actual = 0;
		$content_per_offset_actual = [];

		for ( $i = 0; $i < $total_items_expected; $i++ ) {
			self::factory()->create_post();
		}

		// Act.
		for ( $i = 0; $i < $offset_expected; $i++ ) {
			$exporter = new WP_Exporter( [
				'limit' => $limit_expected,
				'offset' => $limit_expected * $i,
			] );

			$content_per_offset_actual[ $i ] = $exporter->run()['xml'];
		}

		// Assert.
		for ( $i = 0; $i < $offset_expected; $i++ ) {
			$actual_items_per_offset = substr_count( $content_per_offset_actual[ $i ], '<item>' );

			$total_items_actual += $actual_items_per_offset;

			$this->assertEquals( $limit_expected, $actual_items_per_offset );
		}

		$this->assertEquals( $total_items_expected, $total_items_actual );
	}

	public function test_run__ensure_with_meta_key() {
		// Arrange.
		$meta_key = 'some_key_that_export_will_seek';

		$document = self::factory()->create_post();

		$document->update_meta( $meta_key, true );

		$exporter = new WP_Exporter( [
			'meta_query' => [
				[
					'key' => $meta_key,
					'value' => true,
				],
			],
		] );

		// Act.
		$content = $exporter->run();
		$actual_items = substr_count( $content['xml'], '<item>' );

		// Assert.
		$this->assertEquals( 1, $actual_items );
	}

	public function test_run__ensure_with_meta_key_not_found() {
		// Arrange.
		$meta_key = 'some_key_that_export_will_seek';

		self::factory()->create_post();

		$exporter = new WP_Exporter( [
			'meta_query' => [
				[
					'key' => $meta_key,
					'value' => true,
				],
			],
		] );

		// Act.
		$content = $exporter->run();
		$actual_items = substr_count( $content['xml'], '<item>' );

		// Assert.
		$this->assertEquals( 0, $actual_items );
	}

	public function test_run__ensure_include_post_featured_image_as_attachment() {
		// Arrange.
		$attachment = $this->factory()->post->create_and_get( [
			'post_type' => 'attachment',
		] );

		$post = $this->factory()->post->create_and_get( [
			'meta_input' => [
				'_thumbnail_id' => $attachment->ID,
			],
		] );

		$exporter = new WP_Exporter( [
			'content' => 'post',
			'status' => 'publish',
			'meta_query' => [
				[
					'key' => '_elementor_edit_mode',
					'compare' => 'NOT EXISTS',
				],
			],
			'include_post_featured_image_as_attachment' => true,
		] );

		// Act.
		$content = $exporter->run();

		// Assert.
		// The featured image is included as attachment and will not count at the content ids.
		$this->assertEquals( [ $post->ID ], $content['ids'] );

		$include_attachment = (boolean) strstr(
			$content['xml'],
			'<wp:attachment_url>'
		);

		$this->assertTrue( $include_attachment );
	}

	/**
	 * Return wrapped given string in XML CDATA tag.
	 *
	 * @param string $str String to wrap in XML CDATA tag.
	 *
	 * @return string
	 */
	private function wxr_cdata( $str ) {
		$str = (string) $str;

		if ( ! seems_utf8( $str ) ) {
			$str = utf8_encode( $str );
		}

		$str = '<![CDATA[' . str_replace( ']]>', ']]]]><![CDATA[>', $str ) . ']]>';

		return $str;
	}
}
