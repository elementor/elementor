<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Experiments;

use Elementor\Core\Experiments\Exceptions\Dependency_Exception;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Experiments\Non_Existing_Dependency;
use Elementor\Core\Experiments\Wrap_Core_Dependency;
use Elementor\Core\Upgrade\Manager;
use Elementor\Tests\Phpunit\Elementor\Core\Experiments\Mock\Modules\Module_A;
use Elementor\Tests\Phpunit\Elementor\Core\Experiments\Mock\Modules\Module_B;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Test_Manager extends Elementor_Test_Base {
	/**
	 * @var \Elementor\Core\Experiments\Manager
	 */
	private $experiments;

	public function setUp() {
		parent::setUp();

		$this->experiments = new Experiments_Manager();
	}

	public function test_add_feature() {
		$test_feature_data = [
			'default' => Experiments_Manager::STATE_ACTIVE,
			'unaccepted_key' => 'some value',
		];

		$test_set = [
			'tag' => '',
			'description' => '',
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
			'default' => Experiments_Manager::STATE_ACTIVE,
			'name' => 'test_feature',
			'state' => Experiments_Manager::STATE_DEFAULT,
			'on_state_change' => null,
			'new_site' => [
				'default_active' => false,
				'always_active' => false,
				'minimum_installation_version' => null,
			],
			'mutable' => true,
			'hidden' => false,
			'generator_tag' => false,
			'tags' => [],
		];

		$new_feature = $this->add_test_feature( $test_feature_data );

		$re_added_feature = $this->add_test_feature( $test_feature_data );

		$this->assertEquals( $test_set, $new_feature );
		$this->assertEquals( null, $re_added_feature );
	}

	/**
	 * @dataProvider get_tags_data_provider
	 */
	public function test_add_feature__with_tags( $name, $data, $expected ) {
		// Act.
		$new_feature = $this->add_test_feature( [
			'name' => $name,
			'tag' => $data['tag'] ?? '',
			'tags' => $data['tags'] ?? [],
		] );

		// Assert.
		$this->assertEquals( $expected['tag'], $new_feature['tag'] );
		$this->assertEquals( $expected['tags'], $new_feature['tags'] );
	}

	public function get_tags_data_provider() {
		return [
			'New feature passing one tag to "tag" as a string' => [
				'name' => 'test_feature_with_tags1',
				'data' => [
					'tag' => 'First tag',
				],
				'expected' => [
					'tag' => [
						[
							'type' => 'default',
							'label' => 'First tag',
						]
					],
					'tags' => [
						[
							'type' => 'default',
							'label' => 'First tag',
						]
					],
				]
			],
			'New feature passing two tags to "tag" as a comma separated string' => [
				'name' => 'test_feature_with_tags2',
				'data' => [
					'tag' => 'First tag, Second tag',
				],
				'expected' => [
					'tag' => [
						[
							'type' => 'default',
							'label' => 'First tag',
						],
						[
							'type' => 'default',
							'label' => 'Second tag',
						],
					],
					'tags' => [
						[
							'type' => 'default',
							'label' => 'First tag',
						],
						[
							'type' => 'default',
							'label' => 'Second tag',
						],
					],
				]
			],
			'New feature passing two tags to "tag" as a comma separated string with a trailing comma' => [
				'name' => 'test_feature_with_tags3',
				'data' => [
					'tag' => 'First tag, Second tag,',
				],
				'expected' => [
					'tag' => [
						[
							'type' => 'default',
							'label' => 'First tag',
						],
						[
							'type' => 'default',
							'label' => 'Second tag',
						],
					],
					'tags' => [
						[
							'type' => 'default',
							'label' => 'First tag',
						],
						[
							'type' => 'default',
							'label' => 'Second tag',
						],
					],
				]
			],
			'New feature passing two tags to "tag" as an incorrectly structured array' => [
				'name' => 'test_feature_with_tags4',
				'data' => [
					'tag' => [
						'First tag',
						'Second tag',
					],
				],
				'expected' => [
					'tag' => [],
					'tags' => [],
				]
			],
			'New feature passing two tags to "tags" as an incorrectly structured array' => [
				'name' => 'test_feature_with_tags5',
				'data' => [
					'tags' => [
						'First tag',
						'Second tag',
					],
				],
				'expected' => [
					'tag' => '',
					'tags' => [],
				]
			],
			'New feature passing two tags to "tags" as a correctly structured array' => [
				'name' => 'test_feature_with_tags6',
				'data' => [
					'tags' => [
						[
							'type' => 'default',
							'label' => 'First tag',
						],
						[
							'type' => 'secondary',
							'label' => 'Second tag',
						],
					],
				],
				'expected' => [
					'tag' => '',
					'tags' => [
						[
							'type' => 'default',
							'label' => 'First tag',
						],
						[
							'type' => 'secondary',
							'label' => 'Second tag',
						],
					],
				]
			],
			'New feature passing tags to both "tag" and "tags"' => [
				'name' => 'test_feature_with_tags7',
				'data' => [
					'tag' => 'First tag',
					'tags' => [
						[
							'type' => 'default',
							'label' => 'Second tag',
						],
						[
							'type' => 'secondary',
							'label' => 'Third tag',
						],
					],
				],
				'expected' => [
					'tag' => [
						[
							'type' => 'default',
							'label' => 'First tag',
						],
					],
					'tags' => [
						[
							'type' => 'default',
							'label' => 'First tag',
						],
						[
							'type' => 'default',
							'label' => 'Second tag',
						],
						[
							'type' => 'secondary',
							'label' => 'Third tag',
						],
					],
				]
			],
		];
	}

	public function test_add_feature__ensure_wrap_core_dependency() {
		// Arrange.
		$test_core_feature = [
			'name' => 'core_feature',
			'state' => Experiments_Manager::STATE_INACTIVE,
		];

		$depended_feature = [
			'name' => 'depended_feature',
			'state' => Experiments_Manager::STATE_INACTIVE,
			'dependencies' => [
				'core_feature',
			],
		];

		$this->add_test_feature( $test_core_feature );

		// Act.
		$depended_feature = $this->add_test_feature( $depended_feature );

		$depended_feature_dependency = $depended_feature['dependencies'][0];

		// Assert.
		$this->assertTrue( $depended_feature_dependency instanceof Wrap_Core_Dependency );
		$this->assertEquals( 'core_feature', $depended_feature_dependency->get_name() );
	}

	public function test_add_feature__adding_non_existing_dependency() {
		// Arrange.
		$test_feature_data = [
			'name' => 'test_feature',
			'state' => Experiments_Manager::STATE_INACTIVE,
			'dependencies' => [
				'feature-that-not-exists',
			],
		];

		// Act.
		$this->add_test_feature( $test_feature_data );

		// Assert.
		$feature = $this->experiments->get_features( 'test_feature' );

		$this->assertCount( 1, $feature['dependencies'] );
		$this->assertInstanceOf( Non_Existing_Dependency::class, $feature['dependencies'][0] );
		$this->assertEquals( 'feature-that-not-exists', $feature['dependencies'][0]->get_name() );
	}

	public function test_feature_can_be_added_as_hidden() {
		// Act
		$args = [ 'hidden' => true ];
		$this->add_test_feature( $args );

		// Assert
		$feature = $this->experiments->get_features( 'test_feature' );
		$this->assertNotEmpty( $feature );
		$this->assertTrue( $feature['hidden'] );
	}

	public function test_add_feature__throws_when_a_feature_has_a_hidden_dependency() {
		// Arrange.
		$this->add_test_feature( [
			'name' => 'regular-dependency',
			'state' => Experiments_Manager::STATE_ACTIVE,
		] );

		$this->add_test_feature( [
			'name' => 'hidden-dependency',
			'state' => Experiments_Manager::STATE_ACTIVE,
			'hidden' => true,
		] );

		// Expect.
		$this->expectException( Dependency_Exception::class );
		$this->expectExceptionMessage( 'Depending on a hidden experiment is not allowed.' );

		// Act.
		$this->add_test_feature( [
			'name' => 'dependant',
			'state' => Experiments_Manager::STATE_ACTIVE,
			'dependencies' => [
				'regular-dependency',
				'hidden-dependency',
			],
		] );
	}

	public function test_get_features() {
		$experiments = $this->experiments;

		// Assert that `get_features` is called correctly even before adding any feature
		$experiments->get_features();

		$this->add_test_feature();

		$features = $experiments->get_features();

		$test_feature = $experiments->get_features( 'test_feature' );

		$this->assert_array_have_keys( [ 'test_feature' ], $features );

		$this->assertNotEmpty( $test_feature );
	}

	public function test_get_active_features() {
		$this->add_test_feature();

		$experiments = $this->experiments;

		$experiments->set_feature_default_state( 'test_feature', Experiments_Manager::STATE_DEFAULT );

		$default_activated_test_feature_data = [
			'name' => 'default_activated_test_feature',
			'default' => Experiments_Manager::STATE_ACTIVE,
		];

		$this->add_test_feature( $default_activated_test_feature_data );

		$active_features = $this->experiments->get_active_features();

		$this->assertArrayHasKey( 'default_activated_test_feature', $active_features );
	}

	public function test_is_feature_active() {
		$this->add_test_feature();

		$is_test_feature_active = $this->experiments->is_feature_active( 'test_feature' );

		$this->assertTrue( $is_test_feature_active );
	}

	public function test_is_feature_active__new_site() {
		update_option( Manager::INSTALLS_HISTORY_META, [
			time() => '3.1.0',
		] );

		$this->add_test_feature( [
			'default' => Experiments_Manager::STATE_INACTIVE,
			'new_site' => [
				'default_active' => true,
				'minimum_installation_version' => '3.1.0',
			],
		] );

		$experiments = $this->experiments;

		$is_test_feature_active = $experiments->is_feature_active( 'test_feature' );

		$this->assertTrue( $is_test_feature_active );
	}

	public function test_is_feature_active__immutable() {
		update_option( Manager::INSTALLS_HISTORY_META, [
			time() => '3.1.0',
		] );

		$this->add_test_feature( [
			'default' => Experiments_Manager::STATE_INACTIVE,
			'new_site' => [
				'always_active' => true,
				'minimum_installation_version' => '3.1.0',
			],
		] );

		$experiments = $this->experiments;

		$is_test_feature_active = $experiments->is_feature_active( 'test_feature' );

		$test_feature = $experiments->get_features( 'test_feature' );

		$this->assertTrue( $is_test_feature_active );

		$this->assertFalse( $test_feature['mutable'] );
	}

	public function test_is_feature_active__default_activated() {
		$experiments = $this->experiments;

		$default_activated_test_feature_data = [
			'default' => Experiments_Manager::STATE_ACTIVE,
		];

		$this->add_test_feature( $default_activated_test_feature_data );

		$is_default_activated_test_feature_active = $experiments->is_feature_active( 'test_feature' );

		$this->assertTrue( $is_default_activated_test_feature_active );
	}

	public function test_is_feature_active__not_exists() {
		$experiments = $this->experiments;

		$is_non_exist_active = $experiments->is_feature_active( 'not_exists_feature' );

		$this->assertFalse( $is_non_exist_active );
	}

	public function test_is_feature_active__saved_state() {
		add_option( 'elementor_experiment-test_feature', Experiments_Manager::STATE_ACTIVE );

		$this->add_test_feature();

		$experiments = $this->experiments;

		$is_test_feature_active = $experiments->is_feature_active( 'test_feature' );

		$this->assertTrue( $is_test_feature_active );
	}

	public function test_set_feature_default_state() {
		$this->add_test_feature();

		$experiments = $this->experiments;

		$experiments->set_feature_default_state( 'test_feature', Experiments_Manager::STATE_ACTIVE );

		$feature = $experiments->get_features( 'test_feature' );

		$this->assertEquals( Experiments_Manager::STATE_ACTIVE, $feature['default'] );
	}

	public function test_remove_feature() {
		$this->add_test_feature();

		$experiments = $this->experiments;

		$experiments->remove_feature( 'test_feature' );

		$feature = $experiments->get_features( 'test_feature' );

		$this->assertNull( $feature );
	}

	public function test_validate_dependency__throws_when_a_dependency_is_not_available() {
		// Arrange.
		$test_feature_data = [
			'name' => Module_A::instance()->get_name(),
			'state' => Experiments_Manager::STATE_INACTIVE,
			'dependencies' => [
				Module_B::class,
			],
		];

		$this->add_test_feature( $test_feature_data );

		// Assert.
		$this->expectException( \WPDieException::class );
		$this->expectExceptionMessage( '<p>The feature `module-a` has a dependency `module-b` that is not available.</p><p><a href="#" onclick="location.href=\'http://example.org/wp-admin/admin.php?page=elementor#tab-experiments\'">Back</a></p>' );

		// Act.
		update_option(
			$this->experiments->get_feature_option_key( $test_feature_data['name'] ),
			Experiments_Manager::STATE_ACTIVE
		);
	}

	public function test_validate_dependency__throws_when_a_dependency_is_inactive_and_user_activates_a_dependant_experiment() {
		// Arrange.
		$dependant = [
			'name' => Module_A::instance()->get_name(),
			'dependencies' => [
				Module_B::class,
			],
		];

		$dependency = [
			'name' => Module_B::instance()->get_name(),
		];

		$this->add_test_feature( $dependant );
		$this->experiments->set_feature_default_state( $dependant['name'], Experiments_Manager::STATE_INACTIVE );

		$this->add_test_feature( $dependency );
		$this->experiments->set_feature_default_state( $dependency['name'], Experiments_Manager::STATE_INACTIVE );

		// Assert.
		$this->expectException( \WPDieException::class );
		$this->expectExceptionMessage( '<p>To turn on `module-a`, Experiment: `module-b` activity is required!</p><p><a href="#" onclick="location.href=\'http://example.org/wp-admin/admin.php?page=elementor#tab-experiments\'">Back</a></p>' );

		// Act.
		update_option(
			$this->experiments->get_feature_option_key( $dependant['name'] ),
			Experiments_Manager::STATE_ACTIVE
		);
	}

	public function test_validate_dependency__deactivates_an_experiment_when_its_dependency_is_inactivated() {
		// Arrange.
		$dependant = [
			'name' => Module_A::instance()->get_name(),
			'dependencies' => [
				Module_B::class,
			],
		];

		$dependency = [
			'name' => Module_B::instance()->get_name(),
		];

		$this->add_test_feature( $dependant );
		$this->experiments->set_feature_default_state( $dependant['name'], Experiments_Manager::STATE_ACTIVE );

		$this->add_test_feature( $dependency );
		$this->experiments->set_feature_default_state( $dependency['name'], Experiments_Manager::STATE_ACTIVE );

		// Act.
		update_option(
			$this->experiments->get_feature_option_key( $dependency['name'] ),
			Experiments_Manager::STATE_INACTIVE
		);

		// Assert.
		$this->assertEquals(
			Experiments_Manager::STATE_INACTIVE,
			get_option( $this->experiments->get_feature_option_key( $dependant['name'] ) )
		);
	}

	private function add_test_feature( array $args = [] ) {
		$test_feature_data = [
			'name' => 'test_feature',
		];

		if ( $args ) {
			$test_feature_data = array_merge( $test_feature_data, $args );
		}

		return $this->experiments->add_feature( $test_feature_data );
	}

	public function test_on_state_change_callback() {
		$test_feature_data = [
			'name' => 'test_feature_callback',
			'state' => Experiments_Manager::STATE_ACTIVE,
			'on_state_change' => function( $old_state, $new_state ) {
				// Throw exception for assert
				throw new \Exception( 'on_state_change_callback '. $new_state  );
			},
		];

		$this->add_test_feature( $test_feature_data );

		// Assert.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'on_state_change_callback '. Experiments_Manager::STATE_INACTIVE );

		// Act.
		update_option(
			$this->experiments->get_feature_option_key( $test_feature_data['name'] ),
			Experiments_Manager::STATE_INACTIVE
		);

	}
}
