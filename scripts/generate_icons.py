import os
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_app_icon(size):
    # Create high-res canvas (supersampled x4 for ultra smoothness)
    scale = 4
    s = size * scale
    img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    center = s / 2
    
    # 1. Base App Icon Background: Warm Vintage Parchment Card with subtle rounded corners
    corner_radius = int(s * 0.22) # iOS standard squircle feel
    bg_color = (246, 242, 235, 255) # #F6F2EB
    border_color = (226, 215, 199, 255) # #E2D7C7
    
    # Draw rounded rectangle background
    draw.rounded_rectangle([0, 0, s - 1, s - 1], radius=corner_radius, fill=bg_color, outline=border_color, width=int(s * 0.015))

    # 2. Outer Glow / Shadow for Wax Seal
    seal_radius = s * 0.35
    shadow_img = Image.new('RGBA', (s, s), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_img)
    shadow_draw.ellipse(
        [center - seal_radius - 10, center - seal_radius + 15, center + seal_radius + 10, center + seal_radius + 35],
        fill=(54, 39, 28, 70)
    )
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(radius=int(s * 0.03)))
    img = Image.alpha_composite(img, shadow_img)
    draw = ImageDraw.Draw(img)

    # 3. Scalloped Vintage Wax Seal Body
    # Draw scalloped edge circle
    num_scallops = 18
    scallop_r = seal_radius * 1.05
    for i in range(num_scallops):
        angle = (2 * math.pi / num_scallops) * i
        cx = center + (seal_radius * 0.95) * math.cos(angle)
        cy = center + (seal_radius * 0.95) * math.sin(angle)
        r_sc = seal_radius * 0.22
        draw.ellipse([cx - r_sc, cy - r_sc, cx + r_sc, cy + r_sc], fill=(139, 30, 30, 255)) # Deep Crimson #8B1E1E

    # Main Wax Seal Base Circle
    draw.ellipse([center - seal_radius, center - seal_radius, center + seal_radius, center + seal_radius], fill=(168, 50, 50, 255)) # #A83232

    # Inner Wax Seal Gradient / Highlight Ring (Gold Accent)
    gold_color = (212, 175, 55, 255) # #D4AF37
    inner_gold_r = seal_radius * 0.82
    draw.ellipse(
        [center - inner_gold_r, center - inner_gold_r, center + inner_gold_r, center + inner_gold_r],
        outline=gold_color,
        width=int(s * 0.02)
    )

    inner_wax_r = seal_radius * 0.76
    draw.ellipse(
        [center - inner_wax_r, center - inner_wax_r, center + inner_wax_r, center + inner_wax_r],
        fill=(139, 0, 0, 255) # #8B0000
    )

    # 4. Center Logo Character "L" with Vintage Serif Style
    # Try loading Playfair / Georgia / Times font if available, fallback to default font drawing
    try:
        font_path = "/System/Library/Fonts/Supplemental/Georgia.ttf"
        if not os.path.exists(font_path):
            font_path = "/System/Library/Fonts/Georgia.ttf"
        font = ImageFont.truetype(font_path, int(s * 0.42))
        
        # Draw "L" text in creamy vintage parchment color
        text = "L"
        bbox = font.getbbox(text)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        
        # Draw subtle text drop shadow
        draw.text((center - w / 2 + s * 0.01, center - h / 2 - bbox[1] + s * 0.01), text, font=font, fill=(60, 10, 10, 200))
        # Draw main gold/cream text
        draw.text((center - w / 2, center - h / 2 - bbox[1]), text, font=font, fill=(248, 227, 182, 255)) # #F8E3B6
    except Exception as e:
        print("Font fallback:", e)
        # Draw heart or simple letter if font load fails
        draw.text((center - s * 0.1, center - s * 0.2), "L", fill=(248, 227, 182, 255))

    # Downsample back to target size for crisp anti-aliasing
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

# Output Directory
out_dir = "/Users/jay/Desktop/LettersForLater/public"
os.makedirs(out_dir, exist_ok=True)

# Generate icons in standard PWA & Apple Touch sizes
sizes = {
    "apple-touch-icon.png": 180,
    "icon-192.png": 192,
    "icon-512.png": 512,
    "favicon-32x32.png": 32,
    "favicon.png": 64
}

for filename, sz in sizes.items():
    icon_img = create_app_icon(sz)
    icon_img.save(os.path.join(out_dir, filename), "PNG")
    print(f"Generated {filename} ({sz}x{sz})")

print("All app icons successfully generated!")
