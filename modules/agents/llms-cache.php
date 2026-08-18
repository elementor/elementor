<?php

namespace Elementor\Modules\Agents;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Transient-based cache for the generated llms.txt and llms-full.txt content.
 *
 * Cache entries are automatically invalidated whenever any post is
 * saved/published/trashed, or when site options that affect the output change.
 * A manual regenerate action also clears both entries.
 */
class Llms_Cache {

	const TRANSIENT_LLMs     = 'elementor_agents_llms_txt';
	const TRANSIENT_LLMs_FULL = 'elementor_agents_llms_full_txt';
	const TRANSIENT_MODIFIED  = 'elementor_agents_llms_modified';

	/** Default TTL: 1 hour. Long enough to be useful, short enough to self-heal. */
	const DEFAULT_TTL = HOUR_IN_SECONDS;

	/**
	 * Retrieve cached llms.txt content.
	 *
	 * @return string|false Cached string, or false on cache miss.
	 */
	public function get_llms(): string|false {
		return get_transient( self::TRANSIENT_LLMs );
	}

	/**
	 * Retrieve cached llms-full.txt content.
	 *
	 * @return string|false Cached string, or false on cache miss.
	 */
	public function get_llms_full(): string|false {
		return get_transient( self::TRANSIENT_LLMs_FULL );
	}

	/**
	 * Store generated llms.txt content in the cache.
	 *
	 * @param string $content Generated content.
	 */
	public function set_llms( string $content ): void {
		set_transient( self::TRANSIENT_LLMs, $content, $this->get_ttl() );
		$this->touch_modified_time();
	}

	/**
	 * Store generated llms-full.txt content in the cache.
	 *
	 * @param string $content Generated content.
	 */
	public function set_llms_full( string $content ): void {
		set_transient( self::TRANSIENT_LLMs_FULL, $content, $this->get_ttl() );
		$this->touch_modified_time();
	}

	/**
	 * Return the Unix timestamp of the last cache write (used for Last-Modified headers).
	 *
	 * @return int Timestamp, or 0 if the cache has never been populated.
	 */
	public function get_modified_time(): int {
		$value = get_transient( self::TRANSIENT_MODIFIED );
		return is_numeric( $value ) ? (int) $value : 0;
	}

	/**
	 * Invalidate both cache entries.
	 *
	 * Called on post save/publish/trash and on manual regenerate.
	 */
	public function invalidate(): void {
		delete_transient( self::TRANSIENT_LLMs );
		delete_transient( self::TRANSIENT_LLMs_FULL );
		delete_transient( self::TRANSIENT_MODIFIED );
	}

	/**
	 * TTL in seconds, filterable.
	 */
	private function get_ttl(): int {
		/**
		 * Filters how long the generated llms files are cached in the database.
		 *
		 * @param int $ttl Cache lifetime in seconds. Default: HOUR_IN_SECONDS.
		 */
		$ttl = (int) apply_filters( 'elementor/agents/llms_txt/cache_ttl', self::DEFAULT_TTL );
		return max( 0, $ttl );
	}

	private function touch_modified_time(): void {
		set_transient( self::TRANSIENT_MODIFIED, time(), $this->get_ttl() );
	}
}
