<?php

namespace Elementor\App\Modules\ImportExportCustomization;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shared import context for design-system entities (global classes, global variables).
 * Resolves the import flow ('settings' vs 'design-system') and its conflict resolution strategy.
 */
class Design_System_Import_Context {
	/**
	 * Either 'settings', 'design-system' or null.
	 *
	 * @var string|null
	 */
	private ?string $include_key;

	private function __construct( ?string $include_key ) {
		$this->include_key = $include_key;
	}

	public static function from_data( array $data ): self {
		$include = $data['include'] ?? [];

		if ( in_array( 'settings', $include, true ) ) {
			return new self( 'settings' );
		}

		if ( in_array( 'design-system', $include, true ) ) {
			return new self( 'design-system' );
		}

		return new self( null );
	}

	public function is_included(): bool {
		return null !== $this->include_key;
	}

	public function is_settings(): bool {
		return 'settings' === $this->include_key;
	}

	public function is_design_system(): bool {
		return 'design-system' === $this->include_key;
	}

	public function resolve_conflict_resolution( array $data, string $override_all_key ): string {
		if ( $this->is_settings() ) {
			return ! empty( $data['customization']['settings'][ $override_all_key ] )
				? 'override-all'
				: 'merge';
		}

		if ( $this->is_design_system() ) {
			return $data['customization']['design-system']['conflict_resolution'] ?? 'skip';
		}

		throw new \Exception( 'Cannot resolve conflict resolution without a valid include include_key.' );
	}
}
