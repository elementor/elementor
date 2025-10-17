<?php
namespace Elementor\Modules\CssConverter\Tests\Services\Variables;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Variables\Nested_Variable_Extractor;
use Elementor\Modules\CssConverter\Services\Variables\CSS_Value_Normalizer;
use Elementor\Modules\CssConverter\Services\Variables\Nested_Variable_Renamer;
use PHPUnit\Framework\TestCase;

class Nested_Variable_Extractor_Test extends TestCase {

	private $extractor;
	private $normalizer;
	private $renamer;

	protected function setUp(): void {
		$this->normalizer = new CSS_Value_Normalizer();
		$this->renamer = new Nested_Variable_Renamer();
		$this->extractor = new Nested_Variable_Extractor( $this->normalizer, $this->renamer );
	}

	public function test_simple_root_only_variables() {
		$raw_variables = [
			'--color' => [
				'name' => '--color',
				'value' => '#007bff',
				'scope' => ':root',
				'original_block' => ':root { --color: #007bff; }',
			],
			'--spacing' => [
				'name' => '--spacing',
				'value' => '16px',
				'scope' => ':root',
				'original_block' => ':root { --spacing: 16px; }',
			],
		];

		$result = $this->extractor->extract_and_rename( $raw_variables );

		$this->assertCount( 2, $result['variables'] );
		$this->assertArrayHasKey( '--color', $result['variables'] );
		$this->assertArrayHasKey( '--spacing', $result['variables'] );
		$this->assertEquals( 2, $result['stats']['root_variables'] );
		$this->assertEquals( 0, $result['stats']['nested_variables'] );
	}

	public function test_identical_values_reuse_variable() {
		$raw_variables = [
			'--color' => [
				'name' => '--color',
				'value' => '#ff0000',
				'scope' => ':root',
				'original_block' => ':root { --color: #ff0000; }',
			],
			'--color-theme' => [
				'name' => '--color',
				'value' => '#ff0000',
				'scope' => '.theme-1',
				'original_block' => '.theme-1 { --color: #ff0000; }',
			],
		];

		$result = $this->extractor->extract_and_rename( $raw_variables );

		$this->assertCount( 1, $result['variables'] );
		$this->assertArrayHasKey( '--color', $result['variables'] );
		$mapping = $result['variable_mapping'];
		$this->assertEquals( '--color', $mapping[':root --color'] );
		$this->assertEquals( '--color', $mapping['.theme-1 --color'] );
	}

	public function test_different_values_create_suffixes() {
		$raw_variables = [
			'--color' => [
				'name' => '--color',
				'value' => '#007bff',
				'scope' => ':root',
				'original_block' => ':root { --color: #007bff; }',
			],
			'--color-light' => [
				'name' => '--color',
				'value' => '#ffffff',
				'scope' => '.theme-light',
				'original_block' => '.theme-light { --color: #ffffff; }',
			],
			'--color-dark' => [
				'name' => '--color',
				'value' => '#1a1a1a',
				'scope' => '.theme-dark',
				'original_block' => '.theme-dark { --color: #1a1a1a; }',
			],
		];

		$result = $this->extractor->extract_and_rename( $raw_variables );

		$this->assertCount( 3, $result['variables'] );
		$this->assertArrayHasKey( '--color', $result['variables'] );
		$this->assertArrayHasKey( '--color-1', $result['variables'] );
		$this->assertArrayHasKey( '--color-2', $result['variables'] );
	}

	public function test_media_query_variables_separate_scope() {
		$raw_variables = [
			'--font-size' => [
				'name' => '--font-size',
				'value' => '16px',
				'scope' => ':root',
				'original_block' => ':root { --font-size: 16px; }',
			],
			'--font-size-media' => [
				'name' => '--font-size',
				'value' => '14px',
				'scope' => '@media (max-width: 768px) :root',
				'original_block' => '@media (max-width: 768px) { :root { --font-size: 14px; } }',
			],
		];

		$result = $this->extractor->extract_and_rename( $raw_variables );

		$this->assertCount( 2, $result['variables'] );
		$this->assertArrayHasKey( '--font-size', $result['variables'] );
		$this->assertArrayHasKey( '--font-size-1', $result['variables'] );
	}

	public function test_color_normalization_hex_to_rgb() {
		$hex_value = '#ff0000';
		$rgb_value = $this->normalizer->normalize( $hex_value );

		$this->assertStringContainsString( 'rgb', $rgb_value );
	}

	public function test_whitespace_normalization() {
		$value = '  16  px  ';
		$normalized = $this->normalizer->normalize( $value );

		$this->assertEquals( '16px', $normalized );
	}

