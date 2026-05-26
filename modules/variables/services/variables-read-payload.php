<?php

namespace Elementor\Modules\Variables\Services;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Utils as ElementorUtils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Canonical read shape for the variables surface.
 *
 * Shared by `elementor/get-globals` (today) and the planned `elementor/list-variables`.
 * Mirrors `Global_Classes_Read_Payload::build()`; the ID-keyed bag is `items` on both
 * sides (the variables repository serializes it as `data` internally — renamed here).
 *
 * `supported_types` lists the publicly authorable variable types. `global-size-variable`
 * is Pro-gated to match `Variables_Service::load()` which strips size variables for
 * non-Pro installs; the internal `global-custom-size-variable` transformer key is
 * intentionally omitted (consumers never author against it).
 */
class Variables_Read_Payload {

	public static function build( Kit $kit ): array {
		$service = new Variables_Service(
			new Variables_Repository( $kit ),
			new Batch_Processor()
		);

		$payload = $service->load();
		$items = is_array( $payload['data'] ?? null ) ? $payload['data'] : [];

		return [
			'items' => $items,
			'total' => count( $items ),
			'watermark' => $payload['watermark'] ?? null,
			'supported_types' => self::supported_types(),
		];
	}

	private static function supported_types(): array {
		$types = [
			Color_Variable_Prop_Type::get_key(),
			Font_Variable_Prop_Type::get_key(),
		];

		if ( ElementorUtils::has_pro() ) {
			$types[] = Size_Variable_Prop_Type::get_key();
		}

		return $types;
	}
}
