<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\ProInstall;

use Elementor\Modules\ProInstall\Plugin_Installer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Plugin_Installer extends Elementor_Test_Base {

	public function test_install_with_empty_package_url_returns_install_failed_not_subscription_error(): void {
		$installer = new Plugin_Installer( 'elementor-pro', '' );
		$result = $installer->install();

		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'install_failed', $result->get_error_code() );
		$this->assertSame(
			'We couldn&#039;t install Elementor Pro. Please try again.',
			$result->get_error_message()
		);
		$this->assertSame( 'no_package_url', $result->get_error_data()['error_code'] ?? null );
	}

	public function test_install_failed_error_preserves_underlying_code_in_error_data(): void {
		$installer = new Plugin_Installer( 'elementor-pro', '' );
		$result = $installer->install();

		$this->assertIsArray( $result->get_error_data() );
		$this->assertArrayHasKey( 'error_code', $result->get_error_data() );
	}
}