	public function test_multiple_nested_same_value_reuse() {
		$raw_variables = [
			'--spacing' => [
				'name' => '--spacing',
				'value' => '16px',
				'scope' => ':root',
				'original_block' => ':root { --spacing: 16px; }',
			],
			'--spacing-theme1' => [
				'name' => '--spacing',
				'value' => '20px',
				'scope' => '.theme-1',
				'original_block' => '.theme-1 { --spacing: 20px; }',
			],
			'--spacing-theme2' => [
				'name' => '--spacing',
				'value' => '20px',
				'scope' => '.theme-2',
				'original_block' => '.theme-2 { --spacing: 20px; }',
			],
		];

		$result = $this->extractor->extract_and_rename( $raw_variables );

		$this->assertCount( 2, $result['variables'] );
		$this->assertArrayHasKey( '--spacing', $result['variables'] );
		$this->assertArrayHasKey( '--spacing-1', $result['variables'] );

		$mapping = $result['variable_mapping'];
		$this->assertEquals( '--spacing-1', $mapping['.theme-1 --spacing'] );
		$this->assertEquals( '--spacing-1', $mapping['.theme-2 --spacing'] );
	}

	public function test_scope_references_tracking() {
		$raw_variables = [
			'--color' => [
				'name' => '--color',
				'value' => '#007bff',
				'scope' => ':root',
				'original_block' => ':root { --color: #007bff; }',
			],
			'--color-light' => [
				'name' => '--color',
				'value' => '#ffffff',
				'scope' => '.theme-light',
				'original_block' => '.theme-light { --color: #ffffff; }',
			],
		];

		$result = $this->extractor->extract_and_rename( $raw_variables );

		$this->assertArrayHasKey( '--color', $result['scope_references'] );
		$this->assertArrayHasKey( '--color-1', $result['scope_references'] );
		$this->assertContains( ':root', $result['scope_references']['--color'] );
		$this->assertContains( '.theme-light', $result['scope_references']['--color-1'] );
	}

	public function test_suffix_collision_resolution() {
		$variables = [
			'--size' => [ 'value' => '10px' ],
			'--size-1' => [ 'value' => '20px' ],
		];

		$next_suffix = $this->renamer->find_next_suffix( '--size', $variables );
		$this->assertEquals( 2, $next_suffix );

		$new_name = $this->renamer->apply_suffix( '--size', $next_suffix );
		$this->assertEquals( '--size-2', $new_name );
	}

	public function test_extract_suffix_number() {
		$suffix = $this->renamer->extract_suffix_number( '--color-3', '--color' );
		$this->assertEquals( 3, $suffix );

		$no_suffix = $this->renamer->extract_suffix_number( '--color', '--color' );
		$this->assertNull( $no_suffix );

		$wrong_format = $this->renamer->extract_suffix_number( '--color-abc', '--color' );
		$this->assertNull( $wrong_format );
	}

	public function test_get_all_variants() {
		$variables = [
			'--color' => [ 'value' => '#007bff' ],
			'--color-1' => [ 'value' => '#ffffff' ],
			'--color-2' => [ 'value' => '#1a1a1a' ],
			'--padding' => [ 'value' => '16px' ],
		];

		$variants = $this->renamer->get_all_variants( '--color', $variables );

		$this->assertCount( 3, $variants );
		$this->assertArrayHasKey( '--color', $variants );
		$this->assertArrayHasKey( '--color-1', $variants );
		$this->assertArrayHasKey( '--color-2', $variants );
		$this->assertArrayNotHasKey( '--padding', $variants );
	}

	public function test_complex_theme_system() {
		$raw_variables = [
			'--primary' => [
				'name' => '--primary',
				'value' => '#007bff',
				'scope' => ':root',
				'original_block' => ':root { --primary: #007bff; }',
			],
			'--primary-dark' => [
				'name' => '--primary',
				'value' => '#0d6efd',
				'scope' => '@media (prefers-color-scheme: dark) :root',
				'original_block' => '@media { :root { --primary: #0d6efd; } }',
			],
			'--primary-brand' => [
				'name' => '--primary',
				'value' => '#ff6b35',
				'scope' => '.theme-brand',
				'original_block' => '.theme-brand { --primary: #ff6b35; }',
			],
			'--primary-corporate' => [
				'name' => '--primary',
				'value' => '#1a472a',
				'scope' => '.theme-corporate',
				'original_block' => '.theme-corporate { --primary: #1a472a; }',
			],
		];

		$result = $this->extractor->extract_and_rename( $raw_variables );

		$this->assertCount( 4, $result['variables'] );
		$this->assertEquals( 1, $result['stats']['root_variables'] );
		$this->assertEquals( 3, $result['stats']['nested_variables'] );

		$this->assertArrayHasKey( '--primary', $result['variables'] );
		$this->assertArrayHasKey( '--primary-1', $result['variables'] );
		$this->assertArrayHasKey( '--primary-2', $result['variables'] );
		$this->assertArrayHasKey( '--primary-3', $result['variables'] );
	}
}

