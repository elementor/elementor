<?php

namespace Elementor\Modules\Agents\Components\Discovery\Well_Known;

use Elementor\Modules\Agents\Components\Discovery\Openapi_Spec;
use Elementor\Modules\Agents\Module;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * ARD catalog — /.well-known/ard.json (Agentic Resource Discovery v0.91)
 *
 * Lists the agent-facing artifacts this site serves as ARD entries, each with
 * a domain-anchored URN identifier and the media type its URL actually returns.
 * Also reachable at the predecessor path /.well-known/ai-catalog.json.
 *
 * Not applicable when the site owner already publishes a physical catalog, so
 * an existing ard.json or ai-catalog.json is never contradicted.
 *
 * @see https://github.com/ards-project/ard-spec/blob/main/spec/ard.md
 */
class Ard_Catalog extends Abstract_Well_Known_Endpoint {

	const PHYSICAL_CATALOG_FILES = [ 'ard.json', 'ai-catalog.json' ];

	const URN_PREFIX = 'urn:air:';

	const LLMS_TXT_MEDIA_TYPE = 'text/plain';

	const LLMS_TXT_REPRESENTATIVE_QUERIES = [
		'What is this website about?',
		'Which pages on this site are the most important?',
		'Summarize the content this site offers.',
	];

	const AGENT_SKILLS_SLUG = 'agent-skills';

	const AGENT_SKILLS_REPRESENTATIVE_QUERIES = [
		'What actions can an agent perform on this site?',
		'Which tools does this site expose to AI agents?',
		'What input does each site skill require?',
	];

	private ?Module $module;

	public function __construct( ?Module $module = null ) {
		$this->module = $module;
	}

	public function get_id(): string {
		return 'ard_catalog';
	}

	public function get_well_known_slug(): string {
		return 'ard.json';
	}

	public function get_slug_aliases(): array {
		return [ 'ai-catalog.json', 'ard', 'ai-catalog' ];
	}

	public function is_applicable(): bool {
		if ( $this->has_physical_catalog_file() ) {
			return false;
		}

		/**
		 * Gates the ARD catalog, e.g. when another plugin publishes its own.
		 *
		 * @param bool $applicable Default true.
		 */
		return (bool) apply_filters( 'elementor/agents/ard_catalog/is_applicable', true );
	}

	protected function generate_content(): array {
		$home = trailingslashit( home_url() );

		$built_in_entries = array_merge(
			$this->build_llms_txt_entries( $home ),
			$this->build_agent_skills_entries( $home ),
			$this->build_openapi_entries( $home )
		);

		/**
		 * Filter the ARD catalog entries before serialisation.
		 * Each entry's type must match the media type its url actually serves.
		 *
		 * @param array[] $entries Built-in catalog entries.
		 * @param string  $home    The site home URL with trailing slash.
		 */
		$entries = array_values( (array) apply_filters( 'elementor/agents/ard_catalog/entries', $built_in_entries, $home ) );

		return [ 'entries' => $entries ];
	}

	private function has_physical_catalog_file(): bool {
		$well_known_path = Module::get_llms_file_root_path() . ltrim( Well_Known_Router::WELL_KNOWN_PREFIX, '/' );

		foreach ( self::PHYSICAL_CATALOG_FILES as $filename ) {
			if ( file_exists( $well_known_path . $filename ) ) {
				return true;
			}
		}

		return false;
	}

	private function get_module(): ?Module {
		if ( null !== $this->module ) {
			return $this->module;
		}

		$module = Plugin::$instance->modules_manager->get_modules( 'agents' );

		return $module instanceof Module ? $module : null;
	}

	public static function build_identifier( string $kind, string $name ): string {
		$host      = (string) wp_parse_url( home_url(), PHP_URL_HOST );
		$site_path = trim( (string) wp_parse_url( home_url(), PHP_URL_PATH ), '/' );
		$segments  = [ self::URN_PREFIX . $host ];

		if ( '' !== $site_path ) {
			$path_parts = array_filter( explode( '/', $site_path ), 'strlen' );
			foreach ( $path_parts as $part ) {
				$segments[] = rawurlencode( $part );
			}
		}

		return implode( ':', array_merge( $segments, [ $kind, $name ] ) );
	}

	private function build_llms_txt_entries( string $home ): array {
		$module = $this->get_module();

		if ( ! $module || ! $module->should_advertise_llms_txt() ) {
			return [];
		}

		return [
			[
				'identifier'            => self::build_identifier( 'document', 'llms-txt' ),
				'displayName'           => 'llms.txt',
				'type'                  => self::LLMS_TXT_MEDIA_TYPE,
				'url'                   => $home . Module::LLMS_FILENAME,
				'description'           => 'Plain-text overview of this site and its key pages, written for language models.',
				'representativeQueries' => self::LLMS_TXT_REPRESENTATIVE_QUERIES,
			],
		];
	}

	private function build_agent_skills_entries( string $home ): array {
		$module = $this->get_module();
		$router = $module ? $module->get_component( 'well_known_router' ) : null;

		if ( ! $router instanceof Well_Known_Router ) {
			return [];
		}

		$active = $router->get_active_endpoints();

		if ( ! isset( $active[ self::AGENT_SKILLS_SLUG ] ) ) {
			return [];
		}

		return [
			[
				'identifier'            => self::build_identifier( 'skills', self::AGENT_SKILLS_SLUG ),
				'displayName'           => 'Agent skills',
				'type'                  => $active[ self::AGENT_SKILLS_SLUG ]->get_content_type(),
				'url'                   => $home . ltrim( Well_Known_Router::WELL_KNOWN_PREFIX, '/' ) . self::AGENT_SKILLS_SLUG,
				'description'           => 'Index of the actions (MCP tools) this site lets AI agents perform, with their input schemas.',
				'representativeQueries' => self::AGENT_SKILLS_REPRESENTATIVE_QUERIES,
			],
		];
	}

	private function build_openapi_entries( string $home ): array {
		$module = $this->get_module();

		if ( ! $module ) {
			return [];
		}

		$component = $module->get_component( 'openapi_spec' );

		if ( ! $component instanceof Openapi_Spec || ! $component->is_publishable() ) {
			return [];
		}

		return [
			[
				'identifier'            => self::build_identifier( 'api', 'openapi' ),
				'displayName'           => 'OpenAPI',
				'type'                  => 'application/json',
				'url'                   => $home . 'openapi.json',
				'description'           => 'OpenAPI 3.0.3 specification describing the WordPress REST API endpoints safe for agent access.',
				'representativeQueries' => [
					'What REST API endpoints does this site expose?',
					'How do I access posts and pages via the API?',
					'What parameters does the search endpoint accept?',
				],
			],
		];
	}
}
