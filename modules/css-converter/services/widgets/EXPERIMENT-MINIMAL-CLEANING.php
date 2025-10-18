<?php
/**
 * EXPERIMENT: Test what CSS the parser can actually handle
 * 
 * This file contains experimental code to determine:
 * 1. Does var() break the parser? (Hypothesis: NO)
 * 2. Does calc() break the parser? (Hypothesis: Only complex nested ones)
 * 3. What ACTUALLY breaks the parser? (Hypothesis: Malformed arithmetic)
 */

namespace Elementor\Modules\CssConverter\Services\Widgets;

class Minimal_Cleaning_Experiment {
	
	private $css_parser;
	
	public function __construct() {
		require_once __DIR__ . '/../../parsers/css-parser.php';
		$this->css_parser = new \Elementor\Modules\CssConverter\Parsers\CssParser();
	}
	
	/**
	 * Test 1: Can the parser handle var()?
	 */
	public function test_var_parsing(): array {
		$test_cases = [
			'simple_var' => 'color: var(--primary-color);',
			'var_with_fallback' => 'color: var(--primary-color, blue);',
			'var_in_font_family' => 'font-family: var(--font-primary), Sans-serif;',
			'elementor_global_var' => 'color: var(--e-global-color-primary);',
			'multiple_vars' => 'margin: var(--spacing-top) var(--spacing-right);',
		];
		
		$results = [];
		foreach ( $test_cases as $name => $css ) {
			$full_css = ".test { {$css} }";
			try {
				$this->css_parser->parse( $full_css );
				$results[ $name ] = 'PASS ✅';
			} catch ( \Exception $e ) {
				$results[ $name ] = 'FAIL ❌: ' . $e->getMessage();
			}
		}
		
		return $results;
	}
	
	/**
	 * Test 2: Can the parser handle calc()?
	 */
	public function test_calc_parsing(): array {
		$test_cases = [
			'simple_calc' => 'width: calc(100% - 20px);',
			'calc_with_addition' => 'margin: calc(50% + 10px);',
			'calc_with_var' => 'width: calc(100% - var(--spacing));',
			'nested_calc_2_levels' => 'width: calc(100% - calc(50px + 10px));',
			'nested_calc_3_levels' => 'width: calc(100% - calc(50px + calc(10px * 2)));',
		];
		
		$results = [];
		foreach ( $test_cases as $name => $css ) {
			$full_css = ".test { {$css} }";
			try {
				$this->css_parser->parse( $full_css );
				$results[ $name ] = 'PASS ✅';
			} catch ( \Exception $e ) {
				$results[ $name ] = 'FAIL ❌: ' . $e->getMessage();
			}
		}
		
		return $results;
	}
	
	/**
	 * Test 3: What patterns actually break the parser?
	 */
	public function test_breaking_patterns(): array {
		$test_cases = [
			'bare_arithmetic' => 'width: (2 - 1);',
			'min_with_bare_arithmetic' => 'width: min(100%, (2 - 1));',
			'max_with_bare_arithmetic' => 'width: max(100%, (50 + 10));',
			'malformed_calc' => 'width: calc(100% - );',
			'unclosed_paren' => 'width: calc(100% - 20px;',
			'newline_in_value' => "width: calc(100%\n- 20px);",
		];
		
		$results = [];
		foreach ( $test_cases as $name => $css ) {
			$full_css = ".test { {$css} }";
			try {
				$this->css_parser->parse( $full_css );
				$results[ $name ] = 'PASS ✅ (unexpected)';
			} catch ( \Exception $e ) {
				$results[ $name ] = 'FAIL ❌ (expected): ' . $e->getMessage();
			}
		}
		
		return $results;
	}
	
	/**
	 * Test 4: Real-world CSS from oboxthemes.com
	 */
	public function test_real_world_css(): array {
		$test_cases = [
			'obox_typography' => '
				.elementor-1140 .elementor-element.elementor-element-6d397c1 {
					font-family: "freight-text-pro", Sans-serif;
					font-size: 26px;
					font-weight: 400;
					line-height: 36px;
					color: var(--e-global-color-e66ebc9);
				}
			',
			'obox_with_calc' => '
				.test {
					margin: 30px 0px calc(var(--kit-widget-spacing, 0px) + 30px) 0px;
				}
			',
		];
		
		$results = [];
		foreach ( $test_cases as $name => $css ) {
			try {
				$this->css_parser->parse( $css );
				$results[ $name ] = 'PASS ✅';
			} catch ( \Exception $e ) {
				$results[ $name ] = 'FAIL ❌: ' . $e->getMessage();
			}
		}
		
		return $results;
	}
	
	/**
	 * Run all experiments and generate report
	 */
	public function run_all_experiments(): array {
		return [
			'var_tests' => $this->test_var_parsing(),
			'calc_tests' => $this->test_calc_parsing(),
			'breaking_patterns' => $this->test_breaking_patterns(),
			'real_world' => $this->test_real_world_css(),
		];
	}
}

/**
 * Run the experiment
 */
function run_minimal_cleaning_experiment() {
	$experiment = new Minimal_Cleaning_Experiment();
	$results = $experiment->run_all_experiments();
	
	error_log( '========================================' );
	error_log( 'CSS PARSER CAPABILITY EXPERIMENT' );
	error_log( '========================================' );
	
	foreach ( $results as $category => $tests ) {
		error_log( '' );
		error_log( strtoupper( str_replace( '_', ' ', $category ) ) . ':' );
		foreach ( $tests as $test_name => $result ) {
			error_log( "  {$test_name}: {$result}" );
		}
	}
	
	error_log( '========================================' );
	
	return $results;
}

