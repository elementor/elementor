<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Mcp\Abilities\List_Global_Classes_Ability;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_List_Global_Classes_Ability extends Elementor_Test_Base {

	public function test_execute__returns_403_for_subscriber() {
		// Arrange
		$user_id = $this->factory()->user->create( [ 'role' => 'subscriber' ] );
		wp_set_current_user( $user_id );
		$ability = new List_Global_Classes_Ability( $this->createMock( Global_Classes_Repository::class ) );

		// Act
		$result = $ability->execute( [] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__per_page_is_clamped_to_maximum() {
		// Arrange
		$this->act_as_admin();
		$ability = new List_Global_Classes_Ability( $this->mock_repository_with_labels( [] ) );

		// Act
		$result = $ability->execute( [ 'per_page' => 9999 ] );

		// Assert
		$this->assertSame( List_Global_Classes_Ability::MAX_PER_PAGE, $result['per_page'] );
	}

	public function test_execute__paginates_and_reports_total() {
		// Arrange
		$this->act_as_admin();
		$ability = new List_Global_Classes_Ability( $this->mock_repository_with_labels( [
			'g-1' => 'heading-xl',
			'g-2' => 'body-text',
			'g-3' => 'button-primary',
		] ) );

		// Act
		$first_page = $ability->execute( [ 'per_page' => 2, 'page' => 1 ] );
		$second_page = $ability->execute( [ 'per_page' => 2, 'page' => 2 ] );

		// Assert
		$this->assertSame( 3, $first_page['total'] );
		$this->assertCount( 2, $first_page['classes'] );
		$this->assertSame( 1, $first_page['page'] );
		$this->assertSame( 2, $second_page['page'] );
		$this->assertCount( 1, $second_page['classes'] );
		$this->assertSame(
			[ [ 'id' => 'g-1', 'label' => 'heading-xl' ], [ 'id' => 'g-2', 'label' => 'body-text' ] ],
			$first_page['classes']
		);
		$this->assertSame( [ [ 'id' => 'g-3', 'label' => 'button-primary' ] ], $second_page['classes'] );
	}

	public function test_execute__search_matches_label_substring() {
		// Arrange
		$this->act_as_admin();
		$ability = new List_Global_Classes_Ability( $this->mock_repository_with_labels( [
			'g-1' => 'heading-xl',
			'g-2' => 'body-text',
		] ) );

		// Act
		$result = $ability->execute( [ 'search' => 'HEADING' ] );

		// Assert
		$this->assertSame( 1, $result['total'] );
		$this->assertSame( 'heading-xl', $result['classes'][0]['label'] );
		$this->assertSame( 'g-1', $result['classes'][0]['id'] );
	}

	private function mock_repository_with_labels( array $labels ): Global_Classes_Repository {
		$repository = $this->createMock( Global_Classes_Repository::class );
		$repository->method( 'all_labels' )->willReturn( $labels );

		return $repository;
	}
}
