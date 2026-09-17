<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Mcp\Abilities\Global_Classes_Resource_Ability;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Global_Classes_Resource_Ability extends TestCase {

	public function test_execute__returns_ordered_classes_with_priority_description() {
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( [
			'g-heading' => 'Heading',
			'g-accent' => 'Accent',
		] );

		$result = ( new Global_Classes_Resource_Ability( $repository ) )->execute();
		$payload = json_decode( $result, true );

		$this->assertSame(
			'Classes are ordered from highest to lowest priority. When classes on the same element set the same CSS property, the earlier class overrides the later one.',
			$payload['priority_description']
		);
		$this->assertSame( [
			[ 'id' => 'g-heading', 'label' => 'Heading' ],
			[ 'id' => 'g-accent', 'label' => 'Accent' ],
		], $payload['classes'] );
	}
}
