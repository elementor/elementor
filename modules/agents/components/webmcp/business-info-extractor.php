<?php

namespace Elementor\Modules\Agents\Components\Webmcp;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Reads business details from the Schema.org JSON-LD of the real home page.
 *
 * The page is only fetched from cron, so a public agent call never waits on a
 * loopback request. Stale data keeps being served while cron refreshes it; only
 * a cache that was never filled returns null, meaning "unknown yet", never an
 * empty result. Failures are cached as an empty result for a shorter time.
 */
class Business_Info_Extractor {

	const TRANSIENT = 'elementor_agents_webmcp_business_info';

	const FRESH_TRANSIENT = 'elementor_agents_webmcp_business_info_fresh';

	const CRON_HOOK = 'elementor/agents/webmcp/refresh_business_info';

	const DATA_TTL = WEEK_IN_SECONDS;

	const POSITIVE_TTL = DAY_IN_SECONDS;

	const NEGATIVE_TTL = HOUR_IN_SECONDS;

	const REFRESH_DELAY = 30;

	const REQUEST_TIMEOUT = 5;

	const MAX_REDIRECTS = 3;

	const MAX_RESPONSE_BYTES = 1048576;

	const HTTP_OK = 200;

	private Business_Schema_Parser $parser;

	public function __construct( Business_Schema_Parser $parser ) {
		$this->parser = $parser;
	}

	public function register(): void {
		add_action( self::CRON_HOOK, [ $this, 'refresh' ] );
		add_action( 'elementor/agents/llms_txt/cache_invalidated', [ $this, 'schedule_refresh' ] );
	}

	public function get_or_refresh(): ?array {
		if ( ! $this->is_fresh() ) {
			$this->schedule_refresh();
		}

		$cached = get_transient( self::TRANSIENT );

		return is_array( $cached ) ? $cached : null;
	}

	public function refresh(): array {
		$info = $this->parser->parse( $this->fetch_home_page() );

		set_transient( self::TRANSIENT, $info, self::DATA_TTL );
		set_transient( self::FRESH_TRANSIENT, true, empty( $info ) ? self::NEGATIVE_TTL : self::POSITIVE_TTL );

		return $info;
	}

	public function schedule_refresh(): void {
		$this->schedule_refresh_at( time() + self::REFRESH_DELAY );
	}

	/**
	 * Runs the refresh in a separate cron request, so the current request never waits on the fetch.
	 */
	public function warm(): void {
		if ( $this->is_fresh() ) {
			return;
		}

		$this->schedule_refresh_at( time() );

		spawn_cron();
	}

	private function is_fresh(): bool {
		return (bool) get_transient( self::FRESH_TRANSIENT );
	}

	private function schedule_refresh_at( int $timestamp ): void {
		if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
			wp_schedule_single_event( $timestamp, self::CRON_HOOK );
		}
	}

	private function fetch_home_page(): string {
		$response = wp_remote_get( home_url( '/' ), [
			'timeout' => self::REQUEST_TIMEOUT,
			'redirection' => self::MAX_REDIRECTS,
			'limit_response_size' => self::MAX_RESPONSE_BYTES,
			// Same filter WordPress uses for its own loopback requests.
			'sslverify' => apply_filters( 'https_local_ssl_verify', false ),
			'headers' => [ 'Accept' => 'text/html' ],
		] );

		if ( is_wp_error( $response ) || self::HTTP_OK !== wp_remote_retrieve_response_code( $response ) ) {
			return '';
		}

		if ( ! $this->is_same_host( $this->get_final_url( $response ) ) ) {
			return '';
		}

		return wp_remote_retrieve_body( $response );
	}

	private function get_final_url( array $response ): string {
		$http_response = $response['http_response'] ?? null;

		if ( ! ( $http_response instanceof \WP_HTTP_Requests_Response ) ) {
			return home_url( '/' );
		}

		return (string) $http_response->get_response_object()->url;
	}

	private function is_same_host( string $url ): bool {
		$host = wp_parse_url( $url, PHP_URL_HOST );

		return is_string( $host ) && strtolower( $host ) === strtolower( (string) wp_parse_url( home_url(), PHP_URL_HOST ) );
	}
}
