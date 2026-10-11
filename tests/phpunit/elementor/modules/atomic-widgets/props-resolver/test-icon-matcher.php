<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver;

use Elementor\Modules\AtomicWidgets\PropsResolver\Icon_Matcher;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Icon_Matcher extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();
		Icon_Matcher::reset();
	}

	public function tearDown(): void {
		Icon_Matcher::reset();
		parent::tearDown();
	}

	public function test_exact_name_match__arrow_down_1_9() {
		$entry = $this->make_entry( 'arrow-down-1-9' );
		$result = Icon_Matcher::match( $entry, 'arrow-down-1-9', '1-9-arrow-down', [] );

		$this->assertSame( Icon_Matcher::SCORE_EXACT_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	public function test_exact_name_match__arrow_down_9_1() {
		$entry = $this->make_entry( 'arrow-down-9-1' );
		$result = Icon_Matcher::match( $entry, 'arrow-down-9-1', '1-9-arrow-down', [] );

		$this->assertSame( Icon_Matcher::SCORE_EXACT_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	public function test_exact_name_match__arrow_down_a_z() {
		$entry = $this->make_entry( 'arrow-down-a-z' );
		$result = Icon_Matcher::match( $entry, 'arrow-down-a-z', 'a-arrow-down-z', [] );

		$this->assertSame( Icon_Matcher::SCORE_EXACT_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	public function test_exact_name_match__arrow_down_z_a() {
		$entry = $this->make_entry( 'arrow-down-z-a' );
		$result = Icon_Matcher::match( $entry, 'arrow-down-z-a', 'a-arrow-down-z', [] );

		$this->assertSame( Icon_Matcher::SCORE_EXACT_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	public function test_exact_name_match__arrow_down_short_wide() {
		$entry = $this->make_entry( 'arrow-down-short-wide' );
		$result = Icon_Matcher::match( $entry, 'arrow-down-short-wide', 'arrow-down-short-wide', [] );

		$this->assertSame( Icon_Matcher::SCORE_EXACT_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	public function test_exact_name_match__arrow_down_wide_short() {
		$entry = $this->make_entry( 'arrow-down-wide-short' );
		$result = Icon_Matcher::match( $entry, 'arrow-down-wide-short', 'arrow-down-short-wide', [] );

		$this->assertSame( Icon_Matcher::SCORE_EXACT_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	public function test_exact_name_match__left_right() {
		$entry = $this->make_entry( 'left-right' );
		$result = Icon_Matcher::match( $entry, 'left-right', 'left-right', [] );

		$this->assertSame( Icon_Matcher::SCORE_EXACT_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	public function test_exact_name_match__right_left() {
		$entry = $this->make_entry( 'right-left' );
		$result = Icon_Matcher::match( $entry, 'right-left', 'left-right', [] );

		$this->assertSame( Icon_Matcher::SCORE_EXACT_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	public function test_exact_name_match__magnifying_glass_reports_name_not_label() {
		$entry = [
			'name' => 'magnifying-glass',
			'label' => 'Magnifying Glass',
			'aliases' => [],
			'terms' => [ 'search' ],
			'categories' => [],
		];

		$result = Icon_Matcher::match( $entry, 'magnifying-glass', 'glass-magnifying', [] );

		$this->assertSame( Icon_Matcher::SCORE_EXACT_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	public function test_prefix_match__free_does_not_match_freebsd() {
		$entry = $this->make_entry( 'freebsd' );
		$needle_preserve = Icon_Matcher::normalize_preserve_order( 'free' );
		$needle_sorted = Icon_Matcher::normalize( 'free' );
		$tokens = Icon_Matcher::tokenize( $needle_sorted );

		$result = Icon_Matcher::match( $entry, $needle_preserve, $needle_sorted, $tokens );

		$this->assertNull( $result );
	}

	public function test_prefix_match__free_matches_free_code_camp() {
		$entry = $this->make_entry( 'free-code-camp' );
		$needle_preserve = Icon_Matcher::normalize_preserve_order( 'free' );
		$needle_sorted = Icon_Matcher::normalize( 'free' );
		$tokens = [];

		$result = Icon_Matcher::match( $entry, $needle_preserve, $needle_sorted, $tokens );

		$this->assertNotNull( $result );
		$this->assertSame( Icon_Matcher::SCORE_PREFIX_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	private function make_entry( string $name ): array {
		return [
			'name' => $name,
			'label' => str_replace( '-', ' ', ucwords( $name, '-' ) ),
			'aliases' => [],
			'terms' => [],
			'categories' => [],
		];
	}
}
