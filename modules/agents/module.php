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

	const DEFAULT_CACHE_MAX_AGE = 300;

	public function get_name() {
		return 'agents';
	}

	public static function get_experimental_data() {
		return [
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Agents llms.txt', 'elementor' ),
			'description' => esc_html__( 'Expose llms.txt from site settings at the site root for AI agents.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_DEV,
		];
	}

	public function __construct() {
		parent::__construct();

		add_action( 'template_redirect', [ $this, 'maybe_serve_llms_txt' ], 1 );
		add_action( 'elementor/kit/register_tabs', [ $this, 'register_kit_tabs' ] );
		add_action( 'elementor/document/after_save', [ $this, 'maybe_invalidate_llms_txt_cache' ] );

		if ( Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			add_filter( 'elementor/editor/v2/packages', fn ( $packages ) => $this->add_packages( $packages ) );
		}
	}

	/**
	 * @param \Elementor\Core\Kits\Documents\Kit $kit
	 */
	public function register_kit_tabs( $kit ) {
		if ( ! Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME ) ) {
			return;
		}

		$kit->register_tab( 'settings-agents', Settings_Agents::class );
	}

	public function maybe_serve_llms_txt() {
		if ( ! $this->is_llms_txt_request() ) {
			return;
		}

		$llms = $this->get_llms_txt_content();

		if ( '' === $llms ) {
			return;
		}

		$etag = $this->get_etag( $llms );
		$last_modified = $this->get_last_modified();

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
		header( 'Content-Type: text/markdown; charset=utf-8' );
		Utils::print_unescaped_internal_string( $llms );
		exit;
	}

	/**
	 * The served content is derived from kit settings, so a kit save is the only way it can change.
	 *
	 * @param mixed $document
	 */
	public function maybe_invalidate_llms_txt_cache( $document ) {
		if ( ! $document instanceof Kit ) {
			return;
		}

		/**
		 * Fires when the /llms.txt response may have changed, so external page caches and CDNs
		 * can purge their copy instead of serving it until `max-age` expires.
		 *
		 * @param int $kit_id The saved kit ID.
		 */
		do_action( 'elementor/agents/llms_txt/cache_invalidated', $document->get_main_id() );
	}

	public function get_llms_txt_content(): string {
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$agents = $kit->get_settings( 'agents' );

		if ( ! is_array( $agents ) || ! isset( $agents['llms'] ) ) {
			return '';
		}

		$llms = $agents['llms'];

		return is_string( $llms ) ? $llms : '';
	}

	private function add_packages( $packages ) {
		return array_merge( $packages, self::PACKAGES );
	}

	private function get_cache_max_age(): int {
		/**
		 * Filters how long (in seconds) clients and shared caches may reuse /llms.txt without revalidating.
		 *
		 * @param int $max_age Cache lifetime in seconds.
		 */
		$max_age = (int) apply_filters( 'elementor/agents/llms_txt/cache_max_age', self::DEFAULT_CACHE_MAX_AGE );

		return max( 0, $max_age );
	}

	private function get_etag( string $content ): string {
		return '"' . md5( $content ) . '"';
	}

	private function get_last_modified(): int {
		$modified = get_post_modified_time( 'U', true, Plugin::$instance->kits_manager->get_active_id() );

		return is_numeric( $modified ) ? (int) $modified : 0;
	}

	private function is_client_cache_fresh( string $etag, int $last_modified ): bool {
		$if_none_match = isset( $_SERVER['HTTP_IF_NONE_MATCH'] )
			? trim( sanitize_text_field( wp_unslash( $_SERVER['HTTP_IF_NONE_MATCH'] ) ) )
			: '';

		// An ETag mismatch must win over If-Modified-Since, which only has one-second resolution.
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

	private function is_llms_txt_request(): bool {
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

		return '/llms.txt' === $path || 'llms.txt' === ltrim( $path, '/' );
	}
}
