<?php

namespace Elementor\Modules\Agents;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Known AI crawlers that the Bot access control module can manage.
 *
 * Tokens are published verbatim as robots.txt `User-agent` values; robots.txt
 * matches them case-insensitively, so `name` only controls the admin display.
 * Popular bots are managed by default; the rest are offered in the admin picker.
 */
class Bot_Catalog {

	const LOGOS_DIR = 'images/agents/bots/';

	const LOGO_EXTENSION = '.svg';

	private const BOTS = [
		[
			'token' => 'GPTBot',
			'name' => 'GPTBot',
			'vendor' => 'OpenAI',
			'logo' => 'openai',
			'is_popular' => true,
		],
		[
			'token' => 'OAI-SearchBot',
			'name' => 'OAI-SearchBot',
			'vendor' => 'OpenAI',
			'logo' => 'openai',
			'is_popular' => false,
		],
		[
			'token' => 'ChatGPT-User',
			'name' => 'ChatGPT-User',
			'vendor' => 'OpenAI',
			'logo' => 'openai',
			'is_popular' => false,
		],
		[
			'token' => 'ClaudeBot',
			'name' => 'ClaudeBot',
			'vendor' => 'Anthropic',
			'logo' => 'anthropic',
			'is_popular' => true,
		],
		[
			'token' => 'Claude-User',
			'name' => 'Claude-User',
			'vendor' => 'Anthropic',
			'logo' => 'anthropic',
			'is_popular' => false,
		],
		[
			'token' => 'Claude-SearchBot',
			'name' => 'Claude-SearchBot',
			'vendor' => 'Anthropic',
			'logo' => 'anthropic',
			'is_popular' => false,
		],
		[
			'token' => 'PerplexityBot',
			'name' => 'PerplexityBot',
			'vendor' => 'Perplexity',
			'logo' => 'perplexity',
			'is_popular' => true,
		],
		[
			'token' => 'Perplexity-User',
			'name' => 'Perplexity-User',
			'vendor' => 'Perplexity',
			'logo' => 'perplexity',
			'is_popular' => false,
		],
		[
			'token' => 'Google-Extended',
			'name' => 'Google-Extended',
			'vendor' => 'Google',
			'logo' => 'google',
			'is_popular' => true,
		],
		[
			'token' => 'Applebot-Extended',
			'name' => 'Applebot-Extended',
			'vendor' => 'Apple',
			'logo' => 'apple',
			'is_popular' => true,
		],
		[
			'token' => 'Amazonbot',
			'name' => 'Amazonbot',
			'vendor' => 'Amazon',
			'logo' => 'amazon',
			'is_popular' => true,
		],
		[
			'token' => 'meta-externalagent',
			'name' => 'Meta-ExternalAgent',
			'vendor' => 'Meta',
			'logo' => 'meta',
			'is_popular' => true,
		],
		[
			'token' => 'Bytespider',
			'name' => 'Bytespider',
			'vendor' => 'ByteDance',
			'logo' => 'bytedance',
			'is_popular' => false,
		],
		[
			'token' => 'CCBot',
			'name' => 'CCBot',
			'vendor' => 'Common Crawl',
			'logo' => 'common-crawl',
			'is_popular' => false,
		],
		[
			'token' => 'cohere-ai',
			'name' => 'cohere-ai',
			'vendor' => 'Cohere',
			'logo' => 'cohere',
			'is_popular' => false,
		],
		[
			'token' => 'Diffbot',
			'name' => 'Diffbot',
			'vendor' => 'Diffbot',
			'logo' => 'diffbot',
			'is_popular' => false,
		],
		[
			'token' => 'Timpibot',
			'name' => 'Timpibot',
			'vendor' => 'Timpi',
			'logo' => 'timpi',
			'is_popular' => false,
		],
		[
			'token' => 'omgili',
			'name' => 'omgili',
			'vendor' => 'Webz.io',
			'logo' => 'webz',
			'is_popular' => false,
		],
	];

	/**
	 * @return array<int, array{token: string, name: string, vendor: string, logo: string, is_popular: bool}>
	 */
	public function get_bots(): array {
		return self::BOTS;
	}

	/**
	 * @return string[]
	 */
	public function get_tokens(): array {
		return array_column( self::BOTS, 'token' );
	}

	/**
	 * @return string[]
	 */
	public function get_popular_tokens(): array {
		$popular = array_filter( self::BOTS, fn( array $bot ) => $bot['is_popular'] );

		return array_values( array_column( $popular, 'token' ) );
	}

	public function get_logo_url( string $logo ): string {
		$relative_path = self::LOGOS_DIR . $logo . self::LOGO_EXTENSION;

		if ( ! file_exists( ELEMENTOR_ASSETS_PATH . $relative_path ) ) {
			return '';
		}

		return ELEMENTOR_ASSETS_URL . $relative_path;
	}
}
