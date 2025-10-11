<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgetsV2;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Error_Handler {

	private array $errors = [];
	private array $warnings = [];
	private bool $debug_mode = false;

	public function __construct( bool $debug_mode = false ) {
		$this->debug_mode = $debug_mode;
	}

	public function add_error( string $message, string $context = '', array $data = [] ): void {
		$error = [
			'message' => $message,
			'context' => $context,
			'data' => $data,
			'timestamp' => microtime( true ),
			'trace' => $this->debug_mode ? debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 5 ) : null,
		];

		$this->errors[] = $error;

		if ( $this->debug_mode ) {
			error_log( "Atomic Widgets Error [{$context}]: {$message}" );
		}
	}

	public function add_warning( string $message, string $context = '', array $data = [] ): void {
		$warning = [
			'message' => $message,
			'context' => $context,
			'data' => $data,
			'timestamp' => microtime( true ),
		];

		$this->warnings[] = $warning;

		if ( $this->debug_mode ) {
			error_log( "Atomic Widgets Warning [{$context}]: {$message}" );
		}
	}

	public function has_errors(): bool {
		return ! empty( $this->errors );
	}

	public function has_warnings(): bool {
		return ! empty( $this->warnings );
	}

	public function get_errors(): array {
		return $this->errors;
	}

	public function get_warnings(): array {
		return $this->warnings;
	}

	public function get_error_count(): int {
		return count( $this->errors );
	}

	public function get_warning_count(): int {
		return count( $this->warnings );
	}

	public function get_last_error(): ?array {
		return end( $this->errors ) ?: null;
	}

	public function get_last_warning(): ?array {
		return end( $this->warnings ) ?: null;
	}

	public function clear_errors(): void {
		$this->errors = [];
	}

	public function clear_warnings(): void {
		$this->warnings = [];
	}

	public function clear_all(): void {
		$this->clear_errors();
		$this->clear_warnings();
	}

	public function get_error_summary(): array {
		$contexts = [];
		foreach ( $this->errors as $error ) {
			$context = $error['context'] ?: 'general';
			$contexts[ $context ] = ( $contexts[ $context ] ?? 0 ) + 1;
		}

		return [
			'total_errors' => count( $this->errors ),
			'total_warnings' => count( $this->warnings ),
			'error_contexts' => $contexts,
			'has_critical_errors' => $this->has_critical_errors(),
		];
	}

	public function has_critical_errors(): bool {
		foreach ( $this->errors as $error ) {
			if ( $this->is_critical_error( $error ) ) {
				return true;
			}
		}
		return false;
	}

	private function is_critical_error( array $error ): bool {
		$critical_contexts = [
			'atomic_widgets_unavailable',
			'widget_creation_failed',
			'html_parsing_failed',
		];

		return in_array( $error['context'], $critical_contexts, true );
	}

	public function format_errors_for_response(): array {
		$formatted_errors = [];

		foreach ( $this->errors as $error ) {
			$formatted_errors[] = [
				'type' => 'error',
				'message' => $error['message'],
				'context' => $error['context'],
			];
		}

		foreach ( $this->warnings as $warning ) {
			$formatted_errors[] = [
				'type' => 'warning',
				'message' => $warning['message'],
				'context' => $warning['context'],
			];
		}

		return $formatted_errors;
	}

	public function log_conversion_attempt( string $html, array $options = [] ): void {
		if ( ! $this->debug_mode ) {
			return;
		}

		$log_data = [
			'html_length' => strlen( $html ),
			'html_preview' => substr( strip_tags( $html ), 0, 100 ) . '...',
			'options' => $options,
			'timestamp' => date( 'Y-m-d H:i:s' ),
		];

		error_log( 'Atomic Widgets Conversion Attempt: ' . wp_json_encode( $log_data ) );
	}

	public function log_conversion_result( array $result ): void {
		if ( ! $this->debug_mode ) {
			return;
		}

		$log_data = [
			'success' => $result['success'] ?? false,
			'widgets_created' => count( $result['widgets'] ?? [] ),
			'error_count' => $this->get_error_count(),
			'warning_count' => $this->get_warning_count(),
			'timestamp' => date( 'Y-m-d H:i:s' ),
		];

		if ( ! empty( $result['stats'] ) ) {
			$log_data['stats'] = $result['stats'];
		}

		error_log( 'Atomic Widgets Conversion Result: ' . wp_json_encode( $log_data ) );
	}

	public function create_error_response( string $primary_error = '' ): array {
		$error_message = $primary_error ?: 'Conversion failed';
		
		if ( $this->has_errors() ) {
			$last_error = $this->get_last_error();
			$error_message = $last_error['message'] ?? $error_message;
		}

		return [
			'success' => false,
			'error' => $error_message,
			'widgets' => [],
			'errors' => $this->format_errors_for_response(),
			'error_summary' => $this->get_error_summary(),
		];
	}

	public function enable_debug_mode(): void {
		$this->debug_mode = true;
	}

	public function disable_debug_mode(): void {
		$this->debug_mode = false;
	}

	public function is_debug_mode(): bool {
		return $this->debug_mode;
	}
}

