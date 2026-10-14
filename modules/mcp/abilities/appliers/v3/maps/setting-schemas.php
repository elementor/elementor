<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Setting_Schemas {

	const KIND_LINK = 'link';

	public static function link(): array {
		return [
			'type' => 'object',
			'kind' => self::KIND_LINK,
			'properties' => [
				'url' => [ 'type' => 'string' ],
				'is_external' => [
					'type' => 'boolean',
					'convert' => [
						'true' => 'on',
						'false' => '',
					],
				],
				'nofollow' => [
					'type' => 'boolean',
					'convert' => [
						'true' => 'on',
						'false' => '',
					],
				],
			],
		];
	}

	public static function string( bool $dynamic = false ): array {
		$schema = [ 'type' => 'string' ];

		if ( $dynamic ) {
			$schema['dynamic'] = true;
		}

		return $schema;
	}

	public static function enum( array $values, ?string $default_value = null, ?string $key = null ): array {
		$schema = [
			'type' => 'string',
			'enum' => $values,
		];

		if ( null !== $default_value ) {
			$schema['default'] = $default_value;
		}

		if ( null !== $key ) {
			$schema['key'] = $key;
		}

		return $schema;
	}
}
