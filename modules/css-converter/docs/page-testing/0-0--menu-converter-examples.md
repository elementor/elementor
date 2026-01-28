Inline css

<div style="color: #ff6b6b; font-size: 24px; padding: 20px; background-color: #f8f9fa;"><h1 style="color: #2c3e50; font-weight: bold; text-align: center;">Styled Heading</h1><p style="font-size: 16px; line-height: 1.6; margin: 10px 0;">This paragraph has custom styling.</p></div>

CSS ID style

<style>#container { background: linear-gradient(45deg, #667eea, #764ba2); padding: 40px 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); } #title { background-color: #43b8b8; color: white; font-size: 32px; font-weight: 700; text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); } #subtitle { color: #e0e6ed; font-size: 18px; margin-top: 10px; }</style><div id="container"><h1 id="title">Premium Design</h1><p id="subtitle">Beautiful gradients and shadows</p></div>

Global classes

<style>.hero-section { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 60px 30px; background: #1a1a2e; } .hero-title { color: #eee; font-size: 48px; font-weight: 800; letter-spacing: -1px; } .hero-subtitle { color: #16213e; font-size: 20px; opacity: 0.8; } .cta-button { background: #0f3460; color: white; padding: 15px 30px; border-radius: 8px; font-weight: 600; text-decoration: none; transition: all 0.3s ease; }</style><div class="hero-section"><h1 class="hero-title">Amazing Product</h1><p class="hero-subtitle">Transform your workflow today</p><a href="#" class="cta-button">Get Started</a></div>

Nested content with inline styles

<div style="max-width: 800px; margin: 0 auto; padding: 40px;"><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;"><div style="background: #fff; border: 1px solid #e1e8ed; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"><h2 style="color: #1da1f2; font-size: 24px; margin-bottom: 16px;">Feature One</h2><p style="color: #657786; line-height: 1.5;">Detailed description of the first feature.</p></div><div style="background: #fff; border: 1px solid #e1e8ed; border-radius: 8px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);"><h2 style="color: #1da1f2; font-size: 24px; margin-bottom: 16px;">Feature Two</h2><p style="color: #657786; line-height: 1.5;">Detailed description of the second feature.</p></div></div></div>

Typography

<div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 40px;"><h1 style="font-size: 42px; font-weight: 300; color: #2c3e50; line-height: 1.2; margin-bottom: 20px; text-align: center;">Typography Test</h1><h2 style="font-size: 28px; font-weight: 600; color: #34495e; margin: 30px 0 15px;">Subheading Style</h2><p style="font-size: 18px; line-height: 1.7; color: #555; margin-bottom: 20px; text-align: justify;">This paragraph tests various typography properties including font size, line height, color, and text alignment. It should render beautifully with proper spacing.</p><blockquote style="border-left: 4px solid #3498db; padding-left: 20px; margin: 30px 0; font-style: italic; color: #7f8c8d;">This is a styled blockquote to test border and italic text styling.</blockquote></div>

Spacing and layout

<div style="padding: 50px 30px; background: #f7f9fc;"><div style="margin: 0 auto 40px; max-width: 500px; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);"><h2 style="margin: 0 0 20px; padding-bottom: 15px; border-bottom: 2px solid #e9ecef; color: #495057;">Spacing Test</h2><p style="margin: 15px 0; padding: 10px 15px; background: #e7f3ff; border-left: 3px solid #007bff; color: #004085;">This tests margin and padding properties.</p><div style="display: flex; gap: 15px; margin-top: 25px;"><div style="flex: 1; padding: 20px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px;">Flex Item 1</div><div style="flex: 1; padding: 20px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 6px;">Flex Item 2</div></div></div></div>

Borders

<div style="padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><div style="background: white; border: 2px solid #dee2e6; border-radius: 15px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 25px rgba(0,0,0,0.15);"><h2 style="color: #343a40; border-bottom: 3px solid #007bff; padding-bottom: 10px; margin-bottom: 20px;">Border Styles</h2><div style="border: 1px dashed #6c757d; padding: 15px; margin: 15px 0; border-radius: 8px;">Dashed border example</div><div style="border: 3px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">Solid border with inset shadow</div><div style="border: 2px dotted #dc3545; padding: 15px; margin: 15px 0; border-radius: 8px;">Dotted border example</div></div></div>

Background styling

<div style="padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"><div style="background: white; border: 2px solid #dee2e6; border-radius: 15px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 25px rgba(0,0,0,0.15);"><h2 style="color: #343a40; border-bottom: 3px solid #007bff; padding-bottom: 10px; margin-bottom: 20px;">Border Styles</h2><div style="border: 1px dashed #6c757d; padding: 15px; margin: 15px 0; border-radius: 8px;">Dashed border example</div><div style="border: 3px solid #28a745; padding: 15px; margin: 15px 0; border-radius: 8px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">Solid border with inset shadow</div><div style="border: 2px dotted #dc3545; padding: 15px; margin: 15px 0; border-radius: 8px;">Dotted border example</div></div></div>

