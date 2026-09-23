<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Registry;

use Elementor\Modules\Mcp\Abilities\Global_Classes_Resource_Ability;
use Elementor\Modules\Mcp\Abilities\Global_Variables_Resource_Ability;
use Elementor\Modules\Mcp\Abilities\Interactions_Schema_Resource_Ability;
use Elementor\Modules\Mcp\Abilities\List_Dynamic_Tags_Ability;
use Elementor\Modules\Mcp\Abilities\List_Resources_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Variable_Guide_Ability;
use Elementor\Modules\Mcp\Abilities\Style_Best_Practices_Ability;
use Elementor\Modules\Mcp\Abilities\Wordpress_Best_Practices_Ability;
use Elementor\Modules\Mcp\Registry\Ability_Registry;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Guards against drift in the `list-resources` catalog output. The name,
 * description, uri, and mimeType for each core resource must match the
 * expected values that consumers (editor, external agents) rely on.
 *
 * @group Elementor\Modules\Mcp
 */
class Test_List_Resources_Catalog_Parity extends TestCase {

	public function test_execute__returns_expected_catalog_entries_for_core_resources() {
		// Arrange
		$registry = new Ability_Registry();
		foreach ( $this->core_resource_abilities() as $ability ) {
			$registry->add( $ability );
		}

		// Act
		$catalog = ( new List_Resources_Ability( $registry ) )->execute()['resources'];
		$by_uri = array_column( $catalog, null, 'uri' );

		// Assert
		foreach ( $this->expected_catalog_entries() as $entry ) {
			$this->assertArrayHasKey( $entry['uri'], $by_uri, "Resource {$entry['uri']} missing from catalog" );
			$this->assertSame( $entry, $by_uri[ $entry['uri'] ], "Catalog entry drift for {$entry['uri']}" );
		}
	}

	private function core_resource_abilities(): array {
		return [
			new Style_Best_Practices_Ability(),
			new Wordpress_Best_Practices_Ability(),
			new Manage_Variable_Guide_Ability(),
			new Global_Classes_Resource_Ability(),
			new Global_Variables_Resource_Ability(),
			new List_Dynamic_Tags_Ability(),
			new Interactions_Schema_Resource_Ability(),
		];
	}

	private function expected_catalog_entries(): array {
		return [
			[
				'uri' => Style_Best_Practices_Ability::URI,
				'name' => 'Style Best Practices',
				'description' => 'Design quality guidelines for creating distinctive, intentional aesthetics. Covers typography, color strategy, spacing, motion, and visual hierarchy.',
				'mimeType' => 'text/markdown',
			],
			[
				'uri' => Wordpress_Best_Practices_Ability::URI,
				'name' => 'WordPress Best Practices',
				'description' => 'Opinionated WordPress patterns for Elementor builds: repeating layouts (single template vs N pages), include-all + exclude-exceptions condition scoping, Post Content placement, dynamic tags.',
				'mimeType' => 'text/markdown',
			],
			[
				'uri' => Manage_Variable_Guide_Ability::URI,
				'name' => 'Manage Global Variable Guide',
				'description' => 'Detailed guide for using the manage-global-variable tool. Covers available types, naming rules, value rules, and operation examples.',
				'mimeType' => 'text/plain',
			],
			[
				'uri' => Global_Classes_Resource_Ability::URI,
				'name' => 'Global Classes',
				'description' => 'Reusable CSS classes from the active kit, ordered from highest to lowest CSS priority. Check first before adding inline styles.',
				'mimeType' => 'application/json',
			],
			[
				'uri' => Global_Variables_Resource_Ability::URI,
				'name' => 'Global Variables',
				'description' => 'Design tokens (colors, fonts, sizes) from the active kit; check before styling with variables.',
				'mimeType' => 'application/json',
			],
			[
				'uri' => List_Dynamic_Tags_Ability::URI,
				'name' => 'Dynamic Tags',
				'description' => List_Dynamic_Tags_Ability::DESCRIPTION,
				'mimeType' => 'application/json',
			],
			[
				'uri' => Interactions_Schema_Resource_Ability::URI,
				'name' => 'Interactions Schema',
				'description' => 'Interaction item shape, enums, and defaults for build-composition.',
				'mimeType' => 'application/json',
			],
		];
	}
}
