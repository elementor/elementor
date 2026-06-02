<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Services\Element_Spec_Resolver;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Element_Spec_Resolver_Svg extends Elementor_Test_Base {

	public function test_svg_widget__resolves_to_e_svg_widget_node() {
		$resolver = Element_Spec_Resolver::make();

		$resolved = $resolver->resolve( [ [ 'widget' => 'svg', 'svg_id' => 123 ] ] );

		$this->assertSame( [], $resolver->get_unresolved() );
		$this->assertCount( 1, $resolved );
		$node = $resolved[0];
		$this->assertSame( 'widget', $node['elType'] );
		$this->assertSame( 'e-svg', $node['widgetType'] );
	}

	public function test_svg_id__builds_attachment_id_envelope() {
		$resolver = Element_Spec_Resolver::make();

		$resolved = $resolver->resolve( [ [ 'widget' => 'svg', 'svg_id' => 123 ] ] );

		$svg = $resolved[0]['settings']['svg'];
		$this->assertSame( 'svg-src', $svg['$$type'] );
		$this->assertSame( 'image-attachment-id', $svg['value']['id']['$$type'] );
		$this->assertSame( 123, $svg['value']['id']['value'] );
		$this->assertNull( $svg['value']['url'] );
	}

	public function test_svg_url__builds_url_envelope() {
		$resolver = Element_Spec_Resolver::make();

		$resolved = $resolver->resolve( [ [ 'widget' => 'svg', 'svg_url' => 'https://example.com/icon.svg' ] ] );

		$svg = $resolved[0]['settings']['svg'];
		$this->assertNull( $svg['value']['id'] );
		$this->assertSame( 'url', $svg['value']['url']['$$type'] );
		$this->assertSame( 'https://example.com/icon.svg', $svg['value']['url']['value'] );
	}

	public function test_svg_link__builds_link_envelope() {
		$resolver = Element_Spec_Resolver::make();

		$resolved = $resolver->resolve( [
			[
				'widget' => 'svg',
				'svg_id' => 123,
				'link_url' => 'https://example.com',
				'link_target_blank' => true,
			],
		] );

		$link = $resolved[0]['settings']['link'];
		$this->assertSame( 'link', $link['$$type'] );
		$this->assertSame( 'https://example.com', $link['value']['destination']['value'] );
		$this->assertTrue( $link['value']['isTargetBlank']['value'] );
	}

	public function test_no_svg_source__falls_back_to_default_without_warning() {
		$resolver = Element_Spec_Resolver::make();

		$resolved = $resolver->resolve( [ [ 'widget' => 'svg' ] ] );

		$svg = $resolved[0]['settings']['svg'];
		$this->assertNull( $svg['value']['id'] );
		$this->assertStringContainsString( 'default-svg.svg', $svg['value']['url']['value'] );
		$this->assertSame( [], $resolver->get_warnings() );
	}

	public function test_unresolvable_svg_source__falls_back_and_warns() {
		$resolver = Element_Spec_Resolver::make();

		$resolved = $resolver->resolve( [ [ 'widget' => 'svg', 'svg_id' => 0, 'svg_url' => '' ] ] );

		$svg = $resolved[0]['settings']['svg'];
		$this->assertStringContainsString( 'default-svg.svg', $svg['value']['url']['value'] );

		$warnings = $resolver->get_warnings();
		$this->assertCount( 1, $warnings );
		$this->assertSame( 'svg_source_unresolved', $warnings[0]['reason'] );
	}

	public function test_inline_markup_on_dry_run__is_not_uploaded_and_warns() {
		$resolver = Element_Spec_Resolver::make( true );

		$resolved = $resolver->resolve( [
			[
				'widget' => 'svg',
				'svg_markup' => '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h10v10H0z"/></svg>',
			],
		] );

		$svg = $resolved[0]['settings']['svg'];
		$this->assertNull( $svg['value']['id'] );
		$this->assertStringContainsString( 'default-svg.svg', $svg['value']['url']['value'] );

		$warnings = $resolver->get_warnings();
		$this->assertCount( 1, $warnings );
		$this->assertSame( 'svg_inline_upload_skipped_dry_run', $warnings[0]['reason'] );
	}

	public function test_inline_markup_on_save__uploads_and_references_attachment() {
		$resolver = Element_Spec_Resolver::make();

		$resolved = $resolver->resolve( [
			[
				'widget' => 'svg',
				'svg_markup' => '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><path d="M0 0h10v10H0z"/></svg>',
			],
		] );

		$svg = $resolved[0]['settings']['svg'];
		$this->assertSame( [], $resolver->get_warnings() );
		$this->assertSame( 'image-attachment-id', $svg['value']['id']['$$type'] );
		$attachment_id = $svg['value']['id']['value'];
		$this->assertIsInt( $attachment_id );
		$this->assertGreaterThan( 0, $attachment_id );

		$this->assertSame( 'image/svg+xml', get_post_mime_type( $attachment_id ) );

		wp_delete_attachment( $attachment_id, true );
	}

	public function test_raw_v4_e_svg_node__passes_through_unchanged() {
		$resolver = Element_Spec_Resolver::make();

		$raw = [
			'id' => 'abc123',
			'elType' => 'widget',
			'widgetType' => 'e-svg',
			'settings' => [
				'svg' => [
					'$$type' => 'svg-src',
					'value' => [
						'id' => [ '$$type' => 'image-attachment-id', 'value' => 123 ],
						'url' => null,
					],
				],
			],
		];

		$resolved = $resolver->resolve( [ $raw ] );

		$this->assertSame( $raw, $resolved[0] );
		$this->assertSame( [], $resolver->get_unresolved() );
	}
}
