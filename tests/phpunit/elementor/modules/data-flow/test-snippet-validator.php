<?php

use Elementor\Modules\DataFlow\Snippets\Snippet_Validator;
use Elementor\Modules\DataFlow\Snippets\Snippet_Wrapper;
use PHPUnit\Framework\TestCase;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\DataFlow
 */
class Test_Snippet_Validator extends TestCase {
	const VALID_CODE = '({ state }) => { state.count += 1; }';

	public function test_validate__accepts_a_well_formed_snippet() {
		// Arrange
		$handlers = [ [ 'event' => 'click', 'description' => ' Adds one ', 'code' => ' ' . self::VALID_CODE . ' ', 'extra' => 'dropped' ] ];

		// Act
		$result = Snippet_Validator::validate( 'counter', $handlers );

		// Assert
		$this->assertSame( [], $result['errors'] );
		$this->assertSame( [ [ 'event' => 'click', 'description' => 'Adds one', 'code' => self::VALID_CODE ] ], $result['handlers'] );
	}

	/**
	 * @dataProvider invalid_snippets
	 */
	public function test_validate__reports_specific_error_codes( string $name, $handlers, string $expected_code ) {
		// Act
		$result = Snippet_Validator::validate( $name, $handlers );

		// Assert
		$this->assertContains( $expected_code, array_column( $result['errors'], 'code' ) );
	}

	public function invalid_snippets(): array {
		$valid = [ 'event' => 'click', 'description' => 'd', 'code' => self::VALID_CODE ];

		return [
			'bad name' => [ 'Bad Name', [ $valid ], 'snippet_invalid_name' ],
			'no handlers' => [ 'a', [], 'snippet_no_handlers' ],
			'too many' => [ 'a', array_fill( 0, Snippet_Validator::MAX_HANDLERS + 1, $valid ), 'snippet_too_many_handlers' ],
			'bad event' => [ 'a', [ array_merge( $valid, [ 'event' => 'scroll' ] ) ], 'snippet_invalid_event' ],
			'empty code' => [ 'a', [ array_merge( $valid, [ 'code' => ' ' ] ) ], 'snippet_empty_code' ],
			'no description' => [ 'a', [ array_merge( $valid, [ 'description' => '' ] ) ], 'snippet_missing_description' ],
			'not a function' => [ 'a', [ array_merge( $valid, [ 'code' => 'state.count = 1;' ] ) ], 'snippet_not_a_function' ],
			'dom access' => [ 'a', [ array_merge( $valid, [ 'code' => '() => document.title = "x"' ] ) ], 'snippet_forbidden_api' ],
			'inline style' => [ 'a', [ array_merge( $valid, [ 'code' => '({ event }) => event.target.style.color = "red"' ] ) ], 'snippet_forbidden_api' ],
			'network' => [ 'a', [ array_merge( $valid, [ 'code' => '() => fetch("/x")' ] ) ], 'snippet_forbidden_api' ],
			'duplicate event' => [ 'a', [ $valid, $valid ], 'snippet_duplicate_event' ],
			'too large' => [ 'a', [ array_merge( $valid, [ 'code' => '() => {' . str_repeat( ' ', Snippet_Validator::MAX_CODE_BYTES ) . '}' ] ) ], 'snippet_code_too_large' ],
		];
	}

	public function test_wrap__registers_each_handler_function_by_event() {
		// Arrange
		$handlers = [
			[ 'event' => 'click', 'description' => 'd', 'code' => self::VALID_CODE ],
			[ 'event' => 'init', 'description' => 'd', 'code' => '() => {}' ],
		];

		// Act
		$js = Snippet_Wrapper::wrap( 'counter', $handlers );

		// Assert
		$this->assertStringStartsWith( 'window.elementorDataFlow.registerSnippet("counter", {', $js );
		$this->assertStringContainsString( '"click": (' . self::VALID_CODE . "\n)", $js );
		$this->assertStringContainsString( '"init": (() => {}' . "\n)", $js );
	}
}
