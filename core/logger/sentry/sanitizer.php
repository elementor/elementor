<?php
namespace Elementor\Core\Logger\Sentry;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Sanitizer {

	const MAX_VALUE_LENGTH = 500;

	const GENERIC_VALUE = 'Unknown error';

	public function sanitize_message( $message ) {
		if ( ! is_string( $message ) || '' === $message ) {
			return self::GENERIC_VALUE;
		}

		$message = $this->remove_stack_trace_suffix( $message );
		$message = wp_strip_all_tags( $message );
		$message = preg_replace( '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $message );

		if ( null === $message ) {
			return self::GENERIC_VALUE;
		}

		$message = $this->redact_paths( $message );
		$message = $this->redact_urls( $message );
		$message = $this->redact_emails( $message );
		$message = trim( $message );

		if ( '' === $message ) {
			return self::GENERIC_VALUE;
		}

		if ( strlen( $message ) > self::MAX_VALUE_LENGTH ) {
			$message = substr( $message, 0, self::MAX_VALUE_LENGTH );
		}

		return $message;
	}

	public function get_relative_elementor_path( $file ) {
		$file = wp_normalize_path( $file );

		/**
		 * Elementor related paths.
		 *
		 * @param string[] $available_paths
		 */
		$available_paths = apply_filters( 'elementor/utils/elementor_related_paths', [ ELEMENTOR_PATH ] );

		foreach ( $available_paths as $path ) {
			$normalized_path = untrailingslashit( wp_normalize_path( $path ) );

			if ( 0 === strpos( $file, $normalized_path ) ) {
				return ltrim( substr( $file, strlen( $normalized_path ) ), '/' );
			}
		}

		return wp_basename( $file );
	}

	private function remove_stack_trace_suffix( $message ) {
		$message = preg_replace( '/\nStack trace:.*/s', '', $message );
		$message = preg_replace( '#\s+in\s+(?:[^\s]+[/\\\\])[^\s]*(?:\s+on line \d+|:\d+)#', '', $message );

		return $message;
	}

	private function redact_paths( $message ) {
		$paths = apply_filters( 'elementor/utils/elementor_related_paths', [ ELEMENTOR_PATH ] );
		$paths[] = defined( 'ABSPATH' ) ? ABSPATH : '';

		foreach ( array_filter( $paths ) as $path ) {
			$message = str_replace(
				[
					trailingslashit( $path ),
					trailingslashit( wp_normalize_path( $path ) ),
				],
				'[redacted-path]/',
				$message
			);
		}

		$message = preg_replace( '#(?<![A-Za-z0-9])/(?:[^\s/]+/)+[^\s/:]*#', '[redacted-path]', $message );
		$message = preg_replace( '#\b[A-Za-z]:\\\\(?:[^\s\\\\]+\\\\)+[^\s\\\\:]*#', '[redacted-path]', $message );

		return $message;
	}

	private function redact_urls( $message ) {
		return preg_replace( '#https?://[^\s<>"\'()]+#i', '[redacted-url]', $message );
	}

	private function redact_emails( $message ) {
		return preg_replace( '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', '[redacted-email]', $message );
	}
}
