<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Llms_Cache;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Llms_Cache extends Elementor_Test_Base {

	private Llms_Cache $cache;

	public function setUp(): void {
		parent::setUp();
		$this->cache = new Llms_Cache();
		// Ensure a clean state before each test.
		$this->cache->invalidate();
	}

	public function tearDown(): void {
		$this->cache->invalidate();
		parent::tearDown();
	}

	public function test_get_llms__returns_false_on_cache_miss() {
		$this->assertFalse( $this->cache->get_llms() );
	}

	public function test_get_llms_full__returns_false_on_cache_miss() {
		$this->assertFalse( $this->cache->get_llms_full() );
	}

	public function test_set_and_get_llms() {
		$content = '# My Site';
		$this->cache->set_llms( $content );
		$this->assertSame( $content, $this->cache->get_llms() );
	}

	public function test_set_and_get_llms_full() {
		$content = '# My Site Full';
		$this->cache->set_llms_full( $content );
		$this->assertSame( $content, $this->cache->get_llms_full() );
	}

	public function test_invalidate_clears_both_entries() {
		$this->cache->set_llms( '# llms' );
		$this->cache->set_llms_full( '# llms-full' );

		$this->cache->invalidate();

		$this->assertFalse( $this->cache->get_llms() );
		$this->assertFalse( $this->cache->get_llms_full() );
	}

	public function test_get_modified_time__returns_zero_when_not_set() {
		$this->assertSame( 0, $this->cache->get_modified_time() );
	}

	public function test_get_modified_time__returns_timestamp_after_set() {
		$before = time();
		$this->cache->set_llms( '# content' );
		$after = time();

		$modified = $this->cache->get_modified_time();

		$this->assertGreaterThanOrEqual( $before, $modified );
		$this->assertLessThanOrEqual( $after, $modified );
	}

	public function test_invalidate_resets_modified_time() {
		$this->cache->set_llms( '# content' );
		$this->cache->invalidate();

		$this->assertSame( 0, $this->cache->get_modified_time() );
	}

	public function test_ttl_filter_is_applied() {
		add_filter( 'elementor/agents/llms_txt/cache_ttl', static fn() => 0 );
		$this->cache->set_llms( '# content' );
		remove_all_filters( 'elementor/agents/llms_txt/cache_ttl' );

		// TTL of 0 means the transient expires immediately.
		$this->assertFalse( $this->cache->get_llms() );
	}
}
