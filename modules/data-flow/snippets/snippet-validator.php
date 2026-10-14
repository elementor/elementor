<?php

namespace Elementor\Modules\DataFlow\Snippets;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Snippet_Validator {
	const NAME_PATTERN = '/^[a-z][a-z0-9-]{0,63}$/';
	const FUNCTION_PATTERN = '/^\s*(\(|function\b|[A-Za-z_$][\w$]*\s*=>)/';
	const ALLOWED_EVENTS = [ 'init', 'click', 'input', 'change', 'submit', 'keydown', 'mouseenter', 'mouseleave', 'pointerdown', 'pointermove', 'pointerup' ];
	const MAX_HANDLERS = 10;
	const MAX_CODE_BYTES = 20480;
	const MAX_DESCRIPTION_LENGTH = 300;
	const FORBIDDEN_APIS = [
		'document' => '/\bdocument\b/',
		'window' => '/\bwindow\b/',
		'innerHTML' => '/\binnerHTML\b|\bouterHTML\b/',
		'style' => '/\.style\b/',
		'querySelector' => '/\bquerySelector(All)?\b|\bgetElementBy\w+/',
		'eval' => '/\beval\s*\(/',
		'Function' => '/\bFunction\s*\(/',
		'import' => '/\bimport\s*\(/',
		'fetch' => '/\bfetch\s*\(/',
		'XMLHttpRequest' => '/\bXMLHttpRequest\b/',
	];

	public static function validate( string $name, $handlers ): array {
		$errors = [];

		if ( 1 !== preg_match( self::NAME_PATTERN, $name ) ) {
			$errors[] = self::error( 'snippet_invalid_name', 'Snippet names are lowercase letters, digits and dashes, starting with a letter (max 64 characters).' );
		}

		if ( ! is_array( $handlers ) || empty( $handlers ) ) {
			$errors[] = self::error( 'snippet_no_handlers', 'A snippet needs at least one handler.' );

			return [ 'errors' => $errors, 'handlers' => [] ];
		}

		if ( count( $handlers ) > self::MAX_HANDLERS ) {
			$errors[] = self::error( 'snippet_too_many_handlers', sprintf( 'A snippet can have at most %d handlers.', self::MAX_HANDLERS ) );
		}

		$sanitized = [];

		foreach ( array_values( $handlers ) as $index => $handler ) {
			$handler_errors = self::validate_handler( $handler, $index );

			$errors = array_merge( $errors, $handler_errors );

			if ( empty( $handler_errors ) ) {
				$sanitized[] = self::normalize_handler( $handler );
			}
		}

		if ( count( array_unique( array_column( $sanitized, 'event' ) ) ) !== count( $sanitized ) ) {
			$errors[] = self::error( 'snippet_duplicate_event', 'Use one handler per event in a snippet. Do everything for that event in the same function.' );
		}

		if ( self::get_total_code_bytes( $sanitized ) > self::MAX_CODE_BYTES ) {
			$errors[] = self::error( 'snippet_code_too_large', sprintf( 'The code of a snippet is limited to %d bytes.', self::MAX_CODE_BYTES ) );
		}

		return [ 'errors' => $errors, 'handlers' => $sanitized ];
	}

	private static function validate_handler( $handler, int $index ): array {
		if ( ! is_array( $handler ) || ! is_string( $handler['code'] ?? null ) || '' === trim( $handler['code'] ) ) {
			return [ self::error( 'snippet_empty_code', 'Every handler needs a code string.', $index ) ];
		}

		if ( ! in_array( $handler['event'] ?? null, self::ALLOWED_EVENTS, true ) ) {
			return [ self::error( 'snippet_invalid_event', 'Allowed events: ' . implode( ', ', self::ALLOWED_EVENTS ) . '.', $index ) ];
		}

		$errors = [];

		if ( ! is_string( $handler['description'] ?? null ) || '' === trim( $handler['description'] ) ) {
			$errors[] = self::error( 'snippet_missing_description', 'Every handler needs a short human readable description.', $index );
		}

		if ( 1 !== preg_match( self::FUNCTION_PATTERN, $handler['code'] ) ) {
			$errors[] = self::error( 'snippet_not_a_function', 'The code must be a single function, for example ({ state, event }) => { state.count += 1; }.', $index );
		}

		foreach ( self::FORBIDDEN_APIS as $api => $pattern ) {
			if ( 1 === preg_match( $pattern, $handler['code'] ) ) {
				$errors[] = self::error( 'snippet_forbidden_api', sprintf( 'Handlers cannot use "%s". Change state and bind it to elements instead.', $api ), $index );
			}
		}

		return $errors;
	}

	private static function normalize_handler( array $handler ): array {
		return [
			'event' => $handler['event'],
			'description' => mb_substr( trim( $handler['description'] ), 0, self::MAX_DESCRIPTION_LENGTH ),
			'code' => trim( $handler['code'] ),
		];
	}

	private static function get_total_code_bytes( array $handlers ): int {
		return array_sum( array_map( fn( $handler ) => strlen( $handler['code'] ), $handlers ) );
	}

	private static function error( string $code, string $message, ?int $handler_index = null ): array {
		return array_filter( [
			'code' => $code,
			'message' => $message,
			'handler' => $handler_index,
		], fn( $value ) => null !== $value );
	}
}
