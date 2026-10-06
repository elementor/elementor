<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

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

	public function test_execute__does_not_warn_for_a_custom_icon_pack_value() {
		// Arrange — custom packs are resolved elsewhere, so they must not be reported as missing.
		$this->act_as_admin();
		$post_id = $this->create_real_document();

		// Act.
		$result = $this->build_with_icon( $post_id, 'my-pack my-pack-logo', 'my-pack' );

		// Assert.
		$this->assertArrayNotHasKey( 'warning_details', $result );
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
