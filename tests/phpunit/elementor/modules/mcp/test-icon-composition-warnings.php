<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\AtomicWidgets\PropsResolver\Font_Awesome_7_Icon_Resolver;
use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Catalog;
use Elementor\Modules\Mcp\Abilities\Build_Composition_Ability;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Icon_Composition_Warnings extends Elementor_Test_Base {

	const XML_STRUCTURE = '<e-flexbox configuration-id="wrap"><e-svg configuration-id="icon"/></e-flexbox>';

	private string $fixture_path;

	public function setUp(): void {
		parent::setUp();

		$this->fixture_path = sys_get_temp_dir() . '/fa7-fixture-' . uniqid( '', true );

		if ( ! mkdir( $this->fixture_path, 0777, true ) && ! is_dir( $this->fixture_path ) ) {
			$this->fail( 'Could not create FA7 fixture directory.' );
		}

		file_put_contents(
			$this->fixture_path . '/solid.json',
			wp_json_encode( [
				'icons' => [
					'cart-shopping' => [ 576, 512, [], 'f07a', 'M0 0' ],
				],
			] )
		);

		file_put_contents(
			$this->fixture_path . '/search-index.json',
			wp_json_encode( [
				'icons' => [
					'cart-shopping' => [
						'name' => 'cart-shopping',
						'label' => 'Cart Shopping',
						'categories' => [ 'shopping' ],
						'libraries' => [ 'fa-solid' ],
					],
				],
			] )
		);

		add_filter( 'elementor/atomic-widgets/font-awesome-7/json-base-path', [ $this, 'filter_json_base_path' ] );

		Font_Awesome_7_Icon_Resolver::reset();
		Icon_Catalog::reset();
	}

	public function tearDown(): void {
		remove_all_filters( 'elementor/atomic-widgets/font-awesome-7/json-base-path' );

		if ( is_dir( $this->fixture_path ) ) {
			$json_file = $this->fixture_path . '/solid.json';
			$search_index = $this->fixture_path . '/search-index.json';

			if ( is_file( $json_file ) ) {
				unlink( $json_file );
			}

			if ( is_file( $search_index ) ) {
				unlink( $search_index );
			}

			rmdir( $this->fixture_path );
		}

		Font_Awesome_7_Icon_Resolver::reset();
		Icon_Catalog::reset();

		parent::tearDown();
	}

	public function filter_json_base_path(): string {
		return trailingslashit( $this->fixture_path );
	}

	public function test_execute__warns_when_an_icon_cannot_be_rendered() {
		// Arrange — a hallucinated icon name validates fine and then renders nothing.
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		// Act.
		$result = $this->build_with_icon( $post_id, 'fa-solid fa-not-a-real-icon', 'fa-solid' );

		// Assert.
		$this->assertSame( [ 'icon_not_found' ], array_column( $result['warning_details'] ?? [], 'code' ) );
		$this->assertStringContainsString( 'elementor/find-icons', $result['warning_details'][0]['message'] );
	}

	public function test_execute__does_not_warn_for_an_icon_the_site_can_render() {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		// Act.
		$result = $this->build_with_icon( $post_id, 'fa-solid fa-cart-shopping', 'fa-solid' );

		// Assert.
		$this->assertArrayNotHasKey( 'warning_details', $result );
	}

	public function test_execute__does_not_warn_when_catalog_is_unavailable() {
		// Arrange — FA7 files missing is a production-plausible scenario (fresh git clone, build not run).
		remove_all_filters( 'elementor/atomic-widgets/font-awesome-7/json-base-path' );
		add_filter( 'elementor/atomic-widgets/font-awesome-7/json-base-path', fn() => '/nonexistent/' );
		Font_Awesome_7_Icon_Resolver::reset();

		$this->act_as_admin();
		$post_id = $this->create_real_document();

		// Act.
		$result = $this->build_with_icon( $post_id, 'fa-solid fa-cart-shopping', 'fa-solid' );

		// Assert — when the catalog is unavailable, we cannot determine whether the icon exists, so skip the warning.
		$this->assertArrayNotHasKey( 'warning_details', $result );
	}

	public function test_execute__warns_for_unregistered_custom_library() {
		// Arrange.
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		// Act.
		$result = $this->build_with_icon( $post_id, 'my-pack my-pack-logo', 'my-pack' );

		// Assert.
		$this->assertSame( [ 'icon_library_not_found' ], array_column( $result['warning_details'] ?? [], 'code' ) );
		$this->assertStringContainsString( 'not installed', $result['warning_details'][0]['message'] );
		$this->assertStringContainsString( 'placeholder', $result['warning_details'][0]['message'] );
	}

	private function create_real_document(): int {
		return $this->factory()->create_and_get_custom_post( [ 'post_status' => 'draft' ] )->ID;
	}

	private function build_with_icon( int $post_id, string $value, string $library ): array {
		$result = ( new Build_Composition_Ability() )->execute( [
			'post_id' => $post_id,
			'xml_structure' => self::XML_STRUCTURE,
			'element_config' => [
				'icon' => [
					'svg' => [
						'value' => $value,
						'library' => $library,
					],
				],
			],
			'parent_id' => 'document',
			'dry_run' => false,
		] );

		if ( is_wp_error( $result ) ) {
			$this->fail( 'Composition failed: ' . $result->get_error_message() );
		}

		return $result;
	}
}
