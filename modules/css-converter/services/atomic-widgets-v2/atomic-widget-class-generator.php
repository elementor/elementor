<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgetsV2;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Widget_Class_Generator {

	private array $widget_prefixes = [
		'e-heading' => 'e',
		'e-paragraph' => 'e',
		'e-button' => 'e',
		'e-image' => 'e',
		'e-flexbox' => 'e',
	];

	public function generate_class_id( string $widget_type = '' ): string {
		$prefix = $this->get_widget_prefix( $widget_type );
		$hash1 = substr( md5( uniqid( '', true ) ), 0, 8 );
		$hash2 = substr( md5( microtime( true ) . mt_rand() ), 0, 7 );
		
		return "{$prefix}-{$hash1}-{$hash2}";
	}

	public function generate_multiple_class_ids( array $widget_types ): array {
		$class_ids = [];
		
		foreach ( $widget_types as $widget_type ) {
			$class_ids[] = $this->generate_class_id( $widget_type );
		}
		
		return $class_ids;
	}

	public function generate_unique_class_id( array $existing_ids, string $widget_type = '' ): string {
		$max_attempts = 100;
		$attempts = 0;
		
		do {
			$class_id = $this->generate_class_id( $widget_type );
			$attempts++;
		} while ( in_array( $class_id, $existing_ids, true ) && $attempts < $max_attempts );
		
		if ( $attempts >= $max_attempts ) {
			// Fallback with timestamp to ensure uniqueness
			$timestamp = time();
			$prefix = $this->get_widget_prefix( $widget_type );
			$class_id = "{$prefix}-{$timestamp}-" . substr( md5( uniqid( '', true ) ), 0, 8 );
		}
		
		return $class_id;
	}

	private function get_widget_prefix( string $widget_type ): string {
		return $this->widget_prefixes[ $widget_type ] ?? 'e';
	}

	public function is_valid_class_id( string $class_id ): bool {
		// Validate class ID format: prefix-hash1-hash2
		$pattern = '/^[a-z]+-[a-f0-9]{8}-[a-f0-9]{7}$/';
		return preg_match( $pattern, $class_id ) === 1;
	}

	public function extract_widget_type_from_class_id( string $class_id ): ?string {
		if ( ! $this->is_valid_class_id( $class_id ) ) {
			return null;
		}
		
		$prefix = substr( $class_id, 0, strpos( $class_id, '-' ) );
		
		// Find widget type by prefix
		foreach ( $this->widget_prefixes as $widget_type => $widget_prefix ) {
			if ( $widget_prefix === $prefix ) {
				return $widget_type;
			}
		}
		
		return null;
	}

	public function get_supported_widget_types(): array {
		return array_keys( $this->widget_prefixes );
	}

	public function add_widget_type_prefix( string $widget_type, string $prefix ): void {
		$this->widget_prefixes[ $widget_type ] = $prefix;
	}

	public function get_widget_prefix_mapping(): array {
		return $this->widget_prefixes;
	}

	public function generate_class_id_batch( int $count, string $widget_type = '' ): array {
		$class_ids = [];
		
		for ( $i = 0; $i < $count; $i++ ) {
			$class_ids[] = $this->generate_class_id( $widget_type );
		}
		
		return $class_ids;
	}

	public function ensure_unique_class_ids( array $class_ids ): array {
		$unique_ids = [];
		$seen_ids = [];
		
		foreach ( $class_ids as $class_id ) {
			if ( ! in_array( $class_id, $seen_ids, true ) ) {
				$unique_ids[] = $class_id;
				$seen_ids[] = $class_id;
			} else {
				// Generate new unique ID
				$widget_type = $this->extract_widget_type_from_class_id( $class_id );
				$new_id = $this->generate_unique_class_id( $seen_ids, $widget_type );
				$unique_ids[] = $new_id;
				$seen_ids[] = $new_id;
			}
		}
		
		return $unique_ids;
	}
}
