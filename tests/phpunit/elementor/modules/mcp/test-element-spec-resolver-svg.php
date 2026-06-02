<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Services\Element_Spec_Resolver;
use Elementor\Modules\Mcp\Abilities\Services\Svg_Uploader;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Element_Spec_Resolver_Svg extends Elementor_Test_Base {

	private array $created_attachments = [];

	public function tearDown(): void {
		foreach ( $this->created_attachments as $id ) {
			wp_delete_attachment( $id, true );
		}
		$this->created_attachments = [];
		parent::tearDown();
	}

	private function make_attachment( string $mime ): int {
		$id = $this->factory()->attachment->create_object(
			'file.' . ( 'image/svg+xml' === $mime ? 'svg' : 'jpg' ),
			0,
			[
				'post_mime_type' => $mime,
				'post_type' => 'attachment',
			]
		);
		$this->created_attachments[] = $id;
		return $id;
	}

	public function test_svg_widget__resolves_to_e_svg_widget_node() {
		$id = $this->make_attachment( 'image/svg+xml' );
		$resolver = Element_Spec_Resolver::make();

		$resolved = $resolver->resolve( [ [ 'widget' => 'svg', 'svg_id' => $id ] ] );

		$this->assertSame( [], $resolver->get_unresolved() );
		$this->assertCount( 1, $resolved );
		$node = $resolved[0];
		$this->assertSame( 'widget', $node['elType'] );
		$this->assertSame( 'e-svg', $node['widgetType'] );
	}

	public function test_valid_svg_id__builds_attachment_id_envelope() {
		$id = $this->make_attachment( 'image/svg+xml' );
		$resolver = Element_Spec_Resolver::make();

		$resolved = $resolver->resolve( [ [ 'widget' => 'svg', 'svg_id' => $id ] ] );

		$svg = $resolved[0]['settings']['svg'];
		$this->assertSame( 'svg-src', $svg['$$type'] );
		$this->assertSame( 'image-attachment-id', $svg['value']['id']['$$type'] );
		$this->assertSame( $id, $svg['value']['id']['value'] );
		$this->assertNull( $svg['value']['url'] );
		$this->assertSame( [], $resolver->get_warnings() );
	}

	public function test_non_svg_attachment_id__is_rejected_with_warning() {
		$id = $this->make_attachment( 'image/jpeg' );
		$resolver = Element_Spec_Resolver::make();

		$resolved = $resolver->resolve( [ [ 'widget' => 'svg', 'svg_id' => $id ] ] );

		$svg = $resolved[0]['settings']['svg'];
		$this->assertNull( $svg['value']['id'] );
		$this->assertStringContainsString( 'default-svg.svg', $svg['value']['url']['value'] );

		$warnings = $resolver->get_warnings();
		$this->assertCount( 1, $warnings );
		$this->assertSame( 'svg_id_invalid_mime', $warnings[0]['reason'] );
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
		$id = $this->make_attachment( 'image/svg+xml' );
		$resolver = Element_Spec_Resolver::make();

		$resolved = $resolver->resolve( [
			[
				'widget' => 'svg',
				'svg_id' => $id,
				'link_url' => 'https://example.com',
				'link_target_blank' => true,
			],
		] );

		$link = $resolved[0]['settings']['link'];
		$this->assertSame( 'link', $link['$$type'] );
		$this->assertSame( 'https://example.com', $link['value']['destination']['value'] );
		$this->assertTrue( $link['value']['isTargetBlank']['value'] );
	}

	public function test_icon_synonym__is_no_longer_recognized() {
		$resolver = Element_Spec_Resolver::make();

		$resolver->resolve( [ [ 'widget' => 'icon' ] ] );

		$unresolved = $resolver->get_unresolved();
		$this->assertCount( 1, $unresolved );
		$this->assertSame( 'unknown_widget', $unresolved[0]['reason'] );
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
		$this->created_attachments[] = $attachment_id;
		$this->assertIsInt( $attachment_id );
		$this->assertGreaterThan( 0, $attachment_id );

		$this->assertSame( 'image/svg+xml', get_post_mime_type( $attachment_id ) );
	}

	public function test_identical_inline_markup__is_deduplicated_to_one_attachment() {
		$markup = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>';

		$first = Element_Spec_Resolver::make()->resolve( [ [ 'widget' => 'svg', 'svg_markup' => $markup ] ] );
		$second = Element_Spec_Resolver::make()->resolve( [ [ 'widget' => 'svg', 'svg_markup' => $markup ] ] );

		$first_id = $first[0]['settings']['svg']['value']['id']['value'];
		$second_id = $second[0]['settings']['svg']['value']['id']['value'];
		$this->created_attachments[] = $first_id;

		$this->assertSame( $first_id, $second_id );
		$this->assertNotEmpty( get_post_meta( $first_id, Svg_Uploader::HASH_META_KEY, true ) );
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
