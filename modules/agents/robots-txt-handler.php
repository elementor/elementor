<?php

namespace Elementor\Modules\Agents;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Adds explicit Allow rules for /llms.txt, /llms-full.txt and /*.md to the
 * WordPress-generated robots.txt, regardless of a bot's broader Disallow rules.
 *
 * The rules are injected via the `robots_txt` filter so they work whether or not
 * the site uses a physical robots.txt file (WordPress serves a virtual one by
 * default at /robots.txt when no physical file exists).
 *
 * Note: if a *physical* robots.txt exists in the web root, WordPress does not
 * serve the virtual one and this filter has no effect. In that case the user
 * must edit the file manually — the admin UI can surface this as a warning.
 */
class Robots_Txt_Handler {

	public function register(): void {
		add_filter( 'robots_txt', [ $this, 'add_allow_rules' ], 20, 2 );
	}

	/**
	 * Append the Allow rules after WordPress's default output.
	 *
	 * @param string $output  Robots.txt content so far.
	 * @param bool   $public  Whether the site is set to discourage search engines.
	 * @return string
	 */
	public function add_allow_rules( string $output, bool $public ): string {
		// We add allow rules regardless of the $public flag so that the agent-
		// ready files remain accessible even if the owner has set the site to
		// "Discourage search engines" in Settings → Reading.
		$rules = $this->build_allow_rules();

		return rtrim( $output ) . "\n\n" . $rules . "\n";
	}

	// -------------------------------------------------------------------------
	// Helpers
	// -------------------------------------------------------------------------

	private function build_allow_rules(): string {
		$home_path = $this->get_home_path();

		$paths = [
			$home_path . '/llms.txt',
			$home_path . '/llms-full.txt',
			$home_path . '/*.md',
		];

		$lines = [ '# Elementor agent-ready files — allow all bots regardless of broader rules', 'User-agent: *' ];

		foreach ( $paths as $path ) {
			$lines[] = 'Allow: ' . $path;
		}

		return implode( "\n", $lines );
	}

	/**
	 * Return the path component of home_url() (e.g. '' for root, '/blog' for
	 * subdirectory installs), without trailing slash.
	 */
	private function get_home_path(): string {
		$path = (string) wp_parse_url( home_url(), PHP_URL_PATH );
		$path = rtrim( $path, '/' );

		return '' === $path ? '' : $path;
	}
}
