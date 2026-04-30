Handle base classes.

How do classes work in make-page?
How do variables work in make-page?

Update style classes. Possilby replace e-widget-s with the atomic approach.


How do larger context blocks work? Max payload?


Play around with make-page: 

padding: 10px 20px;
padding: 10px 20px 30px;
font family
calc
var()
auto
max-content

{
  "post_id": 854,
  "dry_run": false,
  "sections": [
    {
      "widget": "container",
      "css": "padding:24px 16px; background:#ffffff; max-width:320px; gap:8px; flex-direction:column",
      "children": [
        {
          "widget": "heading",
          "tag": "h2",
          "text": "Home",
          "css": "font-size:16px; font-weight:500; color:#0c0d0e; margin-bottom:8px; font-family:Roboto"
        },
        {
          "widget": "container",
          "css": "padding:14px 16px; background:#99f6e4; border-radius:8px; flex-direction:column",
          "children": [
            {
              "widget": "paragraph",
              "text": "Header",
              "css": "font-size:14px; color:#0c0d0e; font-family:Roboto"
            }
          ]
        },
        {
          "widget": "container",
          "css": "padding:14px 16px; background:#f4f5fa; border-radius:8px; flex-direction:column",
          "children": [
            {
              "widget": "paragraph",
              "text": "Hero",
              "css": "font-size:14px; color:#0c0d0e; font-family:Roboto"
            }
          ]
        },
        {
          "widget": "container",
          "css": "padding:14px 16px; background:#f4f5fa; border-radius:8px; flex-direction:column",
          "children": [
            {
              "widget": "paragraph",
              "text": "Why choose us",
              "css": "font-size:14px; color:#0c0d0e; font-family:Roboto"
            }
          ]
        },
        {
          "widget": "container",
          "css": "padding:14px 16px; background:#f4f5fa; border-radius:8px; flex-direction:column",
          "children": [
            {
              "widget": "paragraph",
              "text": "Our services",
              "css": "font-size:14px; color:#0c0d0e; font-family:Roboto"
            }
          ]
        },
        {
          "widget": "container",
          "css": "padding:14px 16px; background:#f4f5fa; border-radius:8px; flex-direction:column",
          "children": [
            {
              "widget": "paragraph",
              "text": "Testimonials",
              "css": "font-size:14px; color:#0c0d0e; font-family:Roboto"
            }
          ]
        },
        {
          "widget": "container",
          "css": "padding:14px 16px; background:#99f6e4; border-radius:8px; flex-direction:column",
          "children": [
            {
              "widget": "paragraph",
              "text": "Footer",
              "css": "font-size:14px; color:#0c0d0e; font-family:Roboto"
            }
          ]
        }
      ]
    }
  ]
}
