<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CSS_Selector_Parser {

	private const COMBINATORS = [
		' ' => 'descendant',
		'>' => 'child',
		'+' => 'adjacent_sibling',
		'~' => 'general_sibling',
	];

	private const PSEUDO_CLASSES = [
		'not',
		'is',
		'where',
		'has',
		'first-child',
		'last-child',
		'nth-child',
		'nth-last-child',
		'first-of-type',
		'last-of-type',
		'nth-of-type',
		'nth-last-of-type',
		'only-child',
		'only-of-type',
		'empty',
		'root',
		'hover',
		'focus',
		'active',
		'visited',
		'link',
		'disabled',
		'enabled',
		'checked',
		'required',
		'optional',
	];

	public function parse( string $selector ): array {
		$selector = trim( $selector );

		if ( empty( $selector ) ) {
			throw new \InvalidArgumentException( 'Empty selector provided' );
		}

		$this->validate_selector_syntax( $selector );

		return $this->parse_complex_selector( $selector );
	}

	private function validate_selector_syntax( string $selector ): void {
		if ( preg_match( '/[{}]/', $selector ) ) {
			throw new \InvalidArgumentException( 'Selector contains CSS rule syntax (braces)' );
		}

		// Validate parentheses balance
		$this->validate_balanced_parentheses( $selector );

		// Validate brackets balance
		$this->validate_balanced_brackets( $selector );
	}

	private function validate_balanced_parentheses( string $selector ): void {
		$open_count = 0;
		$chars = str_split( $selector );
		$in_quotes = false;
		$quote_char = '';

		foreach ( $chars as $i => $char ) {
			// Handle quotes
			if ( in_array( $char, [ '"', "'" ], true ) && ! $in_quotes ) {
				$in_quotes = true;
				$quote_char = $char;
				continue;
			} elseif ( $char === $quote_char && $in_quotes ) {
				// Check if it's escaped
				if ( $i > 0 && $chars[ $i - 1 ] !== '\\' ) {
					$in_quotes = false;
					$quote_char = '';
				}
				continue;
			}

			// Skip parentheses inside quotes
			if ( $in_quotes ) {
				continue;
			}

			if ( $char === '(' ) {
				++$open_count;
			} elseif ( $char === ')' ) {
				--$open_count;
				if ( $open_count < 0 ) {
					throw new \InvalidArgumentException( "Unmatched closing parenthesis in selector: '{$selector}'" );
				}
			}
		}

		if ( $open_count > 0 ) {
			throw new \InvalidArgumentException( "Unmatched opening parenthesis in selector: '{$selector}'" );
		}
	}

	private function validate_balanced_brackets( string $selector ): void {
		$open_count = 0;
		$chars = str_split( $selector );
		$in_quotes = false;
		$quote_char = '';

		foreach ( $chars as $i => $char ) {
			// Handle quotes
			if ( in_array( $char, [ '"', "'" ], true ) && ! $in_quotes ) {
				$in_quotes = true;
				$quote_char = $char;
				continue;
			} elseif ( $char === $quote_char && $in_quotes ) {
				// Check if it's escaped
				if ( $i > 0 && $chars[ $i - 1 ] !== '\\' ) {
					$in_quotes = false;
					$quote_char = '';
				}
				continue;
			}

			// Skip brackets inside quotes
			if ( $in_quotes ) {
				continue;
			}

			if ( $char === '[' ) {
				++$open_count;
			} elseif ( $char === ']' ) {
				--$open_count;
				if ( $open_count < 0 ) {
					throw new \InvalidArgumentException( 'Unmatched closing bracket in selector' );
				}
			}
		}

		if ( $open_count > 0 ) {
			throw new \InvalidArgumentException( 'Unmatched opening bracket in selector' );
		}
	}

	private function parse_complex_selector( string $selector ): array {
		$parts = [];
		$combinators = [];

		$tokens = $this->tokenize_selector( $selector );
		$current_compound = '';

		foreach ( $tokens as $token ) {
			if ( $this->is_combinator( $token ) ) {
				if ( ! empty( $current_compound ) ) {
					$parts[] = $this->parse_compound_selector( trim( $current_compound ) );
					$current_compound = '';
				}
				$combinators[] = $token;
			} else {
				$current_compound .= $token;
			}
		}

		if ( ! empty( $current_compound ) ) {
			$parts[] = $this->parse_compound_selector( trim( $current_compound ) );
		}

		return [
			'type' => 'complex',
			'parts' => $parts,
			'combinators' => $combinators,
			'specificity' => $this->calculate_specificity( $parts ),
		];
	}

	private function tokenize_selector( string $selector ): array {
		$tokens = [];
		$current_token = '';
		$in_quotes = false;
		$quote_char = '';
		$in_brackets = false;
		$in_parentheses = false;

		$chars = str_split( $selector );
		$length = count( $chars );

		for ( $i = 0; $i < $length; $i++ ) {
			$char = $chars[ $i ];
			$next_char = $i + 1 < $length ? $chars[ $i + 1 ] : '';

			if ( ! $in_quotes && ! $in_brackets && ! $in_parentheses ) {
				if ( $char === ' ' ) {
					if ( ! empty( $current_token ) ) {
						$tokens[] = $current_token;
						$current_token = '';
					}

					$tokens[] = ' ';
					continue;
				}

				if ( in_array( $char, [ '>', '+', '~' ], true ) ) {
					if ( ! empty( $current_token ) ) {
						$tokens[] = $current_token;
						$current_token = '';
					}
					$tokens[] = $char;
					continue;
				}
			}

			if ( in_array( $char, [ '"', "'" ], true ) && ! $in_brackets ) {
				if ( ! $in_quotes ) {
					$in_quotes = true;
					$quote_char = $char;
				} elseif ( $char === $quote_char ) {
					$in_quotes = false;
					$quote_char = '';
				}
			}

			if ( $char === '[' && ! $in_quotes ) {
				$in_brackets = true;
			} elseif ( $char === ']' && ! $in_quotes ) {
				$in_brackets = false;
			}

			if ( $char === '(' && ! $in_quotes && ! $in_brackets ) {
				$in_parentheses = true;
			} elseif ( $char === ')' && ! $in_quotes && ! $in_brackets ) {
				$in_parentheses = false;
			}

			$current_token .= $char;
		}

		if ( ! empty( $current_token ) ) {
			$tokens[] = $current_token;
		}

		return array_filter( $tokens, function( $token ) {
			return trim( $token ) !== '';
		} );
	}

	private function is_combinator( string $token ): bool {
		return isset( self::COMBINATORS[ trim( $token ) ] );
	}

	private function parse_compound_selector( string $compound ): array {
		$parts = [];
		$remaining = $compound;

		while ( ! empty( $remaining ) ) {
			$part = $this->extract_next_simple_selector( $remaining );
			if ( $part ) {
				$parts[] = $part;
				$remaining = substr( $remaining, strlen( $part['raw'] ) );
			} else {
				break;
			}
		}

		if ( empty( $parts ) ) {
			throw new \InvalidArgumentException( "Invalid compound selector: {$compound}" );
		}

		return [
			'type' => 'compound',
			'parts' => $parts,
			'raw' => $compound,
		];
	}

	private function extract_next_simple_selector( string $selector ): ?array {
		if ( empty( $selector ) ) {
			return null;
		}

		$first_char = $selector[0];

		switch ( $first_char ) {
			case '.':
				return $this->parse_class_selector( $selector );
			case '#':
				return $this->parse_id_selector( $selector );
			case '[':
				return $this->parse_attribute_selector( $selector );
			case ':':
				return $this->parse_pseudo_selector( $selector );
			default:
				if ( ctype_alpha( $first_char ) ) {
					return $this->parse_element_selector( $selector );
				}
				return null;
		}
	}

	private function parse_class_selector( string $selector ): array {
		if ( preg_match( '/^\.([a-zA-Z0-9_-]+)/', $selector, $matches ) ) {
			return [
				'type' => 'class',
				'value' => $matches[1],
				'raw' => $matches[0],
			];
		}

		throw new \InvalidArgumentException( "Invalid class selector: {$selector}" );
	}

	private function parse_id_selector( string $selector ): array {
		if ( preg_match( '/^#([a-zA-Z0-9_-]+)/', $selector, $matches ) ) {
			return [
				'type' => 'id',
				'value' => $matches[1],
				'raw' => $matches[0],
			];
		}

		throw new \InvalidArgumentException( "Invalid ID selector: {$selector}" );
	}

	private function parse_element_selector( string $selector ): array {
		if ( preg_match( '/^([a-zA-Z][a-zA-Z0-9-]*)/', $selector, $matches ) ) {
			return [
				'type' => 'element',
				'value' => $matches[1],
				'raw' => $matches[0],
			];
		}

		throw new \InvalidArgumentException( "Invalid element selector: {$selector}" );
	}

	private function parse_attribute_selector( string $selector ): array {
		$pattern = '/^\[([a-zA-Z0-9_-]+)(?:([\~\|\^\$\*]?=)(["\']?)([^"\'\]]*)\3)?\]/';

		if ( preg_match( $pattern, $selector, $matches ) ) {
			$attribute = $matches[1];
			$operator = $matches[2] ?? null;
			$value = $matches[4] ?? null;

			return [
				'type' => 'attribute',
				'attribute' => $attribute,
				'operator' => $operator,
				'value' => $value,
				'raw' => $matches[0],
			];
		}

		throw new \InvalidArgumentException( "Invalid attribute selector: {$selector}" );
	}

	private function parse_pseudo_selector( string $selector ): array {
		if ( preg_match( '/^::?([a-zA-Z0-9_-]+)(\([^)]*\))?/', $selector, $matches ) ) {
			$name = $matches[1];
			$argument = isset( $matches[2] ) ? trim( $matches[2], '()' ) : null;
			$is_element = strpos( $matches[0], '::' ) === 0;

			return [
				'type' => $is_element ? 'pseudo-element' : 'pseudo-class',
				'name' => $name,
				'argument' => $argument,
				'raw' => $matches[0],
			];
		}

		throw new \InvalidArgumentException( "Invalid pseudo selector: {$selector}" );
	}

	private function calculate_specificity( array $parts ): int {
		$specificity = 0;

		foreach ( $parts as $part ) {
			if ( $part['type'] === 'compound' ) {
				foreach ( $part['parts'] as $simple ) {
					$specificity += $this->get_simple_selector_specificity( $simple );
				}
			} else {
				$specificity += $this->get_simple_selector_specificity( $part );
			}
		}

		return $specificity;
	}

	private function get_simple_selector_specificity( array $selector ): int {
		switch ( $selector['type'] ) {
			case 'id':
				return 100;
			case 'class':
			case 'attribute':
			case 'pseudo-class':
				return 10;
			case 'element':
			case 'pseudo-element':
				return 1;
			default:
				return 0;
		}
	}

	public function is_simple_selector( string $selector ): bool {
		$selector = trim( $selector );

		return ! preg_match( '/[\s>+~]/', $selector );
	}

	public function get_combinator_type( string $combinator ): string {
		return self::COMBINATORS[ trim( $combinator ) ] ?? 'unknown';
	}

	public function extract_classes_from_selector( string $selector ): array {
		$parsed = $this->parse( $selector );
		$classes = [];

		$this->collect_classes_from_parsed( $parsed, $classes );

		return array_unique( $classes );
	}

	private function collect_classes_from_parsed( array $parsed, array &$classes ): void {
		if ( $parsed['type'] === 'complex' ) {
			foreach ( $parsed['parts'] as $part ) {
				$this->collect_classes_from_parsed( $part, $classes );
			}
		} elseif ( $parsed['type'] === 'compound' ) {
			foreach ( $parsed['parts'] as $simple ) {
				if ( $simple['type'] === 'class' ) {
					$classes[] = $simple['value'];
				}
			}
		} elseif ( $parsed['type'] === 'class' ) {
			$classes[] = $parsed['value'];
		}
	}

	public function get_target_selector_part( array $parsed ): array {
		if ( $parsed['type'] === 'complex' && ! empty( $parsed['parts'] ) ) {
			return end( $parsed['parts'] );
		}

		return $parsed;
	}
}
