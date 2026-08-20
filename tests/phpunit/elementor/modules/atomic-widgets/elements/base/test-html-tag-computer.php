<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\AtomicWidgets\Elements\Base\Html_Tag_Computer;
use PHPUnit\Framework\TestCase;

class Test_Html_Tag_Computer extends TestCase {

	public function test_falls_back_to_default_tag() {
		$this->assertSame( 'button', Html_Tag_Computer::compute( [], 'button' ) );
	}

	public function test_prefers_settings_tag_over_default() {
		$this->assertSame( 'h3', Html_Tag_Computer::compute( [ 'tag' => 'h3' ], 'h2' ) );
	}

	public function test_uses_link_tag_when_href_is_present() {
		$result = Html_Tag_Computer::compute( [
			'tag' => 'div',
			'link' => [
				'href' => 'https://example.com',
				'tag' => 'a',
			],
		], 'div' );

		$this->assertSame( 'a', $result );
	}

	public function test_does_not_use_link_tag_without_href() {
		$result = Html_Tag_Computer::compute( [
			'link' => [
				'tag' => 'a',
			],
		], 'button' );

		$this->assertSame( 'button', $result );
	}

	public function test_can_ignore_link_when_follow_link_is_false() {
		$result = Html_Tag_Computer::compute( [
			'tag' => 'h4',
			'link' => [
				'href' => 'https://example.com',
				'tag' => 'a',
			],
		], 'h2', [ Html_Tag_Computer::FOLLOW_LINK_OPTION => false ] );

		$this->assertSame( 'h4', $result );
	}

	public function test_uses_link_tag_when_rendered_link_attributes_are_present() {
		$result = Html_Tag_Computer::compute( [
			'link' => [
				'tag' => 'a',
				'attributes' => 'href="https://example.com"',
			],
		], 'div' );

		$this->assertSame( 'a', $result );
	}

	public function test_reads_transformable_tag_envelope() {
		$result = Html_Tag_Computer::compute( [
			'tag' => [
				'$$type' => 'string',
				'value' => 'span',
			],
		], 'p' );

		$this->assertSame( 'span', $result );
	}

	public function test_contract_fixtures() {
		$fixtures_path = ELEMENTOR_PATH . 'tests/fixtures/html-tag-computer-cases.json';
		$cases = json_decode( file_get_contents( $fixtures_path ), true );

		$this->assertIsArray( $cases );

		foreach ( $cases as $case ) {
			$options = [];

			if ( isset( $case['followLink'] ) && false === $case['followLink'] ) {
				$options[ Html_Tag_Computer::FOLLOW_LINK_OPTION ] = false;
			}

			$result = Html_Tag_Computer::compute(
				$case['settings'],
				$case['default'],
				$options
			);

			$this->assertSame(
				$case['expected'],
				$result,
				'Failed contract case: ' . wp_json_encode( $case )
			);
		}
	}
}
