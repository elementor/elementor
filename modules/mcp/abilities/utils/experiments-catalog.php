<?php

namespace Elementor\Modules\Mcp\Abilities\Utils;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Experiments\Non_Existing_Dependency;
use Elementor\Modules\Mcp\Utils\Mcp_V4_Gate;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Experiments_Catalog {

	public static function find( string $name ): ?array {
		return Plugin::$instance->experiments->get_features( $name );
	}

	public static function is_toggleable( array $feature ): bool {
		if ( ! $feature['mutable'] || $feature[ Experiments_Manager::TYPE_HIDDEN ] ) {
			return false;
		}

		foreach ( $feature['dependencies'] ?? [] as $dependency ) {
			if ( $dependency instanceof Non_Existing_Dependency ) {
				return false;
			}
		}

		return true;
	}

	public static function get_toggleable(): array {
		$features = array_filter(
			Plugin::$instance->experiments->get_features(),
			[ self::class, 'is_toggleable' ]
		);

		return array_values( array_map( [ self::class, 'format' ], $features ) );
	}

	public static function format( array $feature ): array {
		$dependencies = array_map(
			fn( $dependency ) => $dependency->get_name(),
			$feature['dependencies'] ?? []
		);

		return [
			'name' => $feature['name'],
			'title' => wp_strip_all_tags( (string) ( $feature['title'] ?? $feature['name'] ) ),
			'description' => wp_strip_all_tags( (string) $feature['description'] ),
			'state' => $feature['state'],
			'active' => Plugin::$instance->experiments->is_feature_active( $feature['name'] ),
			'default_state' => $feature['default'],
			'release_status' => $feature['release_status'],
			'dependencies' => array_values( $dependencies ),
			'deprecated' => (bool) $feature['deprecated'],
			'deactivation_warning' => self::get_deactivation_warning( $feature ),
		];
	}

	public static function atomic_editor_status(): array {
		return [ 'active' => Mcp_V4_Gate::is_atomic_editor_active() ];
	}

	public static function experiment_schema(): array {
		return [
			'type' => 'object',
			'properties' => [
				'name' => [ 'type' => 'string' ],
				'title' => [ 'type' => 'string' ],
				'description' => [ 'type' => 'string' ],
				'state' => [
					'type' => 'string',
					'enum' => [
						Experiments_Manager::STATE_DEFAULT,
						Experiments_Manager::STATE_ACTIVE,
						Experiments_Manager::STATE_INACTIVE,
					],
					'description' => 'The saved choice. "default" means the experiment follows its default state.',
				],
				'active' => [
					'type' => 'boolean',
					'description' => 'Whether the experiment is effectively on right now.',
				],
				'default_state' => [ 'type' => 'string' ],
				'release_status' => [ 'type' => 'string' ],
				'dependencies' => [
					'type' => 'array',
					'items' => [ 'type' => 'string' ],
				],
				'deprecated' => [ 'type' => 'boolean' ],
				'deactivation_warning' => [ 'type' => [ 'string', 'null' ] ],
			],
		];
	}

	public static function atomic_editor_schema(): array {
		return [
			'type' => 'object',
			'properties' => [
				'active' => [
					'type' => 'boolean',
					'description' => 'Whether the Atomic Editor (V4) is on for this site.',
				],
			],
		];
	}

	private static function get_deactivation_warning( array $feature ): ?string {
		$warning = $feature['messages']['on_deactivate'] ?? '';

		return '' === $warning ? null : wp_strip_all_tags( (string) $warning );
	}
}
