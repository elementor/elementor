<?php
namespace Elementor\Modules\MarkdownRender;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Frontend\Widget_Content_Render_Mode;
use Elementor\Plugin;
use Elementor\Settings;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'markdown_rendering';
	const CACHE_META_KEY = '_elementor_markdown_cache';

	public static function is_rendering_markdown(): bool {
		return Widget_Content_Render_Mode::is( Widget_Content_Render_Mode::MARKDOWN );
	}

	public static function set_rendering_markdown( bool $is_rendering ): void {
		Widget_Content_Render_Mode::set_current(
			$is_rendering ? Widget_Content_Render_Mode::MARKDOWN : Widget_Content_Render_Mode::NORMAL
		);
	}

	public static function execute_while_rendering_markdown( callable $callback ) {
		return Widget_Content_Render_Mode::execute_as( Widget_Content_Render_Mode::MARKDOWN, $callback );
	}

	public function get_name() {
		return 'markdown-render';
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Generate website markdown', 'elementor' ),
			'description' => sprintf(
				'%1$s <a href="https://go.elementor.com/wp-dash-generate-website-markdown-article/" target="_blank">%2$s</a>',
				esc_html__( 'Serve your pages as Markdown files so AI agents can ingest and understand your content more efficiently.', 'elementor' ),
				esc_html__( 'Learn more', 'elementor' )
			),
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
		];
	}

	public function __construct() {
		parent::__construct();

		add_action( 'template_redirect', [ $this, 'maybe_serve_markdown' ], 1 );
		add_action( 'wp_head', [ $this, 'print_agent_link_relations' ], 2 );

		add_action( 'elementor/core/files/clear_cache', [ $this, 'clear_all_markdown_cache' ] );
		add_action( 'save_post', [ $this, 'clear_post_markdown_cache' ] );
		add_action( 'activated_plugin', [ $this, 'clear_all_markdown_cache' ] );
		add_action( 'deactivated_plugin', [ $this, 'clear_all_markdown_cache' ] );
		add_action( 'switch_theme', [ $this, 'clear_all_markdown_cache' ] );

		if ( is_admin() ) {
			add_action(
				'elementor/admin/after_create_settings/' . Settings::PAGE_ID,
				[ $this, 'register_admin_fields' ],
				100
			);
		}
	}

	public function maybe_serve_markdown() {
		$post_id = $this->resolve_requested_post_id();

		if ( ! $post_id ) {
			return;
		}

		$this->serve_markdown_for_post( $post_id );
	}

	public function print_agent_link_relations() {
		if ( is_admin() || ! is_singular() ) {
			return;
		}

		$post_id = get_the_ID();

		if ( ! $this->can_serve_markdown_for_post( $post_id ) ) {
			return;
		}

		$relations = Agent_Link_Relations::for_post( $post_id );

		if ( ! $relations || $relations->is_empty() ) {
			return;
		}

		$relations->print_html_link_tags();
	}

	private function resolve_requested_post_id(): int {
		if ( $this->is_markdown_path_request() ) {
			return Markdown_Url::resolve_post_id_from_request_path( Markdown_Url::get_request_path() );
		}

		if ( ! $this->is_content_negotiation_markdown_request() ) {
			return 0;
		}

		if ( ! is_singular() ) {
			return 0;
		}

		return (int) get_the_ID();
	}

	private function serve_markdown_for_post( int $post_id ): void {
		$post = get_post( $post_id );

		if ( ! $post ) {
			return;
		}

		$is_preview = $this->is_valid_preview_request( $post_id );

		if ( ! $is_preview && 'publish' !== $post->post_status ) {
			return;
		}

		if ( post_password_required( $post ) ) {
			return;
		}

		$document = $is_preview
			? Plugin::$instance->documents->get_doc_for_frontend( $post_id )
			: Plugin::$instance->documents->get( $post_id );

		if ( ! $document || ! $document->is_built_with_elementor() ) {
			return;
		}

		self::execute_while_rendering_markdown( function () use ( $is_preview, $document, $post_id ) {
			if ( $is_preview ) {
				$markdown = ( new Markdown_Renderer() )->render( $document );
			} else {
				$markdown = $this->get_cached_markdown( $post_id );

				if ( false === $markdown ) {
					$markdown = ( new Markdown_Renderer() )->render( $document );
					$this->set_cached_markdown( $post_id, $markdown );
				}
			}

			$this->send_markdown_response( $post_id, $markdown );
		} );
	}

	private function send_markdown_response( int $post_id, string $markdown ): void {
		$relations = Agent_Link_Relations::for_post( $post_id );
		$link_header = $relations ? $relations->get_markdown_response_link_header_value() : '';

		Utils::do_not_cache();
		status_header( 200 );
		header( 'Content-Type: text/markdown; charset=utf-8' );
		header( 'X-Content-Type-Options: nosniff' );

		if ( '' !== $link_header ) {
			header( 'Link: ' . $link_header );
		}

		Utils::print_unescaped_internal_string( $markdown );
		exit;
	}

	private function can_serve_markdown_for_post( int $post_id ): bool {
		if ( 'publish' !== get_post_status( $post_id ) ) {
			return false;
		}

		if ( post_password_required( $post_id ) ) {
			return false;
		}

		$document = Plugin::$instance->documents->get( $post_id );

		return $document && $document->is_built_with_elementor();
	}

	private function is_valid_preview_request( int $post_id ): bool {
		if ( ! is_preview() ) {
			return false;
		}

		$preview_id = isset( $_GET['preview_id'] ) ? absint( wp_unslash( $_GET['preview_id'] ) ) : 0; // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$preview_nonce = sanitize_text_field( wp_unslash( $_GET['preview_nonce'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		if ( ! $preview_id || ! wp_verify_nonce( $preview_nonce, 'post_preview_' . $preview_id ) ) {
			return false;
		}

		return current_user_can( 'edit_post', $post_id );
	}

	private function is_markdown_path_request(): bool {
		return Markdown_Url::is_markdown_request_path( Markdown_Url::get_request_path() );
	}

	private function is_content_negotiation_markdown_request(): bool {
		if ( isset( $_GET['format'] ) && 'markdown' === $_GET['format'] ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return true;
		}

		$accept = isset( $_SERVER['HTTP_ACCEPT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_ACCEPT'] ) ) : '';

		return false !== strpos( $accept, 'text/markdown' );
	}

	private function get_cached_markdown( int $post_id ) {
		$cache = get_post_meta( $post_id, self::CACHE_META_KEY, true );

		if ( empty( $cache ) || ! is_array( $cache ) ) {
			return false;
		}

		if ( empty( $cache['timeout'] ) || time() > $cache['timeout'] ) {
			return false;
		}

		return $cache['content'] ?? false;
	}

	private function set_cached_markdown( int $post_id, string $markdown ): void {
		$ttl_hours = (int) get_option( 'elementor_markdown_cache_ttl', 24 );

		if ( $ttl_hours <= 0 ) {
			return;
		}

		$cache = [
			'timeout' => time() + ( $ttl_hours * HOUR_IN_SECONDS ),
			'content' => $markdown,
		];

		update_post_meta( $post_id, self::CACHE_META_KEY, $cache );
	}

	public function clear_post_markdown_cache( int $post_id ): void {
		delete_post_meta( $post_id, self::CACHE_META_KEY );
	}

	public function clear_all_markdown_cache(): void {
		global $wpdb;
		$wpdb->delete( $wpdb->postmeta, [ 'meta_key' => self::CACHE_META_KEY ] ); // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
	}

	public function register_admin_fields( Settings $settings ) {
		$settings->add_field(
			Settings::TAB_PERFORMANCE,
			Settings::TAB_PERFORMANCE,
			'markdown_cache_ttl',
			[
				'label' => esc_html__( 'Markdown Cache', 'elementor' ),
				'field_args' => [
					'class' => 'elementor-markdown-cache-ttl',
					'type' => 'select',
					'std' => '24',
					'options' => [
						'0' => esc_html__( 'Disable', 'elementor' ),
						'1' => esc_html__( '1 Hour', 'elementor' ),
						'6' => esc_html__( '6 Hours', 'elementor' ),
						'12' => esc_html__( '12 Hours', 'elementor' ),
						'24' => esc_html__( '1 Day', 'elementor' ),
						'72' => esc_html__( '3 Days', 'elementor' ),
						'168' => esc_html__( '1 Week', 'elementor' ),
						'720' => esc_html__( '1 Month', 'elementor' ),
					],
					'desc' => esc_html__( 'Specify the duration for which Markdown output is cached. This cache is served to AI crawlers requesting text/markdown content.', 'elementor' ),
				],
			]
		);
	}
}
