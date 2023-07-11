<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Admin;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Experiments\Wrap_Core_Dependency;
use Elementor\Plugin;
use Elementor\Core\Admin\Admin;
use Elementor\Core\Base\Document;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Admin extends Elementor_Test_Base {
	/**
	 * @var string
	 */
	private $pagenow;

	public function setUp() {
		global $pagenow;

		parent::setUp();

		$this->pagenow = $pagenow;
	}

	public function tearDown() {
		global $pagenow;

		parent::tearDown();

		$pagenow = $this->pagenow;
	}

	public function test_save_post() {
		// Arrange
		$admin = new Admin();
		$post = $this->factory()->create_and_get_custom_post( [] );
		$_POST['_elementor_edit_mode_nonce'] = wp_create_nonce( 'admin.php' );
		$_POST['_elementor_post_mode'] = 1;

		// Act
		$admin->save_post( $post->ID );

		// Assert
		$this->assertEquals( 'builder', get_post_meta( $post->ID, Document::BUILT_WITH_ELEMENTOR_META_KEY, true ) );
	}

	public function test_save_post__when_saved_outside_of_elementor_it_will_not_change() {
		// Arrange
		$admin = new Admin();
		$post = $this->factory()->create_and_get_custom_post( [] );

		// Act
		$admin->save_post( $post->ID );

		// Assert
		$this->assertEmpty( get_post_meta( $post->ID, Document::BUILT_WITH_ELEMENTOR_META_KEY, true ) );
	}

	public function test_add_elementor_post_state() {
		// Arrange
		$this->act_as_admin();

		$admin = new Admin();
		$document = $this->factory()->documents->create_and_get();

		// Act
		$result = $admin->add_elementor_post_state( [], $document->get_post() );

		// Assert
		$this->assertArrayHasKey( 'elementor', $result );
	}

	public function test_add_elementor_post_state__should_no_add_elementor() {
		// Arrange
		$this->act_as_admin();

		$admin = new Admin();
		$post = $this->factory()->post->create_and_get();

		// Act
		$result = $admin->add_elementor_post_state( [], $post );

		// Assert
		$this->assertArrayNotHasKey( 'elementor', $result );
	}

	public function test_add_elementor_post_state__should_not_add_elementor_without_permissions() {
		// Arrange
		$this->act_as_subscriber();

		$admin = new Admin();
		$document = $this->factory()->documents->create_and_get();

		// Act
		$result = $admin->add_elementor_post_state( [], $document->get_post() );

		// Assert
		$this->assertArrayNotHasKey( 'elementor', $result );
	}

	public function test_body_statues_classes() {
		// Arrange
		global $pagenow;
		$pagenow = 'post.php';

		new Admin();
		$post = $this->factory()->post->create_and_get();

		Plugin::$instance->db->switch_to_post( $post->ID );

		// Act
		$result = apply_filters( 'admin_body_class', '' );

		// Assert
		$this->assertRegExp( '/elementor-editor-inactive/', $result );
	}

	public function test_body_statues_classes__when_edit_with_elementor() {
		// Arrange
		global $pagenow;
		$pagenow = 'post.php';

		new Admin();
		$document = $this->factory()->documents->create_and_get();

		Plugin::$instance->db->switch_to_post( $document->get_id() );

		// Act
		$result = apply_filters( 'admin_body_class', '' );

		// Assert
		$this->assertRegExp( '/elementor-editor-active/', $result );
	}

	public function test_get_init_settings__returns_experiments_config() {
		// Arrange.
		$admin = new Admin();

		$original_experiments = Plugin::$instance->experiments;

		$mock_experiments = $this
			->getMockBuilder( Experiments_Manager::class )
			->setMethods( [ 'get_features' ] )
			->getMock();

		$experiment1 = [
			'name' => 'experiment-1',
			'default' => Experiments_Manager::STATE_ACTIVE,
			'title' => 'Experiment 1',
			'state' => Experiments_Manager::STATE_ACTIVE,
			'other-prop' => 'some-value',
			'messages' => [
				'on_deactivate' => 'test-message',
			],
		];

		$experiment2 = [
			'name' => 'experiment-2',
			'default' => Experiments_Manager::STATE_INACTIVE,
			'title' => 'Experiment 2',
			'state' => Experiments_Manager::STATE_ACTIVE,
			'other-prop-2' => 'some-value-2',
			'dependencies' => [
				new Wrap_Core_Dependency( $experiment1 ),
			],
		];

		$mock_experiments->method( 'get_features' )->willReturn( [ $experiment1, $experiment2 ] );

		Plugin::$instance->experiments = $mock_experiments;

		// Act.
		$settings = $admin->get_settings();

		// Assert.
		$this->assertEqualSets( [
			[
				'name' => 'experiment-1',
				'default' => Experiments_Manager::STATE_ACTIVE,
				'title' => 'Experiment 1',
				'state' => Experiments_Manager::STATE_ACTIVE,
				'dependencies' => [],
				'messages' => [
					'on_deactivate' => 'test-message',
				],

			],
			[
				'name' => 'experiment-2',
				'default' => Experiments_Manager::STATE_INACTIVE,
				'title' => 'Experiment 2',
				'state' => Experiments_Manager::STATE_ACTIVE,
				'dependencies' => [
					'experiment-1',
				],
				'messages' => [],
			],
		], $settings['experiments'] );

		// Cleanup.
		Plugin::$instance->experiments = $original_experiments;
	}
}
