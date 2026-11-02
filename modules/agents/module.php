<?php

namespace Elementor\Modules\Agents;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Core\Utils\Exceptions;
use Elementor\Core\Utils\Hints;
use Elementor\Modules\Agents\AdminMenuItems\Editor_One_Agent_Access_Menu;
use Elementor\Modules\Agents\AdminMenuItems\Editor_One_Agents_Ready_Menu;
use Elementor\Modules\Agents\Classes\Feature_Component;
use Elementor\Modules\Agents\Classes\Feature_Registry;
use Elementor\Modules\Agents\Classes\Llms_Content_Ajax;
use Elementor\Modules\Agents\Classes\Llms_Revert_Ajax;
use Elementor\Modules\Agents\Classes\Llms_Takeover_Ajax;
use Elementor\Modules\Agents\Classes\Module_Availability;
use Elementor\Modules\Agents\Classes\Seo_Llms_Txt_Detector;
use Elementor\Modules\Agents\Classes\Markdown_Content_Catalog;
use Elementor\Modules\Agents\Classes\Markdown_Preview_Ajax;
use Elementor\Modules\Agents\Classes\Markdown_Search_Ajax;
use Elementor\Modules\Agents\Classes\Request_Path;
use Elementor\Modules\Agents\Classes\Scanner_Client;
use Elementor\Modules\Agents\Classes\Scanner_Report_Store;
use Elementor\Modules\Agents\Classes\Scanner_Rest_Api;
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
use Elementor\Modules\Agents\Components\Webmcp\Business_Info_Extractor;
use Elementor\Modules\Agents\Components\Webmcp\Business_Schema_Parser;
use Elementor\Modules\Agents\Components\Webmcp\Tools\Get_Site_Structure;
use Elementor\Modules\Agents\Components\Webmcp\Tools\Query_Business_Info;
use Elementor\Modules\Agents\Components\Webmcp\Tools\Read_Page_Content;
use Elementor\Modules\Agents\Components\Webmcp\Tools\Search_Site_Content;
use Elementor\Modules\Agents\Components\Webmcp\Webmcp_Browser_Tools;
use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	/** Default HTTP max-age for the served response (5 minutes). */
	const DEFAULT_CACHE_MAX_AGE = 300;

	const PAGE_ID = 'elementor-agents-ready';

	const AGENT_ACCESS_PAGE_ID = 'elementor-agent-access';

	const MOUNT_ID = 'e-agents-ready';

	const SCANNER_MOUNT_ID = 'e-agents-ready-scanner';

	const SCRIPT_HANDLE = 'e-agents-ready-app';

	const CONFIG_OBJECT_NAME = 'elementorAgentsReadyConfig';

	const AJAX_ACTIVATE_ACTION = 'agents_ready_activate';

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
	private Scanner_Report_Store $scanner_store;
	private Webmcp_Browser_Tools $webmcp_browser_tools;
	private Seo_Llms_Txt_Detector $seo_detector;
	private Module_Availability $module_availability;

	public function get_name() {
		return 'agents';
	}

	public function __construct() {
		parent::__construct();

		$sanitizer              = new Prompt_Injection_Sanitizer();
		$this->generator        = new Content_Generator( $sanitizer );
		$this->cache            = new Llms_Cache();
		$this->bot_catalog      = new Bot_Catalog();
		$this->feature_registry = new Feature_Registry();
		$this->settings         = new Agent_Ready_Settings( $this->generator, $this->bot_catalog );
		$this->robots_handler   = new Robots_Txt_Handler( $this->settings );
		$this->manual_content   = new Llms_Manual_Content( $this->generator );
		$this->scanner_store    = new Scanner_Report_Store();
		$this->seo_detector     = new Seo_Llms_Txt_Detector();
		$this->module_availability = new Module_Availability( $this->seo_detector, $this->robots_handler );

		$this->settings->register();

		( new Scanner_Rest_Api( new Scanner_Client(), $this->scanner_store ) )->register_hooks();

		foreach ( [ Agent_Ready_Settings::OPTION, Llms_Manual_Content::OPTION, self::OPTION_EXISTING_FILE_DECISION ] as $option ) {
			add_action( "add_option_{$option}", [ $this, 'on_settings_add' ], 10, 2 );
			add_action( "update_option_{$option}", [ $this, 'on_settings_update' ], 10, 3 );
		}

		add_action( 'add_option_wpseo', [ $this, 'on_seo_plugin_option_change' ] );
		add_action( 'update_option_wpseo', [ $this, 'on_seo_plugin_option_change' ] );
		add_action( 'add_option_rank_math_modules', [ $this, 'on_seo_plugin_option_change' ] );
		add_action( 'update_option_rank_math_modules', [ $this, 'on_seo_plugin_option_change' ] );
		add_action( 'add_option_aioseo_options', [ $this, 'on_seo_plugin_option_change' ] );
		add_action( 'update_option_aioseo_options', [ $this, 'on_seo_plugin_option_change' ] );

		if ( $this->settings->is_module_active( Agent_Ready_Settings::MODULE_LLMS_TXT ) ) {
			add_action( 'template_redirect', [ $this, 'maybe_serve_llms_txt' ], 1 );
			add_action( 'template_redirect', [ $this, 'maybe_serve_llms_full_txt' ], 1 );
		}

		if ( $this->settings->has_any_active( [
			Agent_Ready_Settings::MODULE_LLMS_TXT,
			Agent_Ready_Settings::MODULE_AGENT_DISCOVERY,
			Agent_Ready_Settings::MODULE_BROWSER_TOOLS,
		] ) ) {
			add_action( 'save_post', [ $this, 'on_post_change' ], 10, 2 );
			add_action( 'trashed_post', [ $this, 'on_post_state_change' ] );
			add_action( 'untrashed_post', [ $this, 'on_post_state_change' ] );
			add_action( 'before_delete_post', [ $this, 'on_post_state_change' ] );
			add_action( 'elementor/document/after_save', [ $this, 'on_elementor_document_save' ] );

			add_action( 'switch_theme', [ $this, 'on_global_change' ] );
			add_action( 'activated_plugin', [ $this, 'on_global_change' ] );
			add_action( 'deactivated_plugin', [ $this, 'on_global_change' ] );
			add_action( 'elementor/core/files/clear_cache', [ $this, 'on_global_change' ] );
		}

		add_action( 'elementor/ajax/register_actions', [ $this, 'register_ajax_actions' ] );

		add_action( 'switch_blog', [ __CLASS__, 'reset_physical_file_cache' ] );
		add_action( 'switch_blog', [ __CLASS__, 'reset_seo_detector_cache' ] );

		if ( $this->settings->is_module_active( Agent_Ready_Settings::MODULE_BOT_ACCESS_CONTROL ) ) {
			$this->robots_handler->register();
		}

		$this->well_known_router = new Well_Known_Router( $this->settings );
		$this->add_component( 'well_known_router', $this->well_known_router );

		if ( $this->settings->is_module_active( Agent_Ready_Settings::MODULE_AGENT_DISCOVERY ) ) {
			$this->well_known_router->init();
		}

		$this->register_well_known_endpoint( new Oauth_Authorization_Server() );
		$this->register_well_known_endpoint( new Webmcp_Manifest() );
		$this->register_well_known_endpoint( new Oauth_Protected_Resource() );
		$this->register_well_known_endpoint( new Auth_Md() );
		$this->register_well_known_endpoint( new Api_Catalog() );
		$this->register_well_known_endpoint( new Agent_Skills() );
		$this->register_well_known_endpoint( new Ard_Manifest( $this ) );

		$this->markdown_endpoint = new Markdown_Endpoint( $this->settings );

		$this->register_component( new Link_Headers( $this->markdown_endpoint, $this->settings, $this ) );
		$this->register_component( $this->markdown_endpoint );

		$this->webmcp_browser_tools = $this->create_webmcp_browser_tools( $sanitizer );
		$this->register_component( $this->webmcp_browser_tools );

		add_action( 'admin_init', [ $this, 'maybe_detect_existing_file' ] );

		add_action( 'elementor/editor-one/menu/register', [ $this, 'register_editor_one_menu' ], self::EDITOR_ONE_MENU_REGISTER_PRIORITY );
		add_action( 'elementor/editor-one/menu/after_register_hidden_submenus', [ $this, 'enqueue_assets_for_editor_one_menu' ] );
	}

	// -------------------------------------------------------------------------
	// Editor One menu
	// -------------------------------------------------------------------------

	/**
	 * Register the Readiness Score and Agent Access items in Editor One.
	 *
	 * @param Menu_Data_Provider $menu_data_provider Editor One menu registry.
	 */
	public function register_editor_one_menu( Menu_Data_Provider $menu_data_provider ): void {
		$menu_data_provider->register_menu( new Editor_One_Agents_Ready_Menu() );
		$menu_data_provider->register_menu( new Editor_One_Agent_Access_Menu() );
	}

	public function enqueue_assets_for_editor_one_menu( array $hooks ): void {
		foreach ( [ self::PAGE_ID, self::AGENT_ACCESS_PAGE_ID ] as $page_id ) {
			if ( ! empty( $hooks[ $page_id ] ) ) {
				add_action( "admin_print_scripts-{$hooks[ $page_id ]}", [ $this, 'enqueue_assets' ] );
			}
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
		$ajax->register_ajax_action( self::AJAX_ACTIVATE_ACTION, [ $this, 'ajax_activate' ] );

		$llms_content_ajax = new Llms_Content_Ajax( $this->settings, $this->manual_content );
		$ajax->register_ajax_action( Llms_Content_Ajax::ACTION, [ $llms_content_ajax, 'handle' ] );

		$llms_revert_ajax = new Llms_Revert_Ajax( $this->settings, $this->manual_content );
		$ajax->register_ajax_action( Llms_Revert_Ajax::ACTION, [ $llms_revert_ajax, 'handle' ] );

		$llms_takeover_ajax = new Llms_Takeover_Ajax( $this->settings, $this->manual_content );
		$ajax->register_ajax_action( Llms_Takeover_Ajax::ACTION, [ $llms_takeover_ajax, 'handle' ] );

		$markdown_preview_ajax = new Markdown_Preview_Ajax( $this->markdown_endpoint );
		$ajax->register_ajax_action( Markdown_Preview_Ajax::ACTION, [ $markdown_preview_ajax, 'handle' ] );

		$markdown_search_ajax = new Markdown_Search_Ajax( $this->settings, new Markdown_Content_Catalog() );
		$ajax->register_ajax_action( Markdown_Search_Ajax::ACTION, [ $markdown_search_ajax, 'handle' ] );
	}

	public function ajax_activate(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( esc_html__( 'Permission denied.', 'elementor' ), Exceptions::FORBIDDEN ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
		}

		$unavailable_reasons = $this->module_availability->get_unavailable_reasons();
		$skip_modules        = array_keys( $unavailable_reasons );

		$this->settings->activate( $skip_modules );
	}

	// -------------------------------------------------------------------------
	// HTTP request handling
	// -------------------------------------------------------------------------

	/**
	 * Per-blog cache for physical file existence checks.
	 * Keyed by blog ID to support multisite.
	 *
	 * @var array<int, bool>
	 */
	private static array $physical_file_cache = [];

	/**
	 * Reset the physical file cache. Used by tests and on blog switch.
	 */
	public static function reset_physical_file_cache(): void {
		self::$physical_file_cache = [];
	}

	/**
	 * Reset the SEO detector cache. Used by tests and on blog switch.
	 */
	public static function reset_seo_detector_cache(): void {
		Seo_Llms_Txt_Detector::reset_cache();
	}

	/**
	 * Check whether llms.txt should be advertised in discovery mechanisms.
	 *
	 * Returns true only when Elementor's llms.txt is actually served.
	 * Returns false when:
	 *  - The feature is not activated
	 *  - The feature is disabled
	 *  - A physical file exists (even if admin chose 'replace', the web server
	 *    serves the static file before WordPress runs)
	 *  - An SEO plugin owns llms.txt
	 *
	 * This is the single source of truth for both serving and advertising.
	 * Not memoized to avoid leaking state between tests and across settings changes.
	 */
	public function should_advertise_llms_txt(): bool {
		if ( ! $this->settings->is_activated() ) {
			return false;
		}

		if ( ! $this->settings->is_llms_enabled() ) {
			return false;
		}

		$decision = get_option( self::OPTION_EXISTING_FILE_DECISION, '' );

		if ( 'keep' === $decision ) {
			return false;
		}

		if ( self::has_physical_llms_file() ) {
			return false;
		}

		if ( $this->seo_plugin_generates_llms_txt() ) {
			return false;
		}

		return true;
	}

	/**
	 * Check whether llms-full.txt should be advertised in discovery mechanisms.
	 *
	 * Llms-full.txt is always served by WordPress (no web server file concern),
	 * but we check if a physical file exists to avoid conflicts.
	 *
	 * @return bool
	 */
	public function should_advertise_llms_full_txt(): bool {
		if ( ! $this->settings->is_activated() ) {
			return false;
		}

		if ( ! $this->settings->is_llms_enabled() ) {
			return false;
		}

		if ( self::has_physical_llms_full_file() ) {
			return false;
		}

		return true;
	}

	/**
	 * Check whether a physical llms-full.txt file exists.
	 *
	 * Uses the same per-blog cache as has_physical_llms_file.
	 *
	 * @return bool
	 */
	public static function has_physical_llms_full_file(): bool {
		$blog_id = get_current_blog_id();
		$cache_key = 'full_' . $blog_id;

		if ( isset( self::$physical_file_cache[ $cache_key ] ) ) {
			return self::$physical_file_cache[ $cache_key ];
		}

		$root_path = self::get_llms_file_root_path();
		self::$physical_file_cache[ $cache_key ] = file_exists( $root_path . 'llms-full.txt' );

		return self::$physical_file_cache[ $cache_key ];
	}

	/**
	 * Check whether an SEO plugin is generating llms.txt.
	 *
	 * @return bool
	 */
	public function seo_plugin_generates_llms_txt(): bool {
		return null !== $this->seo_detector->get_owner();
	}

	/**
	 * Serve llms.txt when the request path matches.
	 */
	public function maybe_serve_llms_txt() {
		if ( ! $this->settings->is_module_active( Agent_Ready_Settings::MODULE_LLMS_TXT ) ) {
			return;
		}

		if ( ! $this->is_request_for( 'llms.txt' ) ) {
			return;
		}

		if ( ! $this->should_advertise_llms_txt() ) {
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
		if ( ! $this->settings->is_module_active( Agent_Ready_Settings::MODULE_LLMS_TXT ) ) {
			return;
		}

		if ( ! $this->is_request_for( 'llms-full.txt' ) ) {
			return;
		}

		if ( ! $this->should_advertise_llms_full_txt() ) {
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

	/**
	 * Stub for backward compatibility.
	 *
	 * @deprecated 4.4.0 Use get_generated_llms_txt() instead.
	 * @return string Always returns an empty string.
	 */
	public function get_llms_txt_content(): string {
		Plugin::$instance->modules_manager->get_modules( 'dev-tools' )->deprecation->deprecated_function(
			__METHOD__,
			'4.4.0',
			__CLASS__ . '::get_generated_llms_txt()'
		);

		return '';
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
		if ( ! $this->settings->has_any_active( [
			Agent_Ready_Settings::MODULE_LLMS_TXT,
			Agent_Ready_Settings::MODULE_AGENT_DISCOVERY,
			Agent_Ready_Settings::MODULE_BROWSER_TOOLS,
		] ) ) {
			return;
		}

		if ( wp_is_post_revision( $post_id ) ) {
			return;
		}

		if ( in_array( $post->post_type, Content_Generator::EXCLUDED_POST_TYPES, true ) ) {
			return;
		}

		if ( $this->settings->is_module_active( Agent_Ready_Settings::MODULE_LLMS_TXT ) ) {
			$this->generator->clear_post_cache( $post_id );
		}

		$this->invalidate_cache( $post_id );
	}

	/**
	 * Invalidate cache when a post is trashed, untrashed, or permanently deleted.
	 *
	 * @param int $post_id
	 */
	public function on_post_state_change( int $post_id ) {
		if ( ! $this->settings->has_any_active( [
			Agent_Ready_Settings::MODULE_LLMS_TXT,
			Agent_Ready_Settings::MODULE_AGENT_DISCOVERY,
			Agent_Ready_Settings::MODULE_BROWSER_TOOLS,
		] ) ) {
			return;
		}

		if ( $this->settings->is_module_active( Agent_Ready_Settings::MODULE_LLMS_TXT ) ) {
			$this->generator->clear_post_cache( $post_id );
		}

		$this->invalidate_cache( $post_id );
	}

	/**
	 * Invalidate cache on Elementor document saves (handles kit saves too).
	 *
	 * @param mixed $document
	 */
	public function on_elementor_document_save( $document ) {
		if ( ! $this->settings->has_any_active( [
			Agent_Ready_Settings::MODULE_LLMS_TXT,
			Agent_Ready_Settings::MODULE_AGENT_DISCOVERY,
			Agent_Ready_Settings::MODULE_BROWSER_TOOLS,
		] ) ) {
			return;
		}

		if ( ! ( $document instanceof Kit ) ) {
			return;
		}

		$kit_id = $document->get_main_id();

		if ( $kit_id && $this->settings->is_module_active( Agent_Ready_Settings::MODULE_LLMS_TXT ) ) {
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
		if ( ! $this->settings->has_any_active( [
			Agent_Ready_Settings::MODULE_LLMS_TXT,
			Agent_Ready_Settings::MODULE_AGENT_DISCOVERY,
			Agent_Ready_Settings::MODULE_BROWSER_TOOLS,
		] ) ) {
			return;
		}

		if ( $this->settings->is_module_active( Agent_Ready_Settings::MODULE_LLMS_TXT ) ) {
			$this->generator->clear_all_post_caches();
		}

		$this->cache->invalidate();
		do_action( 'elementor/agents/llms_txt/cache_invalidated', 0 );
	}

	/**
	 * Invalidate cache when Agent Ready settings are added via add_option.
	 * Handles add_option_{$option} hook (2 args: $option, $value).
	 */
	public function on_settings_add( string $option, $value ): void {
		$this->invalidate_cache( 0 );

		if ( isset( $this->well_known_router ) ) {
			$this->well_known_router->flush_all_caches();
		}

		self::reset_physical_file_cache();
		self::reset_seo_detector_cache();

		if ( Agent_Ready_Settings::OPTION === $option ) {
			$this->clear_caches_for_newly_active_modules( null, $value );
		}
	}

	/**
	 * Invalidate cache when Agent Ready settings are updated via update_option.
	 * Handles update_option_{$option} hook (3 args: $old_value, $value, $option).
	 */
	public function on_settings_update( $old_value, $new_value, string $option ): void {
		$this->invalidate_cache( 0 );

		if ( isset( $this->well_known_router ) ) {
			$this->well_known_router->flush_all_caches();
		}

		self::reset_physical_file_cache();
		self::reset_seo_detector_cache();

		if ( Agent_Ready_Settings::OPTION === $option ) {
			$this->clear_caches_for_newly_active_modules( $old_value, $new_value );
		}
	}

	/**
	 * Flush well-known endpoint caches when SEO plugin options change.
	 */
	public function on_seo_plugin_option_change(): void {
		if ( ! $this->settings->is_module_active( Agent_Ready_Settings::MODULE_AGENT_DISCOVERY ) ) {
			return;
		}

		self::reset_seo_detector_cache();

		if ( isset( $this->well_known_router ) ) {
			$this->well_known_router->flush_all_caches();
		}
	}

	/**
	 * Clear caches for modules that were just activated or had 'activated' toggled true.
	 */
	private function clear_caches_for_newly_active_modules( $old_value, $new_value ): void {
		$old_settings = is_array( $old_value ) ? $old_value : [];
		$new_settings = is_array( $new_value ) ? $new_value : [];

		$old_activated = ! empty( $old_settings[ Agent_Ready_Settings::ACTIVATED_KEY ] );
		$new_activated = ! empty( $new_settings[ Agent_Ready_Settings::ACTIVATED_KEY ] );

		$modules_to_clear = [];

		if ( ! $old_activated && $new_activated ) {
			$modules_to_clear = [
				Agent_Ready_Settings::MODULE_LLMS_TXT,
				Agent_Ready_Settings::MODULE_AGENT_DISCOVERY,
				Agent_Ready_Settings::MODULE_BROWSER_TOOLS,
			];
		} else {
			foreach ( [
				Agent_Ready_Settings::MODULE_LLMS_TXT,
				Agent_Ready_Settings::MODULE_AGENT_DISCOVERY,
				Agent_Ready_Settings::MODULE_BROWSER_TOOLS,
			] as $module ) {
				$old_enabled = ! empty( $old_settings[ $module ]['enabled'] );
				$new_enabled = ! empty( $new_settings[ $module ]['enabled'] );

				if ( ! $old_enabled && $new_enabled ) {
					$modules_to_clear[] = $module;
				}
			}
		}

		foreach ( $modules_to_clear as $module ) {
			if ( Agent_Ready_Settings::MODULE_LLMS_TXT === $module ) {
				$this->generator->clear_all_post_caches();
				$this->cache->invalidate();
			} elseif ( Agent_Ready_Settings::MODULE_AGENT_DISCOVERY === $module ) {
				if ( isset( $this->well_known_router ) ) {
					$this->well_known_router->flush_all_caches();
				}
			} elseif ( Agent_Ready_Settings::MODULE_BROWSER_TOOLS === $module && isset( $this->webmcp_browser_tools ) ) {
				$this->webmcp_browser_tools->flush_relevant_tools_cache();
				$this->webmcp_browser_tools->sync_business_info_with_settings();
			}
		}
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
	 * Uses a derived home path that works on subdirectory installs, since
	 * get_home_path() can fall back to ABSPATH incorrectly on the front end
	 * when WP is in its own directory.
	 *
	 * Result is memoized per-blog to avoid repeated file_exists() calls.
	 */
	public static function has_physical_llms_file(): bool {
		$blog_id = get_current_blog_id();

		if ( isset( self::$physical_file_cache[ $blog_id ] ) ) {
			return self::$physical_file_cache[ $blog_id ];
		}

		$root_path = self::get_llms_file_root_path();
		self::$physical_file_cache[ $blog_id ] = file_exists( $root_path . self::LLMS_FILENAME );

		return self::$physical_file_cache[ $blog_id ];
	}

	public static function delete_physical_llms_file(): bool {
		$file_path = self::get_llms_file_root_path() . self::LLMS_FILENAME;

		wp_delete_file( $file_path );
		clearstatcache( true, $file_path );
		self::reset_physical_file_cache();

		return ! file_exists( $file_path );
	}

	/**
	 * Get the root directory where llms.txt would be served from.
	 *
	 * Derives the path by subtracting the site path from ABSPATH, since
	 * get_home_path() can return ABSPATH on the front end for subdirectory
	 * installs, which is incorrect when WP is in its own directory.
	 *
	 * @return string Path with trailing slash.
	 */
	private static function get_llms_file_root_path(): string {
		$home_url = trailingslashit( home_url() );
		$site_url = trailingslashit( site_url() );

		// When home and site URLs are the same, WP root = site root.
		if ( $home_url === $site_url ) {
			return ABSPATH;
		}

		// Calculate the relative path from home to site.
		$home_path = wp_parse_url( $home_url, PHP_URL_PATH );
		$site_path = wp_parse_url( $site_url, PHP_URL_PATH );

		if ( ! $home_path || ! $site_path ) {
			return ABSPATH;
		}

		$home_path = trailingslashit( $home_path );
		$site_path = trailingslashit( $site_path );

		// If site is deeper than home, subtract the difference from ABSPATH.
		if ( 0 === strpos( $site_path, $home_path ) ) {
			$relative = substr( $site_path, strlen( $home_path ) );
			if ( $relative ) {
				return substr( ABSPATH, 0, - strlen( $relative ) );
			}
		}

		return ABSPATH;
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

	private function invalidate_cache( int $post_id = 0 ): void {
		$this->cache->invalidate();

		if ( ! $this->settings->has_any_active( [
			Agent_Ready_Settings::MODULE_LLMS_TXT,
			Agent_Ready_Settings::MODULE_AGENT_DISCOVERY,
		] ) ) {
			return;
		}

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

		$unavailable_reasons = $this->module_availability->get_unavailable_reasons();

		return [
			'isActivated'        => $this->settings->is_activated(),
			'llms'               => $this->get_llms_state( $unavailable_reasons ),
			'markdown'           => $this->get_markdown_state(),
			'botAccess'          => $this->get_bot_access_state( $unavailable_reasons ),
			'agentDiscovery'     => $this->get_agent_discovery_state(),
			'scanner'            => $this->get_scanner_state(),
			'browserTools'       => $this->get_browser_tools_state( $unavailable_reasons ),
		];
	}

	private function get_scanner_state(): array {
		$retry_at = $this->scanner_store->get_retry_at();

		return [
			'siteDomain'           => wp_parse_url( home_url(), PHP_URL_HOST ),
			'agentAccessUrl'         => admin_url( 'admin.php?page=' . self::AGENT_ACCESS_PAGE_ID ),
			'seoPluginSearchUrl'     => admin_url( 'plugin-install.php?s=SEO&tab=search&type=term' ),
			'angiePluginSearchUrl'   => admin_url( 'plugin-install.php?s=angie&tab=search&type=term' ),
			'angieAppUrl'            => admin_url( 'admin.php?page=angie-app' ),
			'angieInstallHeroUrl'    => plugins_url( 'assets/images/angie-install-hero.png', __FILE__ ),
			'isAngieActive'          => Hints::is_plugin_active( 'angie' ),
			'lastReport'             => $this->scanner_store->get_last_report(),
			'retryAt'                => null === $retry_at ? null : gmdate( 'c', $retry_at ),
		];
	}

	private function get_browser_tools_state( array $unavailable_reasons ): array {
		return [
			'enabled'                  => $this->settings->is_browser_tools_enabled(),
			'isAvailable'              => Webmcp_Browser_Tools::is_available(),
			'unavailableReason'        => $unavailable_reasons[ Agent_Ready_Settings::MODULE_BROWSER_TOOLS ] ?? null,
			'tools'                    => $this->webmcp_browser_tools->get_admin_tools(),
			'businessDetails'          => $this->settings->get_business_details(),
			'maxBusinessDetailsLength' => Agent_Ready_Settings::MAX_BUSINESS_DETAILS_LENGTH,
		];
	}

	private function create_webmcp_browser_tools( Prompt_Injection_Sanitizer $sanitizer ): Webmcp_Browser_Tools {
		$extractor = new Business_Info_Extractor( new Business_Schema_Parser( $sanitizer ) );

		return new Webmcp_Browser_Tools(
			$this->settings,
			$extractor,
			[
				new Search_Site_Content( $this->settings, new Markdown_Content_Catalog(), $this->generator, $sanitizer ),
				new Get_Site_Structure( $this->generator, $sanitizer ),
				new Read_Page_Content( $this->settings, $this->markdown_endpoint, $sanitizer ),
				new Query_Business_Info( $this->settings, $extractor, $sanitizer ),
			]
		);
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

	private function get_bot_access_state( array $unavailable_reasons ): array {
		return [
			'enabled'            => $this->settings->is_bot_access_enabled(),
			'hasPhysicalFile'    => $this->robots_handler->has_physical_robots_txt(),
			'unavailableReason'  => $unavailable_reasons[ Agent_Ready_Settings::MODULE_BOT_ACCESS_CONTROL ] ?? null,
			'bots'               => $this->get_managed_bot_rows(),
			'catalog'            => $this->get_bot_catalog_rows(),
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

	private function get_llms_state( array $unavailable_reasons ): array {
		return [
			'enabled'            => $this->settings->is_llms_enabled(),
			'isManuallyEdited'   => $this->settings->is_llms_manually_edited(),
			'hasPhysicalFile'    => self::has_physical_llms_file(),
			'unavailableReason'  => $unavailable_reasons[ Agent_Ready_Settings::MODULE_LLMS_TXT ] ?? null,
			'fileUrl'            => home_url( '/' . self::LLMS_FILENAME ),
			'postTypes'          => $this->get_post_type_rows( $this->settings->get_llms_post_types() ),
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
			$count = (int) ( wp_count_posts( $name )->publish ?? 0 );

			if ( $count <= 0 ) {
				continue;
			}

			$post_types[] = [
				'name'     => $name,
				'label'    => $label,
				'count'    => $count,
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

	public function is_browser_tools_module_active(): bool {
		return $this->settings->is_module_active( Agent_Ready_Settings::MODULE_BROWSER_TOOLS );
	}

	/**
	 * Add a feature component to the registry and to the base module's
	 * component store, then call register() if the component is enabled.
	 */
	private function register_component( Feature_Component $component ): void {
		$this->feature_registry->register( $component );
		$this->add_component( $component->get_id(), $component );

		$required_modules = $component->get_required_modules();

		$should_register = $component->is_enabled();

		if ( $should_register && ! empty( $required_modules ) ) {
			$should_register = $this->settings->has_any_active( $required_modules );
		}

		if ( $should_register ) {
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
