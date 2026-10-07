<?php

namespace Elementor\Modules\Agents;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Manages the Elementor Agent Ready block in WordPress's virtual robots.txt.
 *
 * Adds an Allow rule and a Content-Signal line for every bot the site owner
 * manages in the Bot access control module. Bots outside that list get no
 * stanza and fall back to the site's `User-agent: *` rules.
 *
 * The rules are wrapped in a delimited block so they can be identified and
 * replaced idempotently:
 *
 *   # BEGIN Elementor Agent Ready
 *   ...rules...
 *   # END Elementor Agent Ready
 *
 * Important: if a *physical* robots.txt exists in the web root, WordPress does
 * not invoke the `robots_txt` filter — the physical file is served directly.
 * In that case our managed block has no effect and the filter is never added.
 * The admin UI can surface this as a warning via get_status().
 */
class Robots_Txt_Handler {

	const BLOCK_BEGIN = '# BEGIN Elementor Agent Ready';
	const BLOCK_END   = '# END Elementor Agent Ready';

	const SITE_WIDE_CONTENT_SIGNAL = [
		Agent_Ready_Settings::BOT_PERMISSION_SEARCH   => true,
		Agent_Ready_Settings::BOT_PERMISSION_AI_INPUT => true,
		Agent_Ready_Settings::BOT_PERMISSION_AI_TRAIN => false,
	];

	const CONTENT_SIGNAL_KEYS = [
		Agent_Ready_Settings::BOT_PERMISSION_SEARCH   => 'search',
		Agent_Ready_Settings::BOT_PERMISSION_AI_INPUT => 'ai-input',
		Agent_Ready_Settings::BOT_PERMISSION_AI_TRAIN => 'ai-train',
	];

	private Agent_Ready_Settings $settings;

	/**
	 * Whether a physical robots.txt was detected at registration time.
	 *
	 * @var bool
	 */
	private bool $physical_file_exists = false;

	public function __construct( Agent_Ready_Settings $settings ) {
		$this->settings = $settings;
	}

	/**
	 * Register hooks.
	 *
	 * Skips adding the filter entirely when a physical robots.txt file is
	 * present, because WordPress will not invoke `robots_txt` in that case.
	 *
	 * @return void
	 */
	public function register(): void {
		$this->physical_file_exists = $this->has_physical_robots_txt();

		if ( $this->physical_file_exists ) {
			return;
		}

		add_filter( 'robots_txt', [ $this, 'add_rules' ], 20, 2 );
	}

	/**
	 * Append (or replace) the Elementor Agent Ready block in the robots.txt output.
	 *
	 * @param string $output Robots.txt content built by WordPress so far.
	 * @param bool   $public Whether the site is public (discourage search engines is off).
	 * @return string
	 */
	public function add_rules( string $output, bool $public ): string {
		if ( ! $public || ! $this->settings->is_bot_access_enabled() ) {
			return $output;
		}

		$block = $this->build_block();

		if ( false !== strpos( $output, self::BLOCK_BEGIN ) ) {
			$pattern = '/' . preg_quote( self::BLOCK_BEGIN, '/' ) . '.*?' . preg_quote( self::BLOCK_END, '/' ) . '/s';
			$output  = preg_replace( $pattern, $block, $output );

			return rtrim( $output ) . "\n";
		}

		return rtrim( $output ) . "\n\n" . $block . "\n";
	}

	/**
	 * Check whether a physical robots.txt file exists in the web root.
	 *
	 * When this returns true the WordPress `robots_txt` filter is not fired and
	 * the managed block cannot be injected via the filter.
	 *
	 * @return bool
	 */
	public function has_physical_robots_txt(): bool {
		return file_exists( ABSPATH . 'robots.txt' );
	}

	/**
	 * Return handler status flags for use by the admin UI.
	 *
	 * @return array{ physical_file_exists: bool }
	 */
	public function get_status(): array {
		return [
			'physical_file_exists' => $this->physical_file_exists,
		];
	}

	private function build_block(): string {
		$lines = [];

		$lines[] = self::BLOCK_BEGIN;
		$lines[] = '';

		foreach ( $this->settings->get_managed_bots() as $token => $permissions ) {
			$lines[] = 'User-agent: ' . $token;
			$lines[] = 'Allow: /';
			$lines[] = $this->format_content_signal( $permissions );
			$lines[] = '';
		}

		$lines[] = 'User-agent: *';
		$lines[] = $this->format_content_signal( self::SITE_WIDE_CONTENT_SIGNAL );
		$lines[] = '';

		$lines[] = self::BLOCK_END;

		return implode( "\n", $lines );
	}

	/**
	 * @param array<string, bool> $permissions Permission flags keyed by Agent_Ready_Settings::BOT_PERMISSION_*.
	 */
	private function format_content_signal( array $permissions ): string {
		$signals = [];

		foreach ( self::CONTENT_SIGNAL_KEYS as $permission => $signal_key ) {
			$signals[] = $signal_key . '=' . ( ! empty( $permissions[ $permission ] ) ? 'yes' : 'no' );
		}

		return 'Content-Signal: ' . implode( ', ', $signals );
	}
}
