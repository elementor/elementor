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
		$result = Icon_Matcher::match( $entry, Icon_Matcher::normalize( 'arrow-down-1-9' ), [] );

		$this->assertSame( Icon_Matcher::SCORE_EXACT_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	public function test_exact_name_match__arrow_down_9_1() {
		$entry = $this->make_entry( 'arrow-down-9-1' );
		$result = Icon_Matcher::match( $entry, Icon_Matcher::normalize( 'arrow-down-9-1' ), [] );

		$this->assertSame( Icon_Matcher::SCORE_EXACT_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	public function test_exact_name_match__arrow_down_a_z() {
		$entry = $this->make_entry( 'arrow-down-a-z' );
		$result = Icon_Matcher::match( $entry, Icon_Matcher::normalize( 'arrow-down-a-z' ), [] );

		$this->assertSame( Icon_Matcher::SCORE_EXACT_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	public function test_exact_name_match__arrow_down_z_a() {
		$entry = $this->make_entry( 'arrow-down-z-a' );
		$result = Icon_Matcher::match( $entry, Icon_Matcher::normalize( 'arrow-down-z-a' ), [] );

		$this->assertSame( Icon_Matcher::SCORE_EXACT_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	public function test_exact_name_match__arrow_down_short_wide() {
		$entry = $this->make_entry( 'arrow-down-short-wide' );
		$result = Icon_Matcher::match( $entry, Icon_Matcher::normalize( 'arrow-down-short-wide' ), [] );

		$this->assertSame( Icon_Matcher::SCORE_EXACT_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	public function test_exact_name_match__arrow_down_wide_short() {
		$entry = $this->make_entry( 'arrow-down-wide-short' );
		$result = Icon_Matcher::match( $entry, Icon_Matcher::normalize( 'arrow-down-wide-short' ), [] );

		$this->assertSame( Icon_Matcher::SCORE_EXACT_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	public function test_exact_name_match__left_right() {
		$entry = $this->make_entry( 'left-right' );
		$result = Icon_Matcher::match( $entry, Icon_Matcher::normalize( 'left-right' ), [] );

		$this->assertSame( Icon_Matcher::SCORE_EXACT_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	public function test_exact_name_match__right_left() {
		$entry = $this->make_entry( 'right-left' );
		$result = Icon_Matcher::match( $entry, Icon_Matcher::normalize( 'right-left' ), [] );

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

		$needle = Icon_Matcher::normalize_preserve_order( 'magnifying-glass' );
		$result = Icon_Matcher::match( $entry, $needle, [] );

		$this->assertSame( Icon_Matcher::SCORE_EXACT_NAME, $result['score'] );
		$this->assertSame( Icon_Matcher::MATCHED_ON_NAME, $result['matched_on'] );
	}

	public function test_prefix_match__free_does_not_match_freebsd() {
		$entry = $this->make_entry( 'freebsd' );
		$needle = Icon_Matcher::normalize( 'free' );
		$tokens = Icon_Matcher::tokenize( $needle );

		$result = Icon_Matcher::match( $entry, $needle, $tokens );

		$this->assertNull( $result );
	}

	public function test_prefix_match__free_matches_free_code_camp() {
		$entry = $this->make_entry( 'free-code-camp' );
		$needle = Icon_Matcher::normalize_preserve_order( 'free' );
		$tokens = [];

		$result = Icon_Matcher::match( $entry, $needle, $tokens );

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
