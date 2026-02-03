# GIFFY - INFORMATION ARCHITECTURE
## Step 2: Structure & Flow

### USER FLOW (SINGLE PAGE)
```
LANDING
   ↓
[Drop Zone / Upload Button]
   ↓
EDITING (Auto-open)
   ↓
[Preview + Timeline]
   ↓
EXPORT (One Click)
   ↓
DOWNLOAD (Auto-ready)
   ↓
[Share or New]
```

### STATES
1. **INIT** - Loading processor (one-time, 5-10s)
2. **EMPTY** - Drop zone, CTA
3. **LOADED** - Video preview + controls visible
4. **EDITING** - Timeline active, trimming
5. **PROCESSING** - Converting (3-8s)
6. **READY** - Download available

### SCREEN HIERARCHY
```
┌─────────────────────────────────┐
│ HEADER (Logo + Action)          │
├─────────────────────────────────┤
│                                 │
│ MAIN CONTENT AREA               │
│ (State-dependent)               │
│                                 │
├─────────────────────────────────┤
│ FOOTER (Help + Legal)           │
└─────────────────────────────────┘
```

### CONTENT ZONES

**HERO (Empty State):**
- Large drop zone (70% viewport)
- Clear headline
- Benefit points
- Upload button (prominent)

**EDITOR (Loaded):**
- Video preview (centered, large)
- Playback controls (below video)
- Timeline (bottom, full width)
- Export button (top-right)

**RESULT (Ready):**
- GIF preview (centered)
- Download button (prominent)
- Stats (file size, duration)
- New/Share actions

### NAVIGATION
- No navigation needed (single purpose)
- Logo → refresh/new
- Context-based actions only

### PRIORITY STACK
1. Primary Action (Upload/Export/Download)
2. Video Preview
3. Timeline Controls
4. Secondary Actions
5. Help/Info
