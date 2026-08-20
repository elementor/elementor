<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Abilities\Utils\Prompt_Loader;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Prompt_Loader_Stub extends Prompt_Loader {
	protected static function get_core_path(): string {
		return __DIR__ . '/../../../../../resources/prompts/';
	}

	protected static function resolve_extra_path(): ?string {
		return __DIR__ . '/../../../../../resources/prompts-extras/';
	}
}

class Prompt_Loader_Stub_No_Extra extends Prompt_Loader {
	protected static function get_core_path(): string {
		return __DIR__ . '/../../../../../resources/prompts/';
	}

	protected static function resolve_extra_path(): ?string {
		return null;
	}
}

class Test_Prompt_Loader extends TestCase {

	public function test_load__returns_empty_string_when_core_file_missing() {
		// Act.
		$result = Prompt_Loader_Stub::load( 'non-existent' );

		// Assert.
		$this->assertSame( '', $result );
	}

	public function test_load__returns_core_content_when_no_matching_extra_file() {
		// Act — 'stub-core-only' exists in core but has no counterpart in extras.
		$result = Prompt_Loader_Stub::load( 'stub-core-only' );

		// Assert.
		$this->assertSame( 'core-1', $result );
	}

	public function test_load__appends_extra_content_with_blank_line_separator() {
		// Act — both core and extra files exist for 'stub'.
		$result = Prompt_Loader_Stub::load( 'stub' );

		// Assert.
		$this->assertStringContainsString( "core-1\n\nextra-1", $result );
	}

	public function test_load__returns_only_core_when_extra_path_is_null() {
		// Act — both files exist but extra path resolver returns null.
		$result = Prompt_Loader_Stub_No_Extra::load( 'stub' );

		// Assert.
		$this->assertSame( 'core-1', $result );
	}

	public function test_load__returns_extra_content_when_core_file_missing() {
		// Act — extra file exists for 'stub-extra-only' but core does not.
		$result = Prompt_Loader_Stub::load( 'stub-extra-only' );

		// Assert.
		$this->assertSame( 'extra-2', $result );
	}
}
