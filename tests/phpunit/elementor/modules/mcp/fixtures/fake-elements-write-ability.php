<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Fixtures;

use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Abilities\Ability_Definition;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Mutation_Save;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Fake_Elements_Write_Ability extends Abstract_Ability {

	const ID = 'elementor/test-fake-elements-write';

	protected function get_ability_id(): string {
		return self::ID;
	}

	protected function get_definition(): Ability_Definition {
		return new Ability_Definition(
			'Fake elements write',
			'Saves the given elements through the MCP staged save path.',
			'elementor',
			[ 'type' => 'object' ],
			[
				'annotations' => [
					'readonly' => false,
					'idempotent' => false,
					'destructive' => true,
				],
			],
			fn() => true
		);
	}

	public function get_snapshot_post_id( array $input ): int {
		return (int) ( $input['post_id'] ?? 0 );
	}

	public function execute( $input = [] ) {
		if ( ! empty( $input['throw'] ) ) {
			throw new \RuntimeException( 'Simulated failure.' );
		}

		if ( empty( $input['elements'] ) ) {
			return [
				'status' => 'error',
				'post_id' => (int) $input['post_id'],
			];
		}

		$document = Plugin::$instance->documents->get( (int) $input['post_id'] );

		Document_Mutation_Save::elements_preserving_live_status( Document_Mutator::instance(), $document, $input['elements'] );

		return [
			'status' => 'success',
			'post_id' => (int) $input['post_id'],
		];
	}
}
