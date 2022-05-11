<?php
namespace Elementor\Modules\ArticleReader\Widgets;
use Elementor\Controls_Manager;


class ArticleReader extends \Elementor\Widget_Base {

	public function get_name() {
		return 'article-reader';
	}

	public function get_title() {
		return esc_html__( 'Artciel Reader', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-headphones';
	}

	public function get_categories() {
		return [ 'basic' ];
	}

	public function get_keywords() {
		return [ 'Article', 'Reader' ];
	}

    protected function register_content_tab() {
		$this->start_controls_section(
			'section_content_article_reader',
			[
				'label' => esc_html__( 'Article reader', 'elementor' ),
				'tab' => Controls_Manager::TAB_CONTENT,
			]
		);

		$this->add_control(
			'play_text',
			[
				'label' => esc_html__( 'Play Text', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'label_block' => true,
				'default' => esc_html__( 'Play article', 'elementor' ),
				'frontend_available' => true,
				'render_type' => 'none',
				'dynamic' => [
					'active' => true,
				],
			]
		);

        $this->add_control(
			'pause_text',
			[
				'label' => esc_html__( 'Pause Text', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'label_block' => true,
				'default' => esc_html__( 'Pause Reading', 'elementor' ),
				'frontend_available' => true,
				'render_type' => 'none',
				'dynamic' => [
					'active' => true,
				],
			]
		);

        $this->add_control(
			'voice_rate',
			[
				'label' => esc_html__( 'Voice Speed Rate', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 0.9,
					'unit' => 's',
				],
				'range' => [
					's' => [
						'min' => 0,
						'max' => 1,
						'step' => 0.1,
					],
				]
			]
		);

	

		$this->add_control(
			'voice_style',
			[
				'label' => esc_html__( 'Voice Style & Language', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => '',
				'options' => [
					'' => esc_html__( 'Default - Based on Site locale', 'elementor' ),
                    '1' => esc_html__( 'Alice it-IT', 'elementor' ),
                    '2' => esc_html__( 'Alva sv-SE', 'elementor' ),
                    '3' => esc_html__( 'Amelie fr-CA', 'elementor' ),
                    '4' => esc_html__( 'Anna de-DE', 'elementor' ),
                    '5' => esc_html__( 'Carmit he-IL', 'elementor' ),
                    '6' => esc_html__( 'Damayanti id-ID', 'elementor' ),
                    '7' => esc_html__( 'Daniel en-GB', 'elementor' ),
                    '8' => esc_html__( 'Diego es-AR', 'elementor' ),
                    '9' => esc_html__( 'Ellen nl-BE', 'elementor' ),
                    '10' => esc_html__( 'Fiona en-scotland', 'elementor' ),
                    '12' => esc_html__( 'Ioana ro-RO', 'elementor' ),
                    '13' => esc_html__( 'Joana pt-PT', 'elementor' ),
                    '14' => esc_html__( 'Jorge es-ES', 'elementor' ),
                    '15' => esc_html__( 'Juan es-MX', 'elementor' ),
                    '16' => esc_html__( 'Kanya th-TH', 'elementor' ),
                    '17' => esc_html__( 'Karen en-AU', 'elementor' ),
                    '18' => esc_html__( 'Kyoko ja-JP', 'elementor' ),
                    '19' => esc_html__( 'Laura sk-SK', 'elementor' ),
                    '20' => esc_html__( 'Lekha hi-IN', 'elementor' ),
                    '21' => esc_html__( 'Luca it-IT', 'elementor' ),
                    '22' => esc_html__( 'Luciana pt-BR', 'elementor' ),
                    '23' => esc_html__( 'Maged ar-SA', 'elementor' ),
                    '24' => esc_html__( 'Mariska hu-HU', 'elementor' ),
                    '25' => esc_html__( 'Mei-Jia zh-TW', 'elementor' ),
                    '26' => esc_html__( 'Melina el-GR', 'elementor' ),
                    '27' => esc_html__( 'Milena ru-RU', 'elementor' ),
                    '28' => esc_html__( 'Moira en-IE', 'elementor' ),
                    '29' => esc_html__( 'Monica es-ES', 'elementor' ),
                    '30' => esc_html__( 'Nora nb-NO', 'elementor' ),
                    '31' => esc_html__( 'Paulina es-MX', 'elementor' ),
                    '32' => esc_html__( 'Rishi en-IN', 'elementor' ),
                    '33' => esc_html__( 'Samantha en-US', 'elementor' ),
                    '34' => esc_html__( 'Sara da-DK', 'elementor' ),
                    '35' => esc_html__( 'Satu fi-FI', 'elementor' ),
                    '36' => esc_html__( 'Sin-ji zh-HK', 'elementor' ),
                    '37' => esc_html__( 'Tessa en-ZA', 'elementor' ),
                    '38' => esc_html__( 'Thomas fr-FR', 'elementor' ),
                    '39' => esc_html__( 'Ting-Ting zh-CN', 'elementor' ),
                    '40' => esc_html__( 'Veena en-IN', 'elementor' ),
                    '41' => esc_html__( 'Victoria en-US', 'elementor' ),
                    '42' => esc_html__( 'Xander nl-NL', 'elementor' ),
                    '43' => esc_html__( 'Yelda tr-TR', 'elementor' ),
                    '44' => esc_html__( 'Yuna ko-KR', 'elementor' ),
                    '45' => esc_html__( 'Yuri ru-RU', 'elementor' ),
                    '46' => esc_html__( 'Zosia pl-PL', 'elementor' ),
                    '47' => esc_html__( 'Zuzana cs-CZ', 'elementor' ),
				],
				'selectors' => [
					'{{WRAPPER}}' => '--direction: {{VALUE}}',
				],
				'frontend_available' => true,
			]
		);


		$this->end_controls_section();
	}

	protected function register_style_tab() {
        
	}

    protected function register_controls() {
		$this->register_content_tab();
		$this->register_style_tab();
	}

    protected function clean_the_content($text) {
        return str_replace("\n","",wp_filter_nohtml_kses(preg_replace('/(<(script|style|button|a|img)\b[^>]*>).*?(<\/\2>)/is', "$1$3", $text)));
    }

    protected function render() {
        $settings = $this->get_settings_for_display();
		?>
        <div class="article-reader-widget-wrapper">
            <button 
            play-text="<?php echo $settings['play_text']; ?>" 
            pause-text="<?php echo $settings['pause_text']; ?>" 
            default-voice="<?php echo $settings['voice_style']; ?>"
            page-full-locale="<?php echo get_locale(); ?>"
            play-rate="<?php echo $settings['voice_rate']['size']; ?>"
            text="<?php echo $this->clean_the_content(get_the_content()); ?>"
            class="article-reader-widget" onclick="speechSynthesisPlay(this);"><?php echo $settings['play_text']; ?> 
        </button>
        </div>
		<?php
	}

}