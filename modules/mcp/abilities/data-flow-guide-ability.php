<?php

namespace Elementor\Modules\Mcp\Abilities;

use Elementor\Modules\DataFlow\Custom_Actions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Data_Flow_Guide_Ability extends Abstract_Ability {
	const URI = 'elementor://data-flow/guide';
	const FILE_PATH = __DIR__ . '/../static-resources/data-flow/guide.md';

	protected function get_ability_id(): string {
		return 'elementor/data-flow-guide';
	}

	protected function get_definition(): Ability_Definition {
		$description = __( 'How to make a page stateful: page, container and component state scopes, component params, {{state.key}} text bindings, --e-state-* CSS variables, element actions (events, pointer/scroll/drag/time inputs) and custom_actions for build-composition, manage-component and manage-elements. Ends with the custom actions saved on this site.', 'elementor' );

		return new Ability_Definition(
			__( 'Data Flow Guide', 'elementor' ),
			$description,
			'elementor',
			[ 'type' => 'string' ],
			[
				'mcp' => [
					'type'        => 'resource',
					'uri'         => self::URI,
					'public'      => true,
					'mimeType'    => 'text/markdown',
					'description' => $description,
				],
			],
			fn() => current_user_can( 'edit_posts' )
		);
	}

	public function execute( $input = [] ) {
		if ( ! file_exists( self::FILE_PATH ) ) {
			return new \WP_Error(
				'resource_not_found',
				__( 'Static resource file not found', 'elementor' ),
				[ 'status' => \WP_Http::NOT_FOUND ]
			);
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		return file_get_contents( self::FILE_PATH ) . $this->get_custom_actions_section();
	}

	private function get_custom_actions_section(): string {
		$actions = Custom_Actions::instance()->list();
		$section = "\n## Custom actions on this site\n\n";

		if ( empty( $actions ) ) {
			return $section . "None yet.\n";
		}

		$with_code = Custom_Actions::can_current_user_manage();

		foreach ( $actions as $action ) {
			$entry = [
				'name' => $action['name'],
				'label' => $action['label'],
				'description' => $action['description'],
				'args' => (object) $action['args'],
			];

			if ( $with_code ) {
				$entry['code'] = Custom_Actions::instance()->get( $action['name'] )['code'] ?? '';
			}

			$section .= "```json\n" . wp_json_encode( $entry, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . "\n```\n\n";
		}

		return $section;
	}
}
