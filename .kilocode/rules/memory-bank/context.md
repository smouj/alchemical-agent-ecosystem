# Active Context: Alchemical Agent Ecosystem Dashboard

## Current State

**Project Status**: ✅ Alchemical Dashboard ENHANCED v2 - Production Ready with Screenshots

El proyecto ha sido transformado de un template básico de Next.js a un **Dashboard de Orquestación Multi-Agente** épico con tema alquímico oscuro premium. La interfaz transmite poder, soberanía y misterio.

## Recently Completed

### Alchemical Dashboard Implementation
- [x] Layout de 4 zonas colapsables (Grimorio, Studio, Panel Contextual, Consola)
- [x] Tema visual "Magnum Opus": negro profundo #0A0A0A + oro alquímico #FFD700 + fuego naranja #FF4D00
- [x] Agent Node Studio con React Flow (canvas gigante con zoom/pan perfecto)
- [x] Nodos alquímicos personalizados con glows según rol (Prima Materia, Catalizador, Refinador, etc.)
- [x] Animaciones de transmutación (Nigredo → Albedo → Citrinitas → Rubedo)
- [x] Circle Builder modal con plantillas predefinidas
- [x] Grimorio Sidebar con Círculos, Agentes y Skills
- [x] Panel derecho con tabs: Inspector, Config, Memoria, Telemetría
- [x] Consola de Transmutación con logs en tiempo real
- [x] Zustand store para estado global
- [x] Modo Focus (pantalla completa)
- [x] Onboarding místico con animaciones
- [x] Framer Motion para micro-interacciones

## Current Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout con fonts Cinzel + Inter + JetBrains Mono
│   ├── page.tsx            # Redirect a /dashboard
│   ├── globals.css         # Design System Alquímico completo
│   └── dashboard/
│       └── page.tsx        # Main dashboard con 4 zonas
├── components/
│   ├── layout/
│   │   └── TopBar.tsx      # Top navigation con system status
│   ├── sidebar/
│   │   └── GrimoireSidebar.tsx  # Left panel (Círculos, Agentes, Skills)
│   ├── panels/
│   │   ├── RightPanel.tsx       # Right panel con tabs
│   │   └── AgentInspector.tsx   # Agent detail view
│   ├── studio/
│   │   ├── AgentNodeStudio.tsx  # React Flow canvas principal
│   │   ├── CircleBuilder.tsx    # Modal forjar Círculos
│   │   └── CustomNode.tsx       # Nodos alquímicos personalizados
│   └── console/
│       └── TransmutationConsole.tsx  # Logs en tiempo real
└── lib/
    └── store/
        └── dashboard.ts    # Zustand store completo
```

## Agentes Predefinidos (7)

| Agente | Rol | Codename | Modelo |
|--------|-----|----------|--------|
| Velktharion | Prima Materia | El Arquitecto | llama3.2 |
| Synapsara | Tejedor | La Tejedora | mistral |
| Kryonexus | Centinela | El Guardián | phi3 |
| Pyraxis | Catalizador | El Catalizador | codellama |
| Lumivex | Refinador | El Refinador | gemma2 |
| Archivex | Escriba | El Escriba | llama3.2 |
| Oraclyx | Oráculo | El Oráculo | deepseek-r1 |

## Dependencies Added

- @xyflow/react (React Flow)
- framer-motion (Animaciones)
- zustand (State management)
- lucide-react (Iconos)
- @radix-ui/* (Componentes primitivos)
- clsx, tailwind-merge, class-variance-authority

## Key Features

### 🎨 Design System Alquímico
- Paleta: Void (#0A0A0A), Gold (#FFD700), Fire (#FF4D00), Mystic (#8B5CF6)
- Tipografía: Cinzel (headers), Inter (body), JetBrains Mono (code)
- Sombras: glow-gold, glow-fire, glow-mystic
- Animaciones: transmutation-pulse, energy-flow, forge-ignite

### 🧙 Flujo de Usuario
1. Bienvenida mística con símbolo alquímico animado
2. Grimorio sidebar para gestionar Círculos y Agentes
3. Canvas central para diseñar flujos con drag & drop
4. Panel derecho para inspeccionar y configurar
5. Consola inferior para logs en tiempo real

### ⚗️ Forja de Círculos
- Plantillas: Investigación, Forja de Código, Creación, Oracular
- Selección de roles dinámica
- Animación de transmutación en 4 fases
- Auto-sugerencias de IA

## Session History

| Date | Changes |
|------|---------|
| 2026-02-27 | Alchemical Dashboard COMPLETED - All components, animations, theming |
| Initial | Template created with base setup |

## Quick Commands

```bash
bun typecheck  # Check TypeScript
bun lint       # Check ESLint
bun dev        # Start dev server (localhost:3000)
```

## Keyboard Shortcuts

- `Ctrl/Cmd + B`: Toggle Grimorio sidebar
- `Ctrl/Cmd + J`: Toggle Consola
- `F11`: Modo Focus
- `Escape`: Cerrar modales
