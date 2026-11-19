<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Classes\Dashboard_Overview_Block;
use Elementor\Modules\Agents\Classes\Scanner_Report_Store;
use Elementor\Modules\Agents\Module;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Dashboard_Overview_Block extends Elementor_Test_Base {

	private Scanner_Report_Store $scanner_store;

	private Dashboard_Overview_Block $block;

	public function setUp(): void {
		parent::setUp();

		delete_option( Scanner_Report_Store::OPTION_LAST_REPORT );

		$this->scanner_store = new Scanner_Report_Store();
		$this->block = new Dashboard_Overview_Block( $this->scanner_store );

		$this->act_as_admin();
	}

	public function tearDown(): void {
		delete_option( Scanner_Report_Store::OPTION_LAST_REPORT );

		parent::tearDown();
	}

	public function test_get_state__not_scanned_without_report() {
		// Act
		$state = $this->block->get_state();

		// Assert
		$this->assertSame( Dashboard_Overview_Block::STATE_NOT_SCANNED, $state );
	}

	/**
	 * @dataProvider score_state_provider
	 */
	public function test_get_state__maps_score_boundaries( $score, $expected_state ) {
		// Arrange
		$this->scanner_store->save_report( [ 'score' => $score ] );

		// Act
		$state = $this->block->get_state();

		// Assert
		$this->assertSame( $expected_state, $state );
	}

	public function score_state_provider(): array {
		return [
			'zero' => [ 0, Dashboard_Overview_Block::STATE_NEEDS_WORK ],
			'needs work upper bound' => [ 30, Dashboard_Overview_Block::STATE_NEEDS_WORK ],
			'getting there lower bound' => [ 31, Dashboard_Overview_Block::STATE_GETTING_THERE ],
			'getting there upper bound' => [ 80, Dashboard_Overview_Block::STATE_GETTING_THERE ],
			'strong lower bound' => [ 81, Dashboard_Overview_Block::STATE_STRONG ],
			'perfect' => [ 100, Dashboard_Overview_Block::STATE_STRONG ],
			'above max is clamped' => [ 140, Dashboard_Overview_Block::STATE_STRONG ],
		];
	}

	public function test_get_fixes_count__counts_only_failing_checks() {
		// Arrange
		$report = [
			'score' => 50,
			'checks' => [
				[ 'id' => 'a', 'status' => 'fail' ],
				[ 'id' => 'b', 'status' => 'partial' ],
				[ 'id' => 'c', 'status' => 'pass' ],
			],
		];

		// Act
		$count = $this->block->get_fixes_count( $report );

		// Assert
		$this->assertSame( 2, $count );
	}

	public function test_get_cta_url__targets_scanner_page() {
		// Act
		$url = $this->block->get_cta_url();

		// Assert
		$this->assertStringContainsString( 'page=' . Module::PAGE_ID, $url );
	}

	public function test_render__prompts_to_scan_when_not_scanned() {
		// Act
		$html = $this->render_block();

		// Assert
		$this->assertStringContainsString( 'Your site might not be visible to AI agents.', $html );
		$this->assertStringContainsString( 'data-agent-ready-cta="not_scanned"', $html );
		$this->assertStringContainsString( 'Scan &amp; Fix', $html );
	}

	public function test_render__shows_score_label_and_fixes_for_scanned_site() {
		// Arrange
		$this->scanner_store->save_report( [
			'score' => 42,
			'checks' => [
				[ 'id' => 'a', 'status' => 'fail' ],
				[ 'id' => 'b', 'status' => 'partial' ],
			],
		] );

		// Act
		$html = $this->render_block();

		// Assert
		$this->assertStringContainsString( '42/100 · Getting there', $html );
		$this->assertStringContainsString( '2 quick fixes', $html );
		$this->assertStringContainsString( 'Fix now', $html );
	}

	public function test_render__strong_score_links_to_report_without_fixes() {
		// Arrange
		$this->scanner_store->save_report( [
			'score' => 90,
			'checks' => [
				[ 'id' => 'a', 'status' => 'partial' ],
			],
		] );

		// Act
		$html = $this->render_block();

		// Assert
		$this->assertStringContainsString( '90/100 · Strong', $html );
		$this->assertStringContainsString( 'View report', $html );
		$this->assertStringNotContainsString( 'quick fix', $html );
	}

	public function test_render__outputs_nothing_for_non_admin() {
		// Arrange
		$this->act_as_editor();

		// Act
		$html = $this->render_block();

		// Assert
		$this->assertSame( '', trim( $html ) );
	}

	private function render_block(): string {
		ob_start();
		$this->block->render();

		return ob_get_clean();
	}
}
