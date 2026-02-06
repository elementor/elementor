<?php

namespace Elementor\App\Modules\E_Onboarding\Storage\Entities;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class User_Choices {

	/**
	 * Step 1: Who are you building for?
	 * Single selection from: 'myself', 'client', 'employer', 'other'
	 *
	 * @var string|null
	 */
	private ?string $building_for = null;

	/**
	 * Step 2: What is your site about?
	 * Multiple selection (e.g., 'blog', 'portfolio', 'ecommerce', 'business', etc.)
	 *
	 * @var array
	 */
	private array $site_about = [];

	/**
	 * Step 3: How much experience do you have with Elementor?
	 * Single selection from: 'beginner', 'intermediate', 'advanced'
	 *
	 * @var string|null
	 */
	private ?string $experience_level = null;

	/**
	 * Step 4: Start with a theme that fits your needs
	 * Single selection (theme identifier)
	 *
	 * @var string|null
	 */
	private ?string $theme_selection = null;

	/**
	 * Step 5: What do you want to include in your site?
	 * Multiple selection (e.g., 'contact_form', 'gallery', 'blog', 'shop', etc.)
	 *
	 * @var array
	 */
	private array $site_features = [];

	public static function from_array( array $data ): self {
		$instance = new self();

		$instance->building_for = $data['building_for'] ?? null;
		$instance->site_about = $data['site_about'] ?? [];
		$instance->experience_level = $data['experience_level'] ?? null;
		$instance->theme_selection = $data['theme_selection'] ?? null;
		$instance->site_features = $data['site_features'] ?? [];

		return $instance;
	}

	public function to_array(): array {
		return [
			'building_for' => $this->building_for,
			'site_about' => $this->site_about,
			'experience_level' => $this->experience_level,
			'theme_selection' => $this->theme_selection,
			'site_features' => $this->site_features,
		];
	}

	public function get_building_for(): ?string {
		return $this->building_for;
	}

	public function set_building_for( ?string $value ): void {
		$this->building_for = $value;
	}

	public function get_site_about(): array {
		return $this->site_about;
	}

	public function set_site_about( array $value ): void {
		$this->site_about = $value;
	}

	public function get_experience_level(): ?string {
		return $this->experience_level;
	}

	public function set_experience_level( ?string $value ): void {
		$this->experience_level = $value;
	}

	public function get_theme_selection(): ?string {
		return $this->theme_selection;
	}

	public function set_theme_selection( ?string $value ): void {
		$this->theme_selection = $value;
	}

	public function get_site_features(): array {
		return $this->site_features;
	}

	public function set_site_features( array $value ): void {
		$this->site_features = $value;
	}
}
