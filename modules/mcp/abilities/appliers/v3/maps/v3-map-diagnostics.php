<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class V3_Map_Diagnostics {

	const MAP_ENTRY = 'map';

	/**
	 * @var array<int, array{widget_type: string, entry: string, reason: string, detail: string}>
	 */
	private array $entries = [];

	public function add( string $widget_type, string $entry, string $reason, string $detail = '' ): void {
		$this->entries[] = [
			'widget_type' => $widget_type,
			'entry' => $entry,
			'reason' => $reason,
			'detail' => $detail,
		];
	}

	/**
	 * @return array<int, array{widget_type: string, entry: string, reason: string, detail: string}>
	 */
	public function for_widget( string $widget_type ): array {
		return array_values( array_filter(
			$this->entries,
			fn( array $entry ) => $widget_type === $entry['widget_type']
		) );
	}

	/**
	 * @return array<int, array{widget_type: string, entry: string, reason: string, detail: string}>
	 */
	public function all(): array {
		return $this->entries;
	}

	public function is_empty(): bool {
		return empty( $this->entries );
	}
}
