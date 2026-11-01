<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Browse_Site_Resources_Ability;
use Elementor\Modules\Mcp\Abilities\Site_Resources_Gallery_Ui_Ability;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Site_Resources_Gallery_Ui_Ability extends TestCase {

	public function test_uri_and_mime_type_constants() {
		// Assert
		$this->assertSame( 'ui://elementor/site-resources-gallery', Site_Resources_Gallery_Ui_Ability::URI );
		$this->assertSame( 'text/html;profile=mcp-app', Site_Resources_Gallery_Ui_Ability::MIME_TYPE );
	}

	public function test_execute_returns_content_item_with_profile_mime_type_and_html() {
		// Arrange
		$ability = new Site_Resources_Gallery_Ui_Ability();

		// Act
		$result = $ability->execute();

		// Assert
		$this->assertIsArray( $result );
		$this->assertCount( 1, $result );
		$this->assertSame( Site_Resources_Gallery_Ui_Ability::URI, $result[0]['uri'] );
		$this->assertSame( Site_Resources_Gallery_Ui_Ability::MIME_TYPE, $result[0]['mimeType'] );
		$this->assertIsString( $result[0]['text'] );
		$this->assertStringContainsString( '<!DOCTYPE html>', $result[0]['text'] );
		$this->assertStringContainsString( 'Site resources gallery', $result[0]['text'] );
	}

	public function test_execute_includes_ui_csp_meta_when_site_has_host() {
		// Arrange
		$ability = new Site_Resources_Gallery_Ui_Ability();

		// Act
		$result = $ability->execute();

		// Assert
		$parsed = wp_parse_url( home_url() );
		if ( ! empty( $parsed['host'] ) ) {
			$this->assertArrayHasKey( '_meta', $result[0] );
			$expected_origin = ( $parsed['scheme'] ?? 'https' ) . '://' . $parsed['host'];
			if ( ! empty( $parsed['port'] ) ) {
				$expected_origin .= ':' . $parsed['port'];
			}
			$this->assertSame( $expected_origin, $result[0]['_meta']['ui']['csp']['resourceDomains'][0] );
			$this->assertSame( $expected_origin, $result[0]['_meta']['ui']['csp']['frameDomains'][0] );
		}
	}

	public function test_execute_csp_domains_include_non_default_port_from_home_url() {
		// Arrange
		$ability = new Site_Resources_Gallery_Ui_Ability();
		$filter  = static function () {
			return 'http://localhost:8888/';
		};
		add_filter( 'home_url', $filter, 99 );

		// Act
		$result = $ability->execute();

		// Assert
		remove_filter( 'home_url', $filter, 99 );
		$this->assertSame(
			'http://localhost:8888',
			$result[0]['_meta']['ui']['csp']['resourceDomains'][0]
		);
	}
}
