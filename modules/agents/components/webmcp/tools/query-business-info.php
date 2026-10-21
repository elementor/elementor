<?php

namespace Elementor\Modules\Agents\Components\Webmcp\Tools;

use Elementor\Modules\Agents\Components\Webmcp\Business_Info_Extractor;
use Elementor\Modules\Agents\Prompt_Injection_Sanitizer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Query_Business_Info extends Abstract_Webmcp_Tool {

	const CONTACT_KEYS = [ 'telephone', 'email', 'address', 'opening_hours' ];

	private Business_Info_Extractor $extractor;

	private Prompt_Injection_Sanitizer $sanitizer;

	public function __construct( Business_Info_Extractor $extractor, Prompt_Injection_Sanitizer $sanitizer ) {
		$this->extractor = $extractor;
		$this->sanitizer = $sanitizer;
	}

	public function get_slug(): string {
		return 'query-business-info';
	}

	public function get_label(): string {
		return __( 'Get business information', 'elementor' );
	}

	public function get_description(): string {
		return __( 'Get authoritative business details of this site, such as opening hours, phone number, email, address and social profiles, taken from its structured data. When has_structured_data is false the site publishes no such details, so do not infer them from page text.', 'elementor' );
	}

	public function get_admin_description(): string {
		return __( 'Access business details from your site’s structured data, including hours and contact information.', 'elementor' );
	}

	public function get_input_schema(): array {
		return [];
	}

	public function is_relevant(): bool {
		return true;
	}

	public function execute( $input = null ) {
		$extracted = $this->extractor->get_or_refresh();

		if ( null === $extracted ) {
			return new \WP_Error(
				self::ERROR_UNAVAILABLE,
				__( 'Business information is being refreshed. Try again in a minute.', 'elementor' )
			);
		}

		$info = $this->get_business_info( $extracted );

		$info['has_structured_data'] = $this->has_structured_data( $info );

		return $info;
	}

	private function has_structured_data( array $info ): bool {
		return ! empty( array_intersect_key( $info, array_flip( self::CONTACT_KEYS ) ) );
	}

	private function get_business_info( array $extracted ): array {
		$info = array_merge(
			[
				'name' => $this->sanitizer->sanitize( get_bloginfo( 'name' ) ),
				'url' => home_url( '/' ),
			],
			$extracted
		);

		/**
		 * Filters the business details returned by the WebMCP business information tool.
		 * SEO and business plugins can use it to provide or correct the data.
		 *
		 * @param array $info Keys: name, url, telephone, email, address, opening_hours, social_profiles.
		 */
		return (array) apply_filters( 'elementor/agents/webmcp/business_info', $info );
	}
}
