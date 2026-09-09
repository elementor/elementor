<?php

namespace Elementor\Modules\Agents;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Manages the Elementor Agent Ready block in WordPress's virtual robots.txt.
 *
 * Adds per-bot Allow rules for every major AI retrieval agent and emits a
 * Content-Signal line expressing the site owner's training preference.
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

	/**
	 * Whether a physical robots.txt was detected at registration time.
	 *
	 * @var bool
	 */
	private bool $physical_file_exists;

	/**
	 * Bots to receive explicit Allow: / rules.
	 *
	 * Each entry becomes its own User-agent stanza.
	 *
	 * @var string[]
	 */
	private array $bots = [
		'GPTBot',
		'OAI-SearchBot',
		'ChatGPT-User',
		'ClaudeBot',
		'Claude-User',
		'Claude-SearchBot',
		'PerplexityBot',
		'Perplexity-User',
		'Google-Extended',
		'Applebot-Extended',
		'Amazonbot',
		'meta-externalagent',
		'Bytespider',
		'CCBot',
		'cohere-ai',
		'Diffbot',
		'Timpibot',
		'omgili',
	];

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
	 * @param bool   $public Whether the site discourages search engines.
	 * @return string
	 */
	public function add_rules( string $output, bool $public ): string {
		$block = $this->build_block();

		// Replace an existing block idempotently.
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

	// -------------------------------------------------------------------------
	// Helpers
	// -------------------------------------------------------------------------

	/**
	 * Build the full delimited managed block string.
	 *
	 * @return string
	 */
	private function build_block(): string {
		$lines = [];

		$lines[] = self::BLOCK_BEGIN;
		$lines[] = '';

		// Per-bot stanzas — Allow: / for every managed retrieval bot.
		foreach ( $this->bots as $bot ) {
			$lines[] = 'User-agent: ' . $bot;
			$lines[] = 'Allow: /';
			$lines[] = '';
		}

		// Content Signals under the wildcard agent.
		$lines[] = 'User-agent: *';
		$lines[] = 'Content-Signal: search=yes, ai-input=yes, ai-train=no';
		$lines[] = '';

		$lines[] = self::BLOCK_END;

		return implode( "\n", $lines );
	}
}
