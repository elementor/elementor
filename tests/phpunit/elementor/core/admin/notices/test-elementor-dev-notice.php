<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Admin\Notices;

use Elementor\User;
use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Core\Admin\Notices\Elementor_Dev_Notice;
use Elementor\Core\Experiments\Manager as Experiments_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Elementor_Dev_Notice extends Elementor_Test_Base {
	public function tearDown() {
		parent::tearDown();

		$experiments = $this->elementor()->experiments;

		$features = $experiments->get_features();

		foreach ( $features as $feature_name => $feature ) {
			$experiments->remove_feature( $feature_name );
		}
	}

	/** @dataProvider promotion_options_data_provider */
	public function test_should_print__when_option_is_enabled( $option_name ) {
		// Arrange
		$this->act_as_admin_or_network_admin();

		update_option( $option_name, 'yes' );

		$notice = $this->mock_notice();

		// Act
		$result = $notice->should_print();

		// Assert
		$this->assertTrue( $result );

		delete_option( $option_name );
	}

	public function promotion_options_data_provider() {
		return [
			[ 'elementor_beta' ],
		];
	}

	/** @dataProvider promotion_plugins_data_provider */
	public function test_should_print__when_plugin_is_installed( $plugin_name ) {
		// Arrange
		$this->act_as_admin_or_network_admin();

		$notice = $this->mock_notice( [ $plugin_name ] );

		// Act
		$result = $notice->should_print();

		// Assert
		$this->assertTrue( $result );
	}

	public function test_should_print__when_one_experiment_in_active() {
		// Arrange
		$this->act_as_admin_or_network_admin();

		// Demonstrates a situation when the user sets the specific feature active (different from default-active)
		add_option( 'elementor_experiment-test_feature', Experiments_Manager::STATE_ACTIVE );

		$this->elementor()->experiments->add_feature( [ 'name' => 'test_feature' ] );
		$this->elementor()->experiments->add_feature( [ 'name' => 'test_feature2' ] );

		$notice = $this->mock_notice();

		// Act
		$result = $notice->should_print();

		// Assert
		$this->assertTrue( $result );
	}

	public function promotion_plugins_data_provider() {
		return [
			[ 'woocommerce-beta-tester/woocommerce-beta-tester.php' ],
			[ 'wp-jquery-update-test/wp-jquery-update-test.php' ],
			[ 'wordpress-beta-tester/wp-beta-tester.php' ],
			[ 'gutenberg/gutenberg.php' ],
		];
	}

	public function test_should_print__should_not_print_when_user_cannot_install_plugins() {
		// Arrange
		$this->act_as_editor();

		update_option( 'elementor_beta', 'yes' );

		$notice = $this->mock_notice();

		// Act
		$result = $notice->should_print();

		// Assert
		$this->assertFalse( $result );

		delete_option( 'elementor_beta' );
	}

	public function test_should_print__should_not_print_when_user_dismissed_the_notice() {
		// Arrange
		$this->act_as_admin_or_network_admin();

		update_option( 'elementor_beta', 'yes' );

		$notice = $this->mock_notice();

		update_user_meta( get_current_user_id(), User::ADMIN_NOTICES_KEY, [ Elementor_Dev_Notice::ID => 'true' ] );

		// Act
		$result = $notice->should_print();

		// Assert
		$this->assertFalse( $result );

		delete_option( 'elementor_beta' );
	}

	public function test_should_print__should_not_print_when_elementor_dev_installed() {
		// Arrange
		$this->act_as_admin_or_network_admin();

		$notice = $this->mock_notice( [ 'elementor-dev/elementor-dev.php' ] );

		// Act
		$result = $notice->should_print();

		// Assert
		$this->assertFalse( $result );

		delete_option( 'elementor_beta' );
	}

	public function test_should_print__should_not_print_when_user_in_install_page() {
		// Arrange
		$this->act_as_admin_or_network_admin();

		set_current_screen( 'update' );

		update_option( 'elementor_beta', 'yes' );
		$notice = $this->mock_notice();

		// Act
		$result = $notice->should_print();

		// Assert
		$this->assertFalse( $result );

		delete_option( 'elementor_beta' );
	}

	public function test_should_print__should_not_print_when_there_nothing_that_trigger_promotion() {
		// Arrange
		$this->act_as_admin_or_network_admin();

		$notice = $this->mock_notice();

		add_option( 'elementor_experiment-test_feature', Experiments_Manager::STATE_INACTIVE );
		$this->elementor()->experiments->add_feature( [ 'name' => 'test_feature' ] );
		add_option( 'elementor_experiment-test_feature2', Experiments_Manager::STATE_DEFAULT );
		$this->elementor()->experiments->add_feature( [ 'name' => 'test_feature2' ] );

		// Act
		$result = $notice->should_print();

		// Assert
		$this->assertFalse( $result );
	}

	/**
	 * @param array $plugins
	 *
	 * @return Elementor_Dev_Notice
	 */
	private function mock_notice( $plugins = [] ) {
		$notice = $this->getMockBuilder( Elementor_Dev_Notice::class )
			->setMethods( [ 'get_plugins' ] )
			->getMock();

		$notice->method( 'get_plugins' )->willReturn( $plugins );

		/** @var Elementor_Dev_Notice $notice */
		return $notice;
	}
}
