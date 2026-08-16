<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Registry;

use Elementor\Modules\Mcp\Abilities\Global_Classes_Resource_Ability;
use Elementor\Modules\Mcp\Abilities\Global_Variables_Resource_Ability;
use Elementor\Modules\Mcp\Abilities\Interactions_Schema_Resource_Ability;
use Elementor\Modules\Mcp\Abilities\List_Dynamic_Tags_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Variable_Guide_Ability;
use Elementor\Modules\Mcp\Abilities\Style_Best_Practices_Ability;
use Elementor\Modules\Mcp\Abilities\Wordpress_Best_Practices_Ability;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Guards against silently losing per-resource metadata (URI or mime type) when
 * changing ability definitions. Each core resource must expose a URI and a
 * non-empty mimeType that read-resource returns to callers.
 *
 * @group Elementor\Modules\Mcp
 */
class Test_Core_Resources_Metadata extends TestCase {

	/**
	 * @dataProvider core_resource_abilities
	 */
	public function test_resource__has_non_empty_uri_and_mime_type( string $class, string $expected_uri, string $expected_mime ) {
		// Arrange
		$ability = new $class();

		// Act
		$uri = $ability->get_uri();
		$mime = $ability->get_mime_type();

		// Assert
		$this->assertSame( 'resource', $ability->get_kind() );
		$this->assertSame( $expected_uri, $uri );
		$this->assertSame( $expected_mime, $mime );
		$this->assertNotEmpty( $ability->get_display_name() );
		$this->assertNotEmpty( $ability->get_resource_description() );
	}

	public function core_resource_abilities(): array {
		return [
			'style-best-practices' => [
				Style_Best_Practices_Ability::class,
				Style_Best_Practices_Ability::URI,
				'text/markdown',
			],
			'wordpress-best-practices' => [
				Wordpress_Best_Practices_Ability::class,
				Wordpress_Best_Practices_Ability::URI,
				'text/markdown',
			],
			'manage-global-variable-guide' => [
				Manage_Variable_Guide_Ability::class,
				Manage_Variable_Guide_Ability::URI,
				'text/plain',
			],
			'global-classes' => [
				Global_Classes_Resource_Ability::class,
				Global_Classes_Resource_Ability::URI,
				'application/json',
			],
			'global-variables' => [
				Global_Variables_Resource_Ability::class,
				Global_Variables_Resource_Ability::URI,
				'application/json',
			],
			'dynamic-tags' => [
				List_Dynamic_Tags_Ability::class,
				List_Dynamic_Tags_Ability::URI,
				'application/json',
			],
			'interactions-schema' => [
				Interactions_Schema_Resource_Ability::class,
				Interactions_Schema_Resource_Ability::URI,
				'application/json',
			],
		];
	}
}
