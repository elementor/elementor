<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Fixtures;

use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\Mcp\Abilities\Abstract_Ability;
use Elementor\Modules\Mcp\Abilities\Ability_Definition;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Mutation_Save;
use Elementor\Modules\Mcp\Abilities\Utils\Document_Revision_Snapshots;
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

	public function execute( $input = [] ) {
		$document = Plugin::$instance->documents->get( (int) $input['post_id'] );

		$recording = Document_Revision_Snapshots::record(
			$document,
			$this->get_id(),
			function () use ( $document, $input ) {
				if ( ! empty( $input['throw'] ) ) {
					throw new \RuntimeException( 'Simulated failure.' );
				}

				return Document_Mutation_Save::elements_preserving_live_status( Document_Mutator::instance(), $document, $input['elements'] );
			}
		);

		return $recording->add_to_response( [
			'status' => 'success',
			'post_id' => (int) $input['post_id'],
		] );
	}
}
