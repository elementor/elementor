<?php

namespace Elementor\Modules\GlobalClasses\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Class_Data_Normalizer {
	public static function normalize_style_fields( array $item ): array {
		$data = [
			'type' => $item['type'] ?? 'class',
			'variants' => $item['variants'] ?? [],
		];

		if ( array_key_exists( 'sync_to_v3', $item ) ) {
			$data['sync_to_v3'] = (bool) $item['sync_to_v3'];
		}

		return $data;
	}

	public static function normalize_style( string $class_id, array $class_data ): array {
		return array_merge(
			[
				'id' => $class_id,
				'label' => $class_data['label'] ?? $class_id,
			],
			self::normalize_style_fields( $class_data )
		);
	}
}
