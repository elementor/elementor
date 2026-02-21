<?php
namespace Elementor\Modules\MarkdownRender;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;
use Elementor\Settings;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Module extends BaseModule {

	const EXPERIMENT_NAME = 'markdown_rendering';
	const CACHE_META_KEY = '_elementor_markdown_cache';

	public function get_name() {
		return 'markdown-render';
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Markdown Rendering', 'elementor' ),
			'description' => esc_html__( 'Serve page content as Markdown when AI crawlers request it via Accept: text/markdown header.', 'elementor' ),
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
		];
	}

	public function __construct() {
		parent::__construct();

		add_action( 'template_redirect', [ $this, 'maybe_serve_markdown' ], 1 );

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
		if ( ! $this->is_markdown_request() ) {
			return;
		}

		if ( ! is_singular() ) {
			return;
		}

		$post_id = get_the_ID();
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

		if ( $is_preview ) {
			$markdown = ( new Markdown_Renderer() )->render( $document );
		} else {
			$markdown = $this->get_cached_markdown( $post_id );

			if ( false === $markdown ) {
				$markdown = ( new Markdown_Renderer() )->render( $document );
				$this->set_cached_markdown( $post_id, $markdown );
			}
		}

		nocache_headers();
		status_header( 200 );
		header( 'Content-Type: text/markdown; charset=utf-8' );
		header( 'X-Content-Type-Options: nosniff' );
		echo $markdown; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		exit;
	}

	private function is_valid_preview_request( int $post_id ): bool {
		if ( ! is_preview() ) {
			return false;
		}

		$preview_id = (int) ( $_GET['preview_id'] ?? 0 ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$preview_nonce = sanitize_text_field( wp_unslash( $_GET['preview_nonce'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		if ( ! $preview_id || ! wp_verify_nonce( $preview_nonce, 'post_preview_' . $preview_id ) ) {
			return false;
		}

		return current_user_can( 'edit_post', $post_id );
	}

	private function is_markdown_request(): bool {
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
