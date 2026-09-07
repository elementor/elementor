<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Utils;

use Elementor\Modules\AtomicWidgets\Utils\Atomic_Prop_Remap;
use Elementor\Modules\AtomicWidgets\Utils\Atomic_Prop_Remap_Registry;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Atomic_Prop_Remap extends TestCase {

	private const SOURCE_POST_ID = 51;
	private const DESTINATION_POST_ID = 591;
	private const UNMAPPED_POST_ID = 54;

	protected function setUp(): void {
		parent::setUp();
		Atomic_Prop_Remap_Registry::reset();
		Atomic_Prop_Remap::set_tag_resolver( null );
		Atomic_Prop_Remap::register_builtin_handlers();
	}

	protected function tearDown(): void {
		Atomic_Prop_Remap::set_tag_resolver( null );
		Atomic_Prop_Remap_Registry::reset();
		parent::tearDown();
	}

	public function test_apply__remaps_link_post_destination() {
		$elements = [
			$this->make_widget( 'heading', [
				'link' => $this->make_link_query( self::SOURCE_POST_ID, 'Home' ),
			] ),
		];

		$result = Atomic_Prop_Remap::apply( $elements, $this->post_map() );

		$this->assertSame(
			self::DESTINATION_POST_ID,
			$result[0]['settings']['link']['value']['destination']['value']['id']['value']
		);
	}

	public function test_apply__leaves_link_url_destination() {
		$url = 'https://example.com/home/';
		$elements = [
			$this->make_widget( 'heading', [
				'link' => [
					'$$type' => 'link',
					'value' => [
						'destination' => [
							'$$type' => 'url',
							'value' => $url,
						],
					],
				],
			] ),
		];

		$result = Atomic_Prop_Remap::apply( $elements, $this->post_map() );

		$this->assertSame( $url, $result[0]['settings']['link']['value']['destination']['value'] );
	}

	public function test_apply__empty_replacements_short_circuits() {
		$elements = [
			$this->make_widget( 'heading', [
				'link' => $this->make_link_query( self::SOURCE_POST_ID, 'Home' ),
			] ),
		];

		$result = Atomic_Prop_Remap::apply( $elements, [] );

		$this->assertSame( $elements, $result );
	}

	public function test_apply__ignores_unknown_dollar_types() {
		$elements = [
			$this->make_widget( 'heading', [
				'title' => [
					'$$type' => 'string',
					'value' => 'Hello',
				],
			] ),
		];

		$result = Atomic_Prop_Remap::apply( $elements, $this->post_map() );

		$this->assertSame( 'Hello', $result[0]['settings']['title']['value'] );
	}

	public function test_apply__records_warning_for_unmapped_post_id() {
		$elements = [
			$this->make_widget( 'heading', [
				'link' => $this->make_link_query( self::UNMAPPED_POST_ID, 'Journal' ),
			] ),
		];

		$result = Atomic_Prop_Remap::apply( $elements, $this->post_map() );
		$warnings = Atomic_Prop_Remap::consume_warnings();

		$this->assertSame(
			self::UNMAPPED_POST_ID,
			$result[0]['settings']['link']['value']['destination']['value']['id']['value']
		);
		$this->assertCount( 1, $warnings );
		$this->assertSame( 'heading', $warnings[0]['element_id'] );
		$this->assertSame( Atomic_Prop_Remap::KIND_POST, $warnings[0]['missing_kind'] );
		$this->assertSame( self::UNMAPPED_POST_ID, $warnings[0]['source_id'] );
	}

	public function test_apply__recurses_into_nested_elements() {
		$elements = [
			[
				'id' => 'container',
				'elType' => 'e-div-block',
				'elements' => [
					$this->make_widget( 'nested-heading', [
						'link' => $this->make_link_query( self::SOURCE_POST_ID, 'Home' ),
					] ),
				],
			],
		];

		$result = Atomic_Prop_Remap::apply( $elements, $this->post_map() );

		$this->assertSame(
			self::DESTINATION_POST_ID,
			$result[0]['elements'][0]['settings']['link']['value']['destination']['value']['id']['value']
		);
	}

	public function test_apply__delegates_dynamic_tag_to_tag_on_import_method() {
		Atomic_Prop_Remap::set_tag_resolver( static function () {
			return new class {
				public static function on_import_update_dynamic_content( array $config, array $data, $controls = null ): array {
					$post_id = $config['settings']['post_id'] ?? null;

					if ( isset( $data['post_ids'][ $post_id ] ) ) {
						$config['settings']['post_id'] = $data['post_ids'][ $post_id ];
					}

					return $config;
				}
			};
		} );

		$elements = [
			$this->make_widget( 'heading', [
				'link' => [
					'$$type' => 'link',
					'value' => [
						'destination' => [
							'$$type' => 'dynamic',
							'value' => [
								'name' => 'internal-url',
								'group' => 'site',
								'settings' => [
									'type' => 'post',
									'post_id' => self::SOURCE_POST_ID,
								],
							],
						],
					],
				],
			] ),
		];

		$result = Atomic_Prop_Remap::apply( $elements, $this->post_map() );

		$this->assertSame(
			self::DESTINATION_POST_ID,
			$result[0]['settings']['link']['value']['destination']['value']['settings']['post_id']
		);
	}

	public function test_apply__ignores_dynamic_tag_without_on_import_method() {
		Atomic_Prop_Remap::set_tag_resolver( static function () {
			return new class {};
		} );

		$elements = [
			$this->make_widget( 'heading', [
				'link' => [
					'$$type' => 'link',
					'value' => [
						'destination' => [
							'$$type' => 'dynamic',
							'value' => [
								'name' => 'post-title',
								'group' => 'post',
								'settings' => [
									'fallback' => 'Title',
								],
							],
						],
					],
				],
			] ),
		];

		$result = Atomic_Prop_Remap::apply( $elements, $this->post_map() );

		$this->assertSame(
			'Title',
			$result[0]['settings']['link']['value']['destination']['value']['settings']['fallback']
		);
	}

	public function test_apply__remaps_dynamic_internal_url_query_post_id() {
		$elements = [
			$this->make_widget( 'heading', [
				'link' => [
					'$$type' => 'link',
					'value' => [
						'destination' => [
							'$$type' => 'dynamic',
							'value' => [
								'name' => 'internal-url',
								'group' => 'site',
								'settings' => [
									'type' => [
										'$$type' => 'string',
										'value' => 'post',
									],
									'post_id' => $this->make_query( self::SOURCE_POST_ID, 'Home' ),
								],
							],
						],
					],
				],
			] ),
		];

		$result = Atomic_Prop_Remap::apply( $elements, $this->post_map() );

		$this->assertSame(
			self::DESTINATION_POST_ID,
			$result[0]['settings']['link']['value']['destination']['value']['settings']['post_id']['value']['id']['value']
		);
	}

	private function post_map(): array {
		return [
			'post_ids' => [
				self::SOURCE_POST_ID => self::DESTINATION_POST_ID,
			],
		];
	}

	private function make_widget( string $id, array $settings ): array {
		return [
			'id' => $id,
			'elType' => 'widget',
			'widgetType' => 'e-heading',
			'settings' => $settings,
		];
	}

	private function make_link_query( int $id, string $label ): array {
		return [
			'$$type' => 'link',
			'value' => [
				'destination' => $this->make_query( $id, $label ),
			],
		];
	}

	private function make_query( int $id, string $label ): array {
		return [
			'$$type' => 'query',
			'value' => [
				'id' => [
					'$$type' => 'number',
					'value' => $id,
				],
				'label' => [
					'$$type' => 'string',
					'value' => $label,
				],
			],
		];
	}
}
