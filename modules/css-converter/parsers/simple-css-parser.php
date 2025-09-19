<?php
namespace Elementor\Modules\CssConverter\Parsers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Simple CSS parser for basic ID and class selectors
 * Fallback when Sabberworm CSS parser is not available
 */
class Simple_Css_Parser {
	
	public function parse( $css ) {
		$rules = [];
		
		// Remove comments
		$css = preg_replace( '/\/\*.*?\*\//s', '', $css );
		
		// Split CSS into rule blocks
		preg_match_all( '/([^{]+)\{([^}]+)\}/', $css, $matches, PREG_SET_ORDER );
		
		foreach ( $matches as $match ) {
			$selectors = array_map( 'trim', explode( ',', $match[1] ) );
			$declarations = $this->parse_declarations( $match[2] );
			
			foreach ( $selectors as $selector ) {
				foreach ( $declarations as $declaration ) {
					$rules[] = [
						'selector' => $selector,
						'property' => $declaration['property'],
						'value' => $declaration['value'],
						'important' => $declaration['important'],
					];
				}
			}
		}
		
		return $rules;
	}
	
	private function parse_declarations( $declarations_block ) {
		$declarations = [];
		$rules = explode( ';', $declarations_block );
		
		foreach ( $rules as $rule ) {
			$rule = trim( $rule );
			if ( empty( $rule ) ) {
				continue;
			}
			
			$parts = explode( ':', $rule, 2 );
			if ( count( $parts ) !== 2 ) {
				continue;
			}
			
			$property = trim( $parts[0] );
			$value = trim( $parts[1] );
			
			// Check for !important
			$important = false;
			if ( strpos( $value, '!important' ) !== false ) {
				$value = trim( str_replace( '!important', '', $value ) );
				$important = true;
			}
			
			$declarations[] = [
				'property' => $property,
				'value' => $value,
				'important' => $important,
			];
		}
		
		return $declarations;
	}
}
