<?php

namespace Elementor\Modules\Agents;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Core\Kits\Documents\Tabs\Settings_Agents;
use Elementor\Modules\Agents\AdminMenuItems\Editor_One_Agents_Ready_Menu;
use Elementor\Modules\Agents\Classes\Feature_Component;
use Elementor\Modules\Agents\Classes\Feature_Registry;
use Elementor\Modules\Agents\Classes\Llms_Content_Ajax;
use Elementor\Modules\Agents\Classes\Markdown_Content_Catalog;
use Elementor\Modules\Agents\Classes\Markdown_Preview_Ajax;
use Elementor\Modules\Agents\Classes\Markdown_Search_Ajax;
use Elementor\Modules\Agents\Classes\Request_Path;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Agent_Skills;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Api_Catalog;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Ard_Manifest;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Auth_Md;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Oauth_Authorization_Server;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Oauth_Protected_Resource;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Webmcp_Manifest;
use Elementor\Modules\Agents\Components\Discovery\Well_Known\Well_Known_Router;
use Elementor\Modules\Agents\Components\Discovery\Link_Headers;
use Elementor\Modules\Agents\Components\Readability\Markdown_Endpoint;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'agent_ready';

	const PACKAGES = [
		'editor-agents',
	];

	/** Default HTTP max-age for the served response (5 minutes). */
	const DEFAULT_CACHE_MAX_AGE = 300;

	const PAGE_ID = 'elementor-agents-ready';

	const MOUNT_ID = 'e-agents-ready';

	const SCRIPT_HANDLE = 'e-agents-ready-app';

	const CONFIG_OBJECT_NAME = 'elementorAgentsReadyConfig';

	const AJAX_OPT_IN_ACTION = 'agents_ready_opt_in';

	const EDITOR_ONE_MENU_REGISTER_PRIORITY = 12;

	const LLMS_FILENAME = 'llms.txt';

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

	private Feature_Registry $feature_registry;
	private Llms_Cache $cache;
	private Content_Generator $generator;
	private Robots_Txt_Handler $robots_handler;
	private Well_Known_Router $well_known_router;
	private Agent_Ready_Settings $settings;
	private Llms_Manual_Content $manual_content;
	private Bot_Catalog $bot_catalog;
	private Markdown_Endpoint $markdown_endpoint;

	public function get_name() {
		return 'agents';
	}

	public static function get_experimental_data() {
		return [
			'name'           => self::EXPERIMENT_NAME,
			'title'          => esc_html__( 'Agent Ready', 'elementor' ),
			'description'    => esc_html__( 'Make your site fully discoverable and readable by AI agents: auto-generated llms.txt, markdown endpoints for every page, and per-bot robots.txt controls.', 'elementor' ),
			'hidden'         => true,
			'default'        => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public static function is_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
	}

	public function __construct() {
		parent::__construct();

		add_action( 'plugins_loaded', [ $this, 'check_seo_plugin_conflict' ], 20 );

		if ( ! self::is_active() ) {
			return;
		}

		$sanitizer              = new Prompt_Injection_Sanitizer();
		$this->generator        = new Content_Generator( $sanitizer );
		$this->cache            = new Llms_Cache();
		$this->bot_catalog      = new Bot_Catalog();
		$this->feature_registry = new Feature_Registry();
		$this->settings         = new Agent_Ready_Settings( $this->generator, $this->bot_catalog );
		$this->robots_handler   = new Robots_Txt_Handler( $this->settings );
		$this->manual_content   = new Llms_Manual_Content( $this->generator );

		$this->settings->register();

		foreach ( [ Agent_Ready_Settings::OPTION, Llms_Manual_Content::OPTION ] as $option ) {
			add_action( "add_option_{$option}", [ $this, 'on_settings_change' ] );
			add_action( "update_option_{$option}", [ $this, 'on_settings_change' ] );
		}

		add_action( 'elementor/kit/register_tabs', [ $this, 'register_kit_tabs' ] );

		add_action( 'template_redirect', [ $this, 'maybe_serve_llms_txt' ], 1 );
		add_action( 'template_redirect', [ $this, 'maybe_serve_llms_full_txt' ], 1 );

		add_action( 'save_post', [ $this, 'on_post_change' ], 10, 2 );
		add_action( 'trashed_post', [ $this, 'on_post_state_change' ] );
		add_action( 'untrashed_post', [ $this, 'on_post_state_change' ] );
		add_action( 'before_delete_post', [ $this, 'on_post_state_change' ] );
		add_action( 'elementor/document/after_save', [ $this, 'on_elementor_document_save' ] );
		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );

		add_action( 'switch_theme', [ $this, 'on_global_change' ] );
		add_action( 'activated_plugin', [ $this, 'on_global_change' ] );
		add_action( 'deactivated_plugin', [ $this, 'on_global_change' ] );
		add_action( 'elementor/core/files/clear_cache', [ $this, 'on_global_change' ] );

		$this->robots_handler->register();

		$this->well_known_router = new Well_Known_Router( $this->settings );
		$this->add_component( 'well_known_router', $this->well_known_router );
		$this->well_known_router->init();

		$this->register_well_known_endpoint( new Oauth_Authorization_Server() );
		$this->register_well_known_endpoint( new Webmcp_Manifest() );
		$this->register_well_known_endpoint( new Oauth_Protected_Resource() );
		$this->register_well_known_endpoint( new Auth_Md() );
		$this->register_well_known_endpoint( new Api_Catalog() );
		$this->register_well_known_endpoint( new Agent_Skills() );
		$this->register_well_known_endpoint( new Ard_Manifest() );

		$this->markdown_endpoint = new Markdown_Endpoint( $this->settings );

		$this->register_component( new Link_Headers( $this->markdown_endpoint, $this->settings ) );
		$this->register_component( $this->markdown_endpoint );

		add_filter( 'elementor/editor/v2/packages', [ $this, 'add_packages' ] );
		add_action( 'admin_init', [ $this, 'maybe_detect_existing_file' ] );

		add_action( 'elementor/editor-one/menu/register', [ $this, 'register_editor_one_menu' ], self::EDITOR_ONE_MENU_REGISTER_PRIORITY );
		add_action( 'elementor/editor-one/menu/after_register_hidden_submenus', [ $this, 'enqueue_assets_for_editor_one_menu' ] );
	}

	// -------------------------------------------------------------------------
	// Kit tabs
	// -------------------------------------------------------------------------

	/**
	 * Register Agents settings on the active kit.
	 *
	 * @param Kit $kit Active kit document.
	 */
	public function register_kit_tabs( $kit ) {
		$kit->register_tab( 'settings-agents', Settings_Agents::class );
	}

	// -------------------------------------------------------------------------
	// Editor One menu
	// -------------------------------------------------------------------------

	/**
	 * Register the Agent Ready item in Editor One.
	 *
	 * @param Menu_Data_Provider $menu_data_provider Editor One menu registry.
	 */
	public function register_editor_one_menu( Menu_Data_Provider $menu_data_provider ): void {
		$menu_data_provider->register_menu( new Editor_One_Agents_Ready_Menu() );
	}

	public function enqueue_assets_for_editor_one_menu( array $hooks ): void {
		if ( ! empty( $hooks[ self::PAGE_ID ] ) ) {
			add_action( "admin_print_scripts-{$hooks[ self::PAGE_ID ]}", [ $this, 'enqueue_assets' ] );
		}
	}

	public function enqueue_assets(): void {
		wp_enqueue_script(
			self::SCRIPT_HANDLE,
			$this->get_js_assets_url( 'agents-ready' ),
			[ 'react', 'react-dom', 'elementor-common', 'elementor-v2-ui', 'wp-api-fetch' ],
			ELEMENTOR_VERSION,
			true
		);

		wp_localize_script(
			self::SCRIPT_HANDLE,
			self::CONFIG_OBJECT_NAME,
			$this->get_app_config()
		);

		wp_set_script_translations( self::SCRIPT_HANDLE, 'elementor' );
	}

	public function register_ajax_actions( Ajax $ajax ): void {
		$ajax->register_ajax_action( self::AJAX_OPT_IN_ACTION, [ $this, 'ajax_opt_in' ] );

		$llms_content_ajax = new Llms_Content_Ajax( $this->settings, $this->manual_content );
		$ajax->register_ajax_action( Llms_Content_Ajax::ACTION, [ $llms_content_ajax, 'handle' ] );

		$markdown_preview_ajax = new Markdown_Preview_Ajax( $this->markdown_endpoint );
		$ajax->register_ajax_action( Markdown_Preview_Ajax::ACTION, [ $markdown_preview_ajax, 'handle' ] );

		$markdown_search_ajax = new Markdown_Search_Ajax( $this->settings, new Markdown_Content_Catalog() );
		$ajax->register_ajax_action( Markdown_Search_Ajax::ACTION, [ $markdown_search_ajax, 'handle' ] );
	}

	public function ajax_opt_in(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( 'Permission denied' );
		}

		$feature_key = Plugin::$instance->experiments->get_feature_option_key( self::EXPERIMENT_NAME );

		update_option( $feature_key, Experiments_Manager::STATE_ACTIVE );
	}

	// -------------------------------------------------------------------------
	// HTTP request handling
	// -------------------------------------------------------------------------

	/**
	 * Serve llms.txt when the request path matches.
	 */
	public function maybe_serve_llms_txt() {
		if ( ! $this->is_request_for( 'llms.txt' ) ) {
			return;
		}

		// If the admin has chosen to keep an existing physical file, bail so the
		// web server (or another handler) can serve it.
		if ( 'keep' === get_option( self::OPTION_EXISTING_FILE_DECISION, '' ) ) {
			return;
		}

		if ( ! $this->settings->is_llms_enabled() ) {
			return;
		}

		$manual_content = $this->settings->is_llms_manually_edited()
			? $this->manual_content->get_content()
			: '';

		if ( '' !== $manual_content ) {
			$this->serve_plain_text( $manual_content, $this->manual_content->get_modified_at() );
			return;
		}

		$this->serve_plain_text( $this->get_generated_llms_txt(), $this->cache->get_modified_time() );
	}

	public function maybe_serve_llms_full_txt() {
		if ( ! $this->is_request_for( 'llms-full.txt' ) ) {
			return;
		}

		if ( ! $this->settings->is_llms_enabled() ) {
			return;
		}

		$this->serve_plain_text( $this->get_generated_llms_full_txt(), $this->cache->get_modified_time() );
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
		$content   = $this->generator->generate_llms_txt( $overrides, $this->settings->get_llms_post_types() );

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
		$content   = $this->generator->generate_llms_full_txt( $overrides, $this->settings->get_llms_post_types() );

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
		if ( ! ( $document instanceof Kit ) ) {
			return;
		}

		$kit_id = $document->get_main_id();

		if ( $kit_id ) {
			$this->generator->clear_post_cache( $kit_id );
		}

		$this->invalidate_cache( $kit_id );
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

	/**
	 * Invalidate cache when the Agent Ready settings or the edited llms.txt content change.
	 */
	public function on_settings_change(): void {
		$this->invalidate_cache( 0 );
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
			'on' === ( get_option( 'rank_math_modules', [] )['llms-txt'] ?? '' )
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

		if ( self::has_physical_llms_file() ) {
			// Store a transient so the admin notice can surface the conflict.
			set_transient( 'elementor_agents_llms_existing_file_detected', true, DAY_IN_SECONDS );
		}
	}

	/**
	 * A real file in the site root is served by the web server before WordPress
	 * runs, so when one exists the module must stay out of the way.
	 *
	 * The home path (not ABSPATH) is used so subdirectory installs are handled.
	 */
	public static function has_physical_llms_file(): bool {
		if ( ! function_exists( 'get_home_path' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		return file_exists( get_home_path() . self::LLMS_FILENAME );
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
			$current['intro'] = $this->generator->prepare_override_text( $overrides['intro'] );
		}

		if ( isset( $overrides['optional'] ) ) {
			$current['optional'] = $this->generator->prepare_override_text( $overrides['optional'] );
		}

		update_option( self::OPTION_OVERRIDES, $current, false );
		$this->invalidate_cache( 0 );
	}

	// -------------------------------------------------------------------------
	// HTTP serving helpers
	// -------------------------------------------------------------------------

	/**
	 * Send a plain-text HTTP response with caching headers, honoring conditional requests.
	 *
	 * @param string $content       Plain-text payload.
	 * @param int    $last_modified Unix timestamp of the last content change, or 0 when unknown.
	 */
	private function serve_plain_text( string $content, int $last_modified ): void {
		if ( '' === $content ) {
			return;
		}

		$etag = $this->get_etag( $content );

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

	/**
	 * Register this module's editor packages with the packages list.
	 *
	 * @param array $packages Package slugs to register.
	 * @return array
	 */
	public function add_packages( array $packages ): array {
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

	private function get_app_config(): array {
		$this->settings->ensure_option_exists();

		return [
			'isExperimentActive' => Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME ),
			'llms'               => $this->get_llms_state(),
			'markdown'           => $this->get_markdown_state(),
			'botAccess'          => $this->get_bot_access_state(),
			'agentDiscovery'     => $this->get_agent_discovery_state(),
		];
	}

	private function get_agent_discovery_state(): array {
		$files = [];

		foreach ( array_keys( $this->well_known_router->get_applicable_endpoints() ) as $slug ) {
			$files[] = [
				'slug' => $slug,
				'url'  => home_url( Well_Known_Router::WELL_KNOWN_PREFIX . $slug ),
			];
		}

		return [
			'enabled' => $this->settings->is_agent_discovery_enabled(),
			'files'   => $files,
		];
	}

	private function get_bot_access_state(): array {
		return [
			'enabled'         => $this->settings->is_bot_access_enabled(),
			'hasPhysicalFile' => $this->robots_handler->has_physical_robots_txt(),
			'bots'            => $this->get_managed_bot_rows(),
			'catalog'         => $this->get_bot_catalog_rows(),
		];
	}

	private function get_managed_bot_rows(): array {
		$rows = [];

		foreach ( $this->settings->get_managed_bots() as $token => $permissions ) {
			$rows[] = [
				'token'   => $token,
				'search'  => $permissions[ Agent_Ready_Settings::BOT_PERMISSION_SEARCH ],
				'aiInput' => $permissions[ Agent_Ready_Settings::BOT_PERMISSION_AI_INPUT ],
				'aiTrain' => $permissions[ Agent_Ready_Settings::BOT_PERMISSION_AI_TRAIN ],
			];
		}

		return $rows;
	}

	private function get_bot_catalog_rows(): array {
		return array_map(
			fn( array $bot ) => [
				'token'   => $bot['token'],
				'name'    => $bot['name'],
				'vendor'  => $bot['vendor'],
				'logoUrl' => $this->bot_catalog->get_logo_url( $bot['logo'] ),
			],
			$this->bot_catalog->get_bots()
		);
	}

	private function get_llms_state(): array {
		return [
			'enabled'          => $this->settings->is_llms_enabled(),
			'isManuallyEdited' => $this->settings->is_llms_manually_edited(),
			'hasPhysicalFile'  => self::has_physical_llms_file(),
			'fileUrl'          => home_url( '/' . self::LLMS_FILENAME ),
			'postTypes'        => $this->get_post_type_rows( $this->settings->get_llms_post_types() ),
		];
	}

	private function get_markdown_state(): array {
		return [
			'enabled'   => $this->settings->is_markdown_enabled(),
			'postTypes' => $this->get_post_type_rows( $this->settings->get_markdown_post_types() ),
		];
	}

	/**
	 * @param string[] $included_post_types
	 */
	private function get_post_type_rows( array $included_post_types ): array {
		$post_types = [];

		foreach ( $this->generator->get_available_post_types() as $name => $label ) {
			$post_types[] = [
				'name'     => $name,
				'label'    => $label,
				'count'    => (int) ( wp_count_posts( $name )->publish ?? 0 ),
				'included' => in_array( $name, $included_post_types, true ),
			];
		}

		return $post_types;
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
		return Request_Path::matches( $filename );
	}

	/**
	 * Preserved for backward compatibility with existing tests that reference
	 * the old private method name.
	 */
	private function is_llms_txt_request(): bool {
		return $this->is_request_for( 'llms.txt' );
	}

	/**
	 * Return the feature registry so external code can query registered components.
	 */
	public function get_feature_registry(): Feature_Registry {
		return $this->feature_registry;
	}

	/**
	 * Add a feature component to the registry and to the base module's
	 * component store, then call register() if the component is enabled.
	 */
	private function register_component( Feature_Component $component ): void {
		$this->feature_registry->register( $component );
		$this->add_component( $component->get_id(), $component );

		if ( $component->is_enabled() ) {
			$component->register();
		}
	}

	/**
	 * Register a well-known endpoint component.
	 *
	 * Adds it to the feature registry, the module's component store, and the
	 * well-known router. The router handles dispatch — the component's own
	 * register() is a no-op. Disabled/inapplicable endpoints are still
	 * registered so the router and registry are always complete.
	 *
	 * @param \Elementor\Modules\Agents\Components\Discovery\Well_Known\Abstract_Well_Known_Endpoint $endpoint
	 */
	private function register_well_known_endpoint( $endpoint ): void {
		$this->feature_registry->register( $endpoint );
		$this->add_component( $endpoint->get_id(), $endpoint );
		$this->well_known_router->register_endpoint( $endpoint );
	}
}
