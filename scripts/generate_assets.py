"""
Production generator for VeySkill brand assets:
- icon.svg (pure vector)
- logo.svg (pure vector with wordmark)
"""
import os

PUBLIC_DIR = r"c:\Users\chann\OneDrive\Desktop\channu\Learnloom\public"

icon_svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Left Arm Gradient: Luminous Indigo (crystal clear on dark and light backgrounds) -->
    <linearGradient id="vs_indigo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1" />
      <stop offset="100%" stop-color="#4F46E5" />
    </linearGradient>

    <!-- Right Arm Gradient: Luminous Teal -->
    <linearGradient id="vs_teal" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#14B8A6" />
      <stop offset="100%" stop-color="#2DD4BF" />
    </linearGradient>
  </defs>

  <!-- Left Arm: Indigo Pill -->
  <line x1="146" y1="108" x2="256" y2="400"
        stroke="url(#vs_indigo)" stroke-width="84" stroke-linecap="round" />

  <!-- Right Arm: Teal Pill (overlapping left arm at bottom apex) -->
  <line x1="256" y1="400" x2="366" y2="108"
        stroke="url(#vs_teal)" stroke-width="84" stroke-linecap="round" />
</svg>
"""

logo_svg_content = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 798 220" width="100%" height="100%">
  <defs>
    <linearGradient id="logo_indigo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1" />
      <stop offset="100%" stop-color="#4F46E5" />
    </linearGradient>
    <linearGradient id="logo_teal" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#14B8A6" />
      <stop offset="100%" stop-color="#2DD4BF" />
    </linearGradient>
  </defs>

  <!-- V Emblem (Proportionally scaled to 184px height, vertically centered) -->
  <g transform="translate(45, 18) scale(0.36)">
    <line x1="146" y1="108" x2="256" y2="400"
          stroke="url(#logo_indigo)" stroke-width="84" stroke-linecap="round" />
    <line x1="256" y1="400" x2="366" y2="108"
          stroke="url(#logo_teal)" stroke-width="84" stroke-linecap="round" />
  </g>

  <!-- Typography: Vey in Deep Navy, skill in Teal -->
  <text x="240" y="145"
        font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif"
        font-size="112" font-weight="800" letter-spacing="-0.035em" fill="#003049">
    Vey<tspan fill="#14B8A6">skill</tspan>
  </text>
</svg>
"""

with open(os.path.join(PUBLIC_DIR, "icon.svg"), "w", encoding="utf-8") as f:
    f.write(icon_svg_content)

with open(os.path.join(PUBLIC_DIR, "logo.svg"), "w", encoding="utf-8") as f:
    f.write(logo_svg_content)

print("Saved icon.svg and logo.svg without filter clipping")
