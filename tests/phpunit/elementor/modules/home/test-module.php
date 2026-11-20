<?php
namespace Elementor\Tests\Phpunit\Elementor\Modules\Home;

use Elementor\Modules\Home\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Module extends Elementor_Test_Base {
	public function tearDown(): void {
		unset( $_GET['active-document'] );
		unset( $_GET['active-tab'] );

		parent::tearDown();
	}

	public function test_add_active_document_to_edit_link__appends_numeric_document_id_and_key_tab() {
		// Arrange
		$edit_link = 'http://example.com/wp-admin/post.php?post=1&action=elementor';
		$_GET['active-document'] = '42';
		$_GET['active-tab'] = 'global-typography';

		// Act
		$result = $this->get_home_module()->add_active_document_to_edit_link( $edit_link );

		// Assert
		$this->assertStringContainsString( 'active-document=42', $result );
		$this->assertStringContainsString( 'active-tab=global-typography', $result );
	}

	public function test_add_active_document_to_edit_link__sanitizes_query_params() {
		// Arrange
		$edit_link = 'http://example.com/wp-admin/post.php?post=1&action=elementor';
		$_GET['active-document'] = '1" onfocus="x';
		$_GET['active-tab'] = '" onfocus="x';

		// Act
		$result = $this->get_home_module()->add_active_document_to_edit_link( $edit_link );

		// Assert
		parse_str( parse_url( $result, PHP_URL_QUERY ), $query_params );

		$this->assertArrayHasKey( 'active-tab', $query_params );
		$active_tab_value = $query_params['active-tab'];

		$this->assertStringNotContainsString( '"', $active_tab_value );
		$this->assertStringNotContainsString( "'", $active_tab_value );
		$this->assertStringNotContainsString( ' ', $active_tab_value );
		$this->assertStringNotContainsString( '<', $active_tab_value );
		$this->assertStringNotContainsString( '>', $active_tab_value );
		$this->assertStringNotContainsString( '(', $active_tab_value );
		$this->assertStringNotContainsString( '=', $active_tab_value );

		$this->assertSame( 'onfocusx', $query_params['active-tab'] );

		$this->assertStringNotContainsString( '"', $result );
		$this->assertStringNotContainsString( '<', $result );

		$this->assertStringContainsString( 'active-document=1', $result );
	}

	private function get_home_module(): Module {
		$module = Plugin::$instance->modules_manager->get_modules( 'home' );

		$this->assertInstanceOf( Module::class, $module );

		return $module;
	}
}
