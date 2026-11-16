<?php

namespace ElementorSniffs\Sniffs\Security;

use PHP_CodeSniffer\Files\File;
use PHP_CodeSniffer\Sniffs\Sniff;

class AbilityLabelTranslationSniff implements Sniff {

	private const ABILITY_DEFINITION_CLASS = 'Ability_Definition';

	public function register() {
		return [ T_NEW ];
	}

	public function process( File $phpcs_file, $stack_ptr ) {
		$tokens = $phpcs_file->getTokens();
		$class_ptr = $phpcs_file->findNext( T_STRING, ( $stack_ptr + 1 ), null, false, null, true );

		if ( false === $class_ptr || self::ABILITY_DEFINITION_CLASS !== $tokens[ $class_ptr ]['content'] ) {
			return;
		}

		$open_paren = $phpcs_file->findNext( T_OPEN_PARENTHESIS, $class_ptr );
		if ( false === $open_paren ) {
			return;
		}

		$close_paren = $tokens[ $open_paren ]['parenthesis_closer'] ?? null;
		if ( null === $close_paren ) {
			return;
		}

		$comma = $phpcs_file->findNext( T_COMMA, ( $open_paren + 1 ), $close_paren );
		$label_end = false !== $comma ? $comma : $close_paren;

		$function_ptr = $phpcs_file->findNext( T_STRING, ( $open_paren + 1 ), $label_end, false, '__' );
		if ( false === $function_ptr ) {
			return;
		}

		$next = $phpcs_file->findNext( T_WHITESPACE, ( $function_ptr + 1 ), $label_end, true );
		if ( false === $next || T_OPEN_PARENTHESIS !== $tokens[ $next ]['code'] ) {
			return;
		}

		$phpcs_file->addError(
			'Ability labels must use an escaped translation function. Use esc_html__() instead of __().',
			$function_ptr,
			'UnescapedAbilityLabel'
		);
	}
}
