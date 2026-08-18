<?php

namespace Elementor\Modules\Agents;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Core\Kits\Documents\Tabs\Settings_Agents;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'agents_llms_txt';

	const PACKAGES = [
		'editor-agents',
	];

	/** Default HTTP max-age for the served response (5 minutes). */
	const DEFAULT_CACHE_MAX_AGE = 300;

	/**
	 * Option name that records whether, at the time the feature was first
	 * activated, a physical llms.txt already existed in the web root.
	 * Value: 'keep' | 'replace' | '' (not decided yet).
	 */
	const OPTION_EXISTING_FILE_DECISION = 'elementor_agents_llms_existing_file_decision';

	/**
	 * Option name that stores per-file overrides the admin can edit:
	 * 'intro' and 'optional' keys.
	 */
	const OPTION_OVERRIDES = 'elementor_agents_llms_overrides';

	private Llms_Cache $cache;
	private Content_Generator $generator;
	private Robots_Txt_Handler $robots_handler;

	public function get_name() {
		return 'agents';
	}

	public static function get_experimental_data() {
		return [
			'name'           => self::EXPERIMENT_NAME,
			'title'          => esc_html__( 'Agents llms.txt', 'elementor' ),
			'description'    => esc_html__( 'Auto-generate /llms.txt and /llms-full.txt from your site content for AI agents.', 'elementor' ),
			'hidden'         => true,
			'default'        => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public function __construct() {
		parent::__construct();

		$sanitizer            = new Prompt_Injection_Sanitizer();
		$this->generator      = new Content_Generator( $sanitizer );
		$this->cache          = new Llms_Cache();
		$this->robots_handler = new Robots_Txt_Handler();

		// HTTP endpoints.
		add_action( 'template_redirect', [ $this, 'maybe_serve_llms_txt' ], 1 );
		add_action( 'template_redirect', [ $this, 'maybe_serve_llms_full_txt' ], 1 );

		// Editor integration.
		add_action( 'elementor/kit/register_tabs', [ $this, 'register_kit_tabs' ] );

		// Cache invalidation — per-post inline cache (post meta) + assembled output (transients).
		add_action( 'save_post',                     [ $this, 'on_post_change' ], 10, 2 );
		add_action( 'trashed_post',                  [ $this, 'on_post_state_change' ] );
		add_action( 'untrashed_post',                [ $this, 'on_post_state_change' ] );
		add_action( 'before_delete_post',            [ $this, 'on_post_state_change' ] );
		add_action( 'elementor/document/after_save', [ $this, 'on_elementor_document_save' ] );

		// Global events that could change rendering for every post (theme/plugin changes).
		add_action( 'switch_theme',       [ $this, 'on_global_change' ] );
		add_action( 'activated_plugin',   [ $this, 'on_global_change' ] );
		add_action( 'deactivated_plugin', [ $this, 'on_global_change' ] );
		add_action( 'elementor/core/files/clear_cache', [ $this, 'on_global_change' ] );

		// robots.txt coordination.
		$this->robots_handler->register();

		// SEO plugin co-existence check (runs after plugins are loaded).
		add_action( 'plugins_loaded', [ $this, 'check_seo_plugin_conflict' ], 20 );

		if ( Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			add_filter( 'elementor/editor/v2/packages', fn( $packages ) => $this->add_packages( $packages ) );

			// On first activation, detect any existing physical llms.txt.
			add_action( 'admin_init', [ $this, 'maybe_detect_existing_file' ] );
		}
	}

	// -------------------------------------------------------------------------
	// Kit tabs
	// -------------------------------------------------------------------------

	/**
	 * @param Kit $kit
	 */
	public function register_kit_tabs( $kit ) {
		if ( ! Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			return;
		}

		$kit->register_tab( 'settings-agents', Settings_Agents::class );
	}

	// -------------------------------------------------------------------------
	// HTTP request handling
	// -------------------------------------------------------------------------

	public function maybe_serve_llms_txt() {
		if ( ! $this->is_request_for( 'llms.txt' ) ) {
			return;
		}

		// If the admin has chosen to keep an existing physical file, bail so the
		// web server (or another handler) can serve it.
		if ( 'keep' === get_option( self::OPTION_EXISTING_FILE_DECISION, '' ) ) {
			return;
		}

		$content = $this->get_generated_llms_txt();
		$this->serve_plain_text( $content );
	}

	public function maybe_serve_llms_full_txt() {
		if ( ! $this->is_request_for( 'llms-full.txt' ) ) {
			return;
		}

		$content = $this->get_generated_llms_full_txt();
		$this->serve_plain_text( $content );
	}

	// -------------------------------------------------------------------------
	// Content retrieval (cache-aware)
	// -------------------------------------------------------------------------

	/**
	 * Return the generated llms.txt string, served from cache when available.
	 */
	public function get_generated_llms_txt(): string {
		$cached = $this->cache->get_llms();

		if ( false !== $cached ) {
			return $cached;
		}

		$overrides = $this->get_overrides();
		$content   = $this->generator->generate_llms_txt( $overrides );

		if ( '' !== $content ) {
			$this->cache->set_llms( $content );
		}

		return $content;
	}

	/**
	 * Return the generated llms-full.txt string, served from cache when available.
	 */
	public function get_generated_llms_full_txt(): string {
		$cached = $this->cache->get_llms_full();

		if ( false !== $cached ) {
			return $cached;
		}

		$overrides = $this->get_overrides();
		$content   = $this->generator->generate_llms_full_txt( $overrides );

		if ( '' !== $content ) {
			$this->cache->set_llms_full( $content );
		}

		return $content;
	}

	/**
	 * Return any human-readable warnings about missing site configuration that
	 * would improve the generated output quality.
	 *
	 * @return string[]
	 */
	public function get_missing_requirements(): array {
		return $this->generator->get_missing_requirements();
	}

	// -------------------------------------------------------------------------
	// Legacy / kit-based content (kept for backward compatibility)
	// -------------------------------------------------------------------------

	/**
	 * Return the manually-entered llms.txt content stored in kit settings.
	 *
	 * This was the original behaviour (pre-auto-generation). The auto-generated
	 * content now takes precedence; this method is preserved so external code
	 * and the existing test-suite continue to work.
	 *
	 * @deprecated Use get_generated_llms_txt() instead.
	 */
	public function get_llms_txt_content(): string {
		$kit    = Plugin::$instance->kits_manager->get_active_kit();
		$agents = $kit->get_settings( 'agents' );

		if ( ! is_array( $agents ) || ! isset( $agents['llms'] ) ) {
			return '';
		}

		$llms = $agents['llms'];

		return is_string( $llms ) ? $llms : '';
	}

	// -------------------------------------------------------------------------
	// Cache invalidation
	// -------------------------------------------------------------------------

	/**
	 * Invalidate cache when any post is saved (including auto-drafts on publish).
	 *
	 * We only invalidate for post types that actually appear in the output,
	 * skipping revisions, attachments, etc., for performance.
	 *
	 * @param int      $post_id
	 * @param \WP_Post $post
	 */
	public function on_post_change( int $post_id, \WP_Post $post ) {
		if ( wp_is_post_revision( $post_id ) ) {
			return;
		}

		if ( in_array( $post->post_type, Content_Generator::EXCLUDED_POST_TYPES, true ) ) {
			return;
		}

		// Clear the per-post inline-content cache (post meta) for this specific
		// post, then blow the assembled-output transients.
		$this->generator->clear_post_cache( $post_id );
		$this->invalidate_cache( $post_id );
	}

	/**
	 * Invalidate cache when a post is trashed, untrashed, or permanently deleted.
	 *
	 * @param int $post_id
	 */
	public function on_post_state_change( int $post_id ) {
		$this->generator->clear_post_cache( $post_id );
		$this->invalidate_cache( $post_id );
	}

	/**
	 * Invalidate cache on Elementor document saves (handles kit saves too).
	 *
	 * @param mixed $document
	 */
	public function on_elementor_document_save( $document ) {
		$post_id = $document instanceof \Elementor\Core\Base\Document
			? $document->get_main_id()
			: 0;

		if ( $post_id ) {
			$this->generator->clear_post_cache( $post_id );
		}

		$this->invalidate_cache( $post_id );

		if ( $document instanceof Kit ) {
			/**
			 * Fires when the /llms.txt response may have changed, so external
			 * page-caches and CDNs can purge their copy.
			 *
			 * @param int $kit_id The saved kit post ID.
			 */
			do_action( 'elementor/agents/llms_txt/cache_invalidated', $document->get_main_id() );
		}
	}

	/**
	 * Kept for backward compatibility (old hook name used in tests).
	 *
	 * @param mixed $document
	 */
	public function maybe_invalidate_llms_txt_cache( $document ) {
		$this->on_elementor_document_save( $document );
	}

	/**
	 * Full invalidation: clears every post's inline-content meta cache AND the
	 * assembled-output transients.
	 *
	 * Triggered by events that can affect the rendered output of every post at
	 * once — theme switch, plugin (de)activation, Elementor cache clear.
	 */
	public function on_global_change(): void {
		$this->generator->clear_all_post_caches();
		$this->cache->invalidate();
		do_action( 'elementor/agents/llms_txt/cache_invalidated', 0 );
	}

	// -------------------------------------------------------------------------
	// SEO plugin detection
	// -------------------------------------------------------------------------

	/**
	 * If a known SEO plugin is already generating an llms.txt, default this
	 * feature to inactive so we don't serve competing files.
	 *
	 * This runs after all plugins are loaded, so is_plugin_active() is reliable.
	 */
	public function check_seo_plugin_conflict() {
		if ( ! function_exists( 'is_plugin_active' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		if ( $this->seo_plugin_generates_llms_txt() ) {
			// Override the default to inactive so new installs don't collide.
			// (Existing explicit activations are not reverted.)
			add_filter(
				'elementor/experiments/feature_defaults',
				function ( array $defaults ) {
					$defaults[ self::EXPERIMENT_NAME ] = Experiments_Manager::STATE_INACTIVE;
					return $defaults;
				}
			);
		}
	}

	/**
	 * Return true if a known SEO plugin is active and likely generating llms.txt.
	 */
	public function seo_plugin_generates_llms_txt(): bool {
		// Yoast SEO — llms.txt generation was added in Yoast SEO 22.x (2024).
		if (
			is_plugin_active( 'wordpress-seo/wp-seo.php' ) &&
			(
				// Check the Yoast option that enables llms.txt generation.
				'1' === (string) ( get_option( 'wpseo', [] )['enable_llm_txt'] ?? '' ) ||
				get_option( 'wpseo_llm_txt_enabled', false )
			)
		) {
			return true;
		}

		// RankMath SEO.
		if (
			is_plugin_active( 'seo-by-rank-math/rank-math.php' ) &&
			'on' === get_option( 'rank_math_modules', [] )['llms-txt'] ?? ''
		) {
			return true;
		}

		// All in One SEO Pack.
		if (
			is_plugin_active( 'all-in-one-seo-pack/all_in_one_seo_pack.php' ) &&
			get_option( 'aioseo_options', false )
		) {
			$aioseo = maybe_unserialize( get_option( 'aioseo_options', '' ) );
			if ( ! empty( $aioseo['searchAppearance']['global']['schema']['llmsTxt'] ) ) {
				return true;
			}
		}

		return false;
	}

	// -------------------------------------------------------------------------
	// Existing-file detection
	// -------------------------------------------------------------------------

	/**
	 * On the first admin page-load after the feature is activated, check whether
	 * a physical /llms.txt already exists in the WordPress root. If it does, we
	 * store a flag so the admin UI can prompt the user to decide what to do.
	 */
	public function maybe_detect_existing_file() {
		// Already decided — nothing to do.
		if ( '' !== get_option( self::OPTION_EXISTING_FILE_DECISION, '' ) ) {
			return;
		}

		$existing_file_path = ABSPATH . 'llms.txt';

		if ( file_exists( $existing_file_path ) ) {
			// Store a transient so the admin notice can surface the conflict.
			set_transient( 'elementor_agents_llms_existing_file_detected', true, DAY_IN_SECONDS );
		}
	}

	/**
	 * Record the admin's decision about the pre-existing /llms.txt file.
	 *
	 * @param string $decision 'keep' | 'replace'
	 */
	public function set_existing_file_decision( string $decision ): void {
		if ( ! in_array( $decision, [ 'keep', 'replace' ], true ) ) {
			return;
		}

		update_option( self::OPTION_EXISTING_FILE_DECISION, $decision, false );
		delete_transient( 'elementor_agents_llms_existing_file_detected' );
	}

	/**
	 * Return true if a physical /llms.txt was detected and the admin has not yet
	 * made a decision about it.
	 */
	public function has_pending_existing_file_conflict(): bool {
		return (bool) get_transient( 'elementor_agents_llms_existing_file_detected' );
	}

	// -------------------------------------------------------------------------
	// Overrides (user-editable intro / optional section)
	// -------------------------------------------------------------------------

	/**
	 * Return the stored generator overrides (intro + optional section).
	 *
	 * @return array{intro: string, optional: string}
	 */
	public function get_overrides(): array {
		$stored = get_option( self::OPTION_OVERRIDES, [] );

		return [
			'intro'    => is_string( $stored['intro'] ?? null ) ? $stored['intro'] : '',
			'optional' => is_string( $stored['optional'] ?? null ) ? $stored['optional'] : '',
		];
	}

	/**
	 * Persist the user-editable overrides and invalidate the cache.
	 *
	 * @param array{intro?: string, optional?: string} $overrides
	 */
	public function save_overrides( array $overrides ): void {
		$current = $this->get_overrides();

		if ( isset( $overrides['intro'] ) ) {
			$current['intro'] = sanitize_textarea_field( $overrides['intro'] );
		}

		if ( isset( $overrides['optional'] ) ) {
			$current['optional'] = sanitize_textarea_field( $overrides['optional'] );
		}

		update_option( self::OPTION_OVERRIDES, $current, false );
		$this->cache->invalidate();
	}

	// -------------------------------------------------------------------------
	// HTTP serving helpers
	// -------------------------------------------------------------------------

	private function serve_plain_text( string $content ): void {
		if ( '' === $content ) {
			return;
		}

		$etag          = $this->get_etag( $content );
		$last_modified = $this->cache->get_modified_time();

		header( 'X-Content-Type-Options: nosniff' );
		header( 'Cache-Control: public, max-age=' . $this->get_cache_max_age() );
		header( 'ETag: ' . $etag );

		if ( $last_modified ) {
			header( 'Last-Modified: ' . gmdate( 'D, d M Y H:i:s', $last_modified ) . ' GMT' );
		}

		if ( $this->is_client_cache_fresh( $etag, $last_modified ) ) {
			status_header( 304 );
			exit;
		}

		status_header( 200 );
		header( 'Content-Type: text/plain; charset=utf-8' );
		Utils::print_unescaped_internal_string( $content );
		exit;
	}

	// -------------------------------------------------------------------------
	// Internal helpers
	// -------------------------------------------------------------------------

	private function add_packages( array $packages ): array {
		return array_merge( $packages, self::PACKAGES );
	}

	private function invalidate_cache( int $post_id = 0 ): void {
		$this->cache->invalidate();

		/**
		 * Fires when the cached /llms.txt response has been purged so external
		 * page-caches and CDNs can revalidate.
		 *
		 * @param int $post_id The post ID that triggered the invalidation (0 if unknown).
		 */
		do_action( 'elementor/agents/llms_txt/cache_invalidated', $post_id );
	}

	private function get_cache_max_age(): int {
		/**
		 * Filters how long (in seconds) clients and shared caches may reuse
		 * the served llms files without revalidating.
		 *
		 * @param int $max_age Cache lifetime in seconds.
		 */
		$max_age = (int) apply_filters( 'elementor/agents/llms_txt/cache_max_age', self::DEFAULT_CACHE_MAX_AGE );

		return max( 0, $max_age );
	}

	private function get_etag( string $content ): string {
		return '"' . md5( $content ) . '"';
	}

	private function is_client_cache_fresh( string $etag, int $last_modified ): bool {
		$if_none_match = isset( $_SERVER['HTTP_IF_NONE_MATCH'] )
			? trim( sanitize_text_field( wp_unslash( $_SERVER['HTTP_IF_NONE_MATCH'] ) ) )
			: '';

		// An ETag mismatch must win over If-Modified-Since (1-second resolution).
		if ( '' !== $if_none_match ) {
			return $this->etag_matches( $if_none_match, $etag );
		}

		$if_modified_since = isset( $_SERVER['HTTP_IF_MODIFIED_SINCE'] )
			? trim( sanitize_text_field( wp_unslash( $_SERVER['HTTP_IF_MODIFIED_SINCE'] ) ) )
			: '';

		if ( ! $last_modified || '' === $if_modified_since ) {
			return false;
		}

		$since = strtotime( $if_modified_since );

		return false !== $since && $since >= $last_modified;
	}

	private function etag_matches( string $header, string $etag ): bool {
		foreach ( explode( ',', $header ) as $candidate ) {
			$candidate = trim( $candidate );

			if ( '*' === $candidate ) {
				return true;
			}

			if ( 0 === strpos( $candidate, 'W/' ) ) {
				$candidate = substr( $candidate, 2 );
			}

			if ( $candidate === $etag ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Check whether the current request URI matches a given filename.
	 *
	 * Handles subdirectory WordPress installs transparently.
	 *
	 * @param string $filename e.g. 'llms.txt' or 'llms-full.txt'
	 */
	private function is_request_for( string $filename ): bool {
		$request_uri = isset( $_SERVER['REQUEST_URI'] )
			? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) )
			: '';

		$path = wp_parse_url( $request_uri, PHP_URL_PATH );

		if ( ! is_string( $path ) ) {
			return false;
		}

		$home_path = wp_parse_url( home_url(), PHP_URL_PATH );

		if ( is_string( $home_path ) && '' !== $home_path && '/' !== $home_path ) {
			$home_path = untrailingslashit( $home_path );

			if ( 0 === strpos( $path, $home_path ) ) {
				$path = substr( $path, strlen( $home_path ) );
			}
		}

		$path = untrailingslashit( $path );

		return '/' . $filename === $path || $filename === ltrim( $path, '/' );
	}

	/**
	 * Preserved for backward compatibility with existing tests that reference
	 * the old private method name.
	 */
	private function is_llms_txt_request(): bool {
		return $this->is_request_for( 'llms.txt' );
	}
}
