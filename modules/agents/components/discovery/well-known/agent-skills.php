<?php

namespace Elementor\Modules\Agents\Components\Discovery\Well_Known;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Agent Skills Index — /.well-known/agent-skills
 *
 * Lists the MCP tools (abilities) this site exposes to agents, including input
 * schemas and required scopes. Generated from the Abilities API registry so it
 * stays accurate as abilities are added or removed.
 *
 * Applicable when the Abilities API (WP 6.9+) and the agents MCP server are
 * both active. Returns false (→ 404) on WP < 6.9 or when MCP is disabled.
 */
class Agent_Skills extends Abstract_Well_Known_Endpoint {

	/** Abilities API category registered by the MCP component. */
	const ABILITY_CATEGORY = 'elementor-agents';

	public function get_id(): string {
		return 'agent_skills';
	}

	public function get_well_known_slug(): string {
		return 'agent-skills';
	}

	/**
	 * Requires the Abilities API (WP 6.9+).
	 * MCP server check is via filter so it works before that component lands.
	 */
	public function is_applicable(): bool {
		if ( ! function_exists( 'wp_get_abilities' ) ) {
			return false;
		}

		/**
		 * Gates the skills index on the MCP server being active.
		 * The MCP component sets this via filter when it initialises.
		 *
		 * @param bool $active Default false until MCP component activates.
		 */
		return (bool) apply_filters( 'elementor/agents/mcp_server/is_active', false );
	}

	protected function generate_content(): array {
		$home   = trailingslashit( home_url() );
		$skills = $this->collect_skills();

		$document = [
			'schema_version' => '1.0',
			'publisher'      => [
				'name' => $this->sanitize( get_bloginfo( 'name' ) ),
				'url'  => $home,
			],
			'mcp_endpoint'   => rest_url( 'elementor/agents-mcp' ),
			'auth'           => [
				'documentation' => $home . '.well-known/auth.md',
				'scopes'        => $this->get_scopes(),
			],
			'skills'         => $skills,
			'total'          => count( $skills ),
		];

		/**
		 * @param array  $document The skills document.
		 * @param string $home     The site home URL.
		 */
		return (array) apply_filters( 'elementor/agents/agent_skills', $document, $home );
	}

	private function collect_skills(): array {
		$abilities = function_exists( 'wp_get_abilities' )
			? wp_get_abilities( [ 'category' => self::ABILITY_CATEGORY ] )
			: [];

		$skills = [];

		foreach ( $abilities as $ability ) {
			$skill = [
				'id'             => $ability->get_id(),
				'name'           => $ability->get_name(),
				'description'    => $ability->get_description(),
				'required_scope' => 'elementor_agent_read',
				'annotations'    => $ability->get_annotations(),
			];

			$input_schema = $ability->get_input_schema();
			if ( ! empty( $input_schema ) ) {
				$skill['input_schema'] = $input_schema;
			}

			$skills[] = $skill;
		}

		/**
		 * @param array[] $skills   Collected skill entries.
		 * @param string  $category Ability category queried.
		 */
		return (array) apply_filters( 'elementor/agents/agent_skills/entries', $skills, self::ABILITY_CATEGORY );
	}

	private function get_scopes(): array {
		$scopes = [ 'elementor_agent_read' ];
		return (array) apply_filters( 'elementor/agents/oauth/scopes', $scopes );
	}
}
