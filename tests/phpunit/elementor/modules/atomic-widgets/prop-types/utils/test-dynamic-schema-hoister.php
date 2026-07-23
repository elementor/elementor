<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes\Utils;

use Elementor\Modules\AtomicWidgets\PropTypes\Utils\Dynamic_Schema_Hoister;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Dynamic_Schema_Hoister extends TestCase {

	private function make_dynamic_branch( array $enum ): array {
		return [
			'type' => 'object',
			'description' => 'Bind THIS value to a dynamic tag ...',
			'properties' => [
				'name' => [
					'type' => 'string',
					'description' => 'Dynamic tag name from "elementor://dynamic-tags".',
					'enum' => $enum,
				],
				'settings' => [
					'type' => 'object',
					'description' => "Tag settings matching the chosen tag's schema in the resource.",
				],
			],
			'required' => [ 'name' ],
		];
	}

	public function test_hoist__no_dynamic_branches__returns_empty_defs() {
		$properties = [
			'text' => [ 'type' => 'string' ],
			'count' => [ 'type' => 'number' ],
		];

		$result = Dynamic_Schema_Hoister::hoist( $properties );

		$this->assertSame( $properties, $result['properties'] );
		$this->assertSame( [], $result['defs'] );
	}

	public function test_hoist__identical_dynamic_branches__collapse_into_single_def() {
		$branch = $this->make_dynamic_branch( [ 'post-title', 'site-title' ] );

		$properties = [
			'text' => [
				'anyOf' => [ [ 'type' => 'string' ], $branch ],
			],
			'tag' => [
				'anyOf' => [ [ 'type' => 'string' ], $branch ],
			],
		];

		$result = Dynamic_Schema_Hoister::hoist( $properties );

		$this->assertCount( 1, $result['defs'] );

		$def_name = array_key_first( $result['defs'] );

		$this->assertSame(
			[ '$ref' => '#/$defs/' . $def_name ],
			$result['properties']['text']['anyOf'][1]
		);
		$this->assertSame(
			[ '$ref' => '#/$defs/' . $def_name ],
			$result['properties']['tag']['anyOf'][1]
		);
	}

	public function test_hoist__distinct_enums__produce_separate_defs() {
		$text_branch = $this->make_dynamic_branch( [ 'post-title', 'site-title' ] );
		$url_branch = $this->make_dynamic_branch( [ 'post-url', 'site-url' ] );

		$properties = [
			'text' => [ 'anyOf' => [ $text_branch ] ],
			'link' => [ 'anyOf' => [ $url_branch ] ],
		];

		$result = Dynamic_Schema_Hoister::hoist( $properties );

		$this->assertCount( 2, $result['defs'] );
		$this->assertNotSame(
			$result['properties']['text']['anyOf'][0],
			$result['properties']['link']['anyOf'][0]
		);
	}

	public function test_hoist__nested_dynamic_branch__is_hoisted() {
		$branch = $this->make_dynamic_branch( [ 'post-url' ] );

		$properties = [
			'link' => [
				'anyOf' => [
					[
						'type' => 'object',
						'properties' => [
							'destination' => [
								'anyOf' => [ [ 'type' => 'string' ], $branch ],
							],
						],
					],
				],
			],
		];

		$result = Dynamic_Schema_Hoister::hoist( $properties );

		$this->assertCount( 1, $result['defs'] );

		$destination_ref = $result['properties']['link']['anyOf'][0]['properties']['destination']['anyOf'][1];
		$def_name = array_key_first( $result['defs'] );

		$this->assertSame( [ '$ref' => '#/$defs/' . $def_name ], $destination_ref );
	}

	public function test_hoist__branch_without_enum__uses_any_def_name() {
		$branch = [
			'type' => 'object',
			'properties' => [
				'name' => [
					'type' => 'string',
					'description' => 'Dynamic tag name from "elementor://dynamic-tags".',
				],
				'settings' => [ 'type' => 'object' ],
			],
			'required' => [ 'name' ],
		];

		$result = Dynamic_Schema_Hoister::hoist( [
			'text' => [ 'anyOf' => [ $branch ] ],
		] );

		$this->assertArrayHasKey( 'dynamic_any', $result['defs'] );
		$this->assertSame(
			[ '$ref' => '#/$defs/dynamic_any' ],
			$result['properties']['text']['anyOf'][0]
		);
	}
}
