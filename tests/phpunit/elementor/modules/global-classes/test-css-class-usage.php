<?php

namespace Elementor\Tests\Modules\GlobalClasses\Usage;

use Elementor\Modules\GlobalClasses\Usage\Css_Class_Usage;
use PHPUnit\Framework\TestCase;

class Test_Css_Class_Usage extends TestCase {

	public function test_track_usage_adds_new_page(): void {
		$usage = new Css_Class_Usage( 'g-a' );
		$usage->track_usage( 101, 'Test Page', 'el-1', 'wp-page' );

		$this->assertSame(1, $usage->get_total_usage());
		$pages = $usage->get_pages();

		$this->assertArrayHasKey(101, $pages);
		$this->assertEquals('Test Page', $pages[101]['title']);
		$this->assertEquals('wp-page', $pages[101]['type']);
		$this->assertEquals(['el-1'], $pages[101]['elements']);
		$this->assertEquals(1, $pages[101]['total']);
	}

	public function test_track_usage_appends_elements_and_increments_total(): void {
		$usage = new Css_Class_Usage( 'g-b' );
		$usage->track_usage( 202, 'Another Page', 'el-1', 'footer' );
		$usage->track_usage( 202, 'Another Page', 'el-2', 'footer' );

		$this->assertSame(2, $usage->get_total_usage());
		$pages = $usage->get_pages();

		$this->assertEquals(['el-1', 'el-2'], $pages[202]['elements']);
		$this->assertEquals(2, $pages[202]['total']);
	}

	public function test_merge_combines_different_pages(): void {
		$base = new Css_Class_Usage( 'g-c' );
		$base->track_usage( 1, 'Base Page', 'el-base', 'wp-page' );

		$other = new Css_Class_Usage( 'g-c' );
		$other->track_usage( 2, 'Other Page', 'el-other', 'popup' );

		$base->merge( $other );

		$this->assertSame(2, $base->get_total_usage());
		$pages = $base->get_pages();

		$this->assertCount(2, $pages);
		$this->assertEquals(['el-base'], $pages[1]['elements']);
		$this->assertEquals(['el-other'], $pages[2]['elements']);
	}

	public function test_merge_combines_same_page_and_appends_elements(): void {
		$base = new Css_Class_Usage( 'g-d' );
		$base->track_usage( 1, 'Shared Page', 'el-a', 'header' );

		$other = new Css_Class_Usage( 'g-d' );
		$other->track_usage( 1, 'Shared Page', 'el-b', 'header' );

		$base->merge( $other );

		$this->assertSame(2, $base->get_total_usage());
		$pages = $base->get_pages();

		$this->assertCount(1, $pages);
		$this->assertEquals(['el-a', 'el-b'], $pages[1]['elements']);
		$this->assertEquals(2, $pages[1]['total']);
	}

	public function test_merge_fails_with_mismatched_class_ids(): void {
		$this->expectException(\InvalidArgumentException::class);
		$this->expectExceptionMessage('Mismatched class ID');

		$a = new Css_Class_Usage( 'g-x' );
		$b = new Css_Class_Usage( 'g-y' );

		$a->merge( $b );
	}
}
