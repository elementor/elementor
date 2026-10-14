<?php

namespace Elementor\Modules\DefaultStyles\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Default_Style_Data_Normalizer {
	const CSS_NAME_PREFIX = 'e-default-';

	public static function normalize_style( string $tag, array $data ): array {
		return array_merge(
			[
				'id' => $tag,
				'label' => $tag,
				'cssName' => self::CSS_NAME_PREFIX . $tag,
			],
			self::normalize_style_fields( $data )
		);
	}

	public static function normalize_style_fields( array $item ): array {
		return [
			'type' => $item['type'] ?? 'class',
			'variants' => $item['variants'] ?? [],
		];
	}
}
