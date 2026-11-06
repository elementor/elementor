<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Mapper;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Css_Declaration_Parser;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Css_Declaration_Parser extends TestCase {

	public function test_parse_declarations__semicolons_in_quotes_parentheses_and_comments_do_not_split() {
		// Act.
		$rules = ( new Css_Declaration_Parser() )->parse_declarations(
			'content: "a;b"; /* note; here */ background-image: url(data:image/png;base64,AAAA); color: blue;'
		);

		// Assert.
		$this->assertSame(
			[
				[
					'property' => 'content',
					'value' => '"a;b"',
				],
				[
					'property' => 'background-image',
					'value' => 'url(data:image/png;base64,AAAA)',
				],
				[
					'property' => 'color',
					'value' => 'blue',
				],
			],
			$rules
		);
	}

	public function test_parse_declarations__unterminated_string_is_dropped() {
		// Act.
		$rules = ( new Css_Declaration_Parser() )->parse_declarations( 'color: blue; content: "a;' );

		// Assert.
		$this->assertSame(
			[
				[
					'property' => 'color',
					'value' => 'blue',
				],
			],
			$rules
		);
	}
}
