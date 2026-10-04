<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Setting_Schemas {

	const KIND_LINK = 'link';
	const KIND_ENUM_FROM_CONTROL = 'enum_from_control';
	const KIND_SWITCHER = 'switcher';
	const KIND_ICONS = 'icons';

	const CONTROL_TYPES_BY_KIND = [
		self::KIND_LINK => [ 'url' ],
		self::KIND_ENUM_FROM_CONTROL => [ 'select', 'select2', 'choose' ],
		self::KIND_SWITCHER => [ 'switcher' ],
		self::KIND_ICONS => [ 'icons' ],
	];

	const SWITCHER_DEFAULT_RETURN_VALUE = 'yes';

	/**
	 * A string whose enum is the registered control's option keys, resolved at compile time.
	 */
	public static function enum_from_control( ?string $key = null ): array {
		return self::with_key(
			[
				'type' => 'string',
				'kind' => self::KIND_ENUM_FROM_CONTROL,
			],
			$key
		);
	}

	/**
	 * A boolean stored as the switcher's `return_value` (resolved at compile time) or ''.
	 */
	public static function switcher( ?string $key = null ): array {
		return self::with_key(
			[
				'type' => 'boolean',
				'kind' => self::KIND_SWITCHER,
			],
			$key
		);
	}

	public static function icons( ?string $key = null ): array {
		return self::with_key(
			[
				'type' => 'object',
				'kind' => self::KIND_ICONS,
				'properties' => [
					'value' => [ 'type' => 'string' ],
					'library' => [ 'type' => 'string' ],
				],
			],
			$key
		);
	}

	private static function with_key( array $schema, ?string $key ): array {
		if ( null !== $key ) {
			$schema['key'] = $key;
		}

		return $schema;
	}

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
