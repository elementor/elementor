<?php

namespace Elementor\Modules\GlobalClasses\Services;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\AtomicWidgets\Styles\Style_States;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Canonical read shape for the global-classes surface.
 *
 * Shared by `elementor/get-globals` (today) and the planned `elementor/list-global-classes`.
 * Mirrors `Variables_Read_Payload::build()`; keep both shapes aligned so consumers can
 * treat the two sub-objects of `get-globals` symmetrically.
 *
 * `watermark` is always `null` for now — `Global_Classes_Repository` has no per-collection
 * counter (versioning happens via the kit-meta save path). The field is present so the
 * shape matches the variables side; tighten to int when the repository grows a counter.
 */
class Global_Classes_Read_Payload {

	public static function build( Kit $kit ): array {
		$payload = Global_Classes_Repository::make( $kit )->all()->get();

		$items = is_array( $payload['items'] ?? null ) ? $payload['items'] : [];
		$order = is_array( $payload['order'] ?? null ) ? $payload['order'] : [];

		return [
			'items' => $items,
			'order' => $order,
			'total' => count( $items ),
			'watermark' => null,
			'supported_breakpoints' => self::supported_breakpoints(),
			'supported_states' => Style_States::get_valid_states(),
		];
	}

	private static function supported_breakpoints(): array {
		$breakpoints = Plugin::$instance->breakpoints ?? null;

		if ( ! $breakpoints ) {
			return [ 'desktop' ];
		}

		return $breakpoints->get_active_devices_list( [ 'add_desktop' => true ] );
	}
}
