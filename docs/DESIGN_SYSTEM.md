# GIFFY - DESIGN SYSTEM
## Step 3: Visual Language

### COLOR PALETTE

**Primary (Action):**
```
#FF6B6B - Vibrant Red (CTA, active)
#FF8787 - Light Red (hover)
#FF4757 - Dark Red (pressed)
```

**Secondary (Info):**
```
#4ECDC4 - Teal (success, info)
#45B7B8 - Teal Dark
#7FDBDA - Teal Light
```

**Neutrals:**
```
#FFFFFF - Pure White (background)
#F8F9FA - Off White (surface)
#E9ECEF - Light Gray (borders)
#ADB5BD - Mid Gray (inactive)
#495057 - Dark Gray (text)
#212529 - Almost Black (headings)
```

**Semantic:**
```
#51CF66 - Success (green)
#FFD43B - Warning (yellow)
#FF6B6B - Error (red)
#4C6EF5 - Info (blue)
```

### TYPOGRAPHY

**Font Stack:**
```css
Primary: 'Inter', -apple-system, system-ui, sans-serif
Mono: 'SF Mono', 'Monaco', monospace
```

**Scale:**
```
Display: 48px/1.1 (700) - Hero headlines
H1: 32px/1.2 (600) - Page titles
H2: 24px/1.3 (600) - Section titles
H3: 18px/1.4 (500) - Card titles
Body: 16px/1.5 (400) - Regular text
Small: 14px/1.5 (400) - Helper text
Tiny: 12px/1.4 (500) - Labels, meta
```

### SPACING SYSTEM
```
4px  - Tiny (xs)
8px  - Small (sm)
12px - Medium (md)
16px - Base (base)
24px - Large (lg)
32px - XLarge (xl)
48px - XXLarge (2xl)
64px - Huge (3xl)
```

### ELEVATION (Shadows)
```
Level 0: none
Level 1: 0 1px 3px rgba(0,0,0,0.12)
Level 2: 0 4px 6px rgba(0,0,0,0.10)
Level 3: 0 10px 20px rgba(0,0,0,0.15)
Level 4: 0 20px 40px rgba(0,0,0,0.20)
```

### BORDER RADIUS
```
none: 0
sm: 4px
base: 8px
md: 12px
lg: 16px
xl: 24px
full: 9999px
```

### BUTTON STYLES

**Primary:**
```
Background: #FF6B6B
Text: White
Padding: 12px 24px
Border-radius: 8px
Font: 16px/500
Shadow: Level 2
Hover: #FF8787 + Level 3
Active: #FF4757 + Level 1
```

**Secondary:**
```
Background: White
Text: #495057
Border: 1px solid #E9ECEF
Padding: 12px 24px
Hover: #F8F9FA
```

**Ghost:**
```
Background: Transparent
Text: #495057
Hover: rgba(0,0,0,0.05)
```

### ICONS
- Style: Outline (2px stroke)
- Size: 20px, 24px, 32px
- Library: Lucide Icons
- Color: Inherit from context

### ANIMATIONS

**Duration:**
```
Fast: 150ms (hover, click)
Base: 250ms (transitions)
Slow: 400ms (page changes)
```

**Easing:**
```
Standard: cubic-bezier(0.4, 0.0, 0.2, 1)
Decelerate: cubic-bezier(0.0, 0.0, 0.2, 1)
Accelerate: cubic-bezier(0.4, 0.0, 1, 1)
```

### COMPONENT PATTERNS

**Card:**
```
Background: White
Border: 1px solid #E9ECEF
Radius: 12px
Shadow: Level 1
Padding: 24px
```

**Input:**
```
Height: 44px
Padding: 0 16px
Border: 1px solid #E9ECEF
Radius: 8px
Focus: Border #FF6B6B + Shadow
```

**Progress Bar:**
```
Height: 8px
Background: #E9ECEF
Fill: Gradient (#FF6B6B → #4ECDC4)
Radius: full
Animation: 250ms ease
```
