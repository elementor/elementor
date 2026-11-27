<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Agents;

use Elementor\Modules\Agents\Classes\Robots_Txt_Parser;
use PHPUnit\Framework\TestCase;

class Test_Robots_Txt_Parser extends TestCase {

	public function test_parse__collects_rules_from_every_wildcard_group() {
		// Arrange
		$parser  = new Robots_Txt_Parser();
		$content = "User-agent: *\nDisallow: /wp-admin/\nAllow: /wp-admin/admin-ajax.php\n\nUser-agent: Bingbot\nDisallow: /bing/\n\nUser-agent: *\nDisallow: /private/\n";

		// Act
		$result = $parser->parse( $content );

		// Assert
		$this->assertSame(
			[ 'Disallow: /wp-admin/', 'Allow: /wp-admin/admin-ajax.php', 'Disallow: /private/' ],
			$result['wildcard_rules']
		);
	}

	public function test_parse__treats_consecutive_user_agent_lines_as_one_group() {
		// Arrange
		$parser  = new Robots_Txt_Parser();
		$content = "User-agent: Bingbot\nUser-agent: *\nDisallow: /shared/\n";

		// Act
		$result = $parser->parse( $content );

		// Assert
		$this->assertSame( [ 'Disallow: /shared/' ], $result['wildcard_rules'] );
		$this->assertSame( [ 'bingbot' ], $result['user_agents'] );
	}

	public function test_parse__ignores_comments_and_unrelated_fields() {
		// Arrange
		$parser  = new Robots_Txt_Parser();
		$content = "# note\nUSER-AGENT: *\nDISALLOW: /a/ # trailing\nCrawl-delay: 10\nSitemap: https://example.com/sitemap.xml\nDisallow:\n";

		// Act
		$result = $parser->parse( $content );

		// Assert
		$this->assertSame( [ 'Disallow: /a/' ], $result['wildcard_rules'] );
	}

	public function test_parse__lowercases_explicit_user_agents() {
		// Arrange
		$parser  = new Robots_Txt_Parser();
		$content = "User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nDisallow: /x/\n";

		// Act
		$result = $parser->parse( $content );

		// Assert
		$this->assertSame( [ 'gptbot' ], $result['user_agents'] );
		$this->assertSame( [ 'Disallow: /x/' ], $result['wildcard_rules'] );
	}
}
