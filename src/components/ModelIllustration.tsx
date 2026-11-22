import type { ReactElement } from 'react'
import { ILLUSTRATION_KIND, type IllustrationKind } from '../domain/illustrationKinds'

/** צבעי העץ של הפלטה. */
const WOOD = '#D1B08A'
const LIGHT = '#F3E8D6'
const DARK = '#815E40'
const SIDE = '#A7845E'
const SAGE = '#8C9A72'
const INK = '#3A2A1D'

function box(): ReactElement {
  return (
    <g strokeLinejoin="round" stroke={INK} strokeWidth="1.5">
      <polygon points="50,50 150,50 190,30 90,30" fill={LIGHT} />
      <rect x="50" y="50" width="100" height="70" fill={WOOD} />
      <polygon points="150,50 190,30 190,100 150,120" fill={SIDE} />
    </g>
  )
}

function shelf(): ReactElement {
  return (
    <g stroke={INK} strokeWidth="1.5">
      <rect x="40" y="26" width="8" height="106" fill={DARK} />
      <rect x="192" y="26" width="8" height="106" fill={DARK} />
      {[26, 68, 110].map((y) => (
        <rect key={y} x="40" y={y} width="160" height="8" fill={WOOD} />
      ))}
      <rect x="60" y="14" width="18" height="12" fill={SAGE} />
      <rect x="92" y="54" width="22" height="14" fill={LIGHT} />
      <rect x="126" y="96" width="30" height="14" fill={LIGHT} />
    </g>
  )
}

function bench(): ReactElement {
  return (
    <g stroke={INK} strokeWidth="1.5">
      <polygon points="30,70 210,70 230,58 50,58" fill={LIGHT} />
      <rect x="30" y="70" width="180" height="14" fill={WOOD} />
      <rect x="40" y="84" width="12" height="56" fill={DARK} />
      <rect x="188" y="84" width="12" height="56" fill={DARK} />
      <rect x="52" y="110" width="136" height="6" fill={DARK} />
    </g>
  )
}

function chair(): ReactElement {
  return (
    <g stroke={INK} strokeWidth="1.5">
      <polygon points="76,80 166,80 170,30 80,30" fill={WOOD} />
      <polygon points="70,90 170,90 185,78 85,78" fill={LIGHT} />
      <rect x="70" y="90" width="100" height="10" fill={WOOD} />
      <rect x="72" y="100" width="8" height="50" fill={DARK} />
      <rect x="160" y="100" width="8" height="50" fill={DARK} />
      <line x1="84" y1="78" x2="78" y2="150" stroke={DARK} strokeWidth="6" />
      <line x1="158" y1="78" x2="164" y2="150" stroke={DARK} strokeWidth="6" />
    </g>
  )
}

function lounge(): ReactElement {
  return (
    <g stroke={INK} strokeWidth="1.5" strokeLinejoin="round">
      <polygon points="70,98 150,98 110,30 40,30" fill={WOOD} />
      <polygon points="60,98 150,98 150,110 60,110" fill={LIGHT} />
      <rect x="60" y="110" width="90" height="8" fill={WOOD} />
      <polygon points="150,118 200,96 210,106 160,128" fill={SIDE} />
      <rect x="70" y="118" width="8" height="30" fill={DARK} />
      <rect x="140" y="118" width="8" height="30" fill={DARK} />
      <line x1="30" y1="150" x2="220" y2="150" stroke={DARK} strokeWidth="4" />
    </g>
  )
}

function table(): ReactElement {
  return (
    <g stroke={INK} strokeWidth="1.5">
      <polygon points="30,60 210,60 230,46 50,46" fill={LIGHT} />
      <rect x="30" y="60" width="180" height="10" fill={WOOD} />
      <rect x="40" y="70" width="10" height="72" fill={DARK} />
      <rect x="200" y="70" width="10" height="72" fill={DARK} />
      <rect x="50" y="120" width="150" height="5" fill={DARK} />
    </g>
  )
}

function stand(): ReactElement {
  return (
    <g stroke={INK} strokeWidth="1.5">
      <polygon points="100,104 140,104 175,30 135,30" fill={WOOD} />
      <polygon points="60,120 180,120 200,104 80,104" fill={LIGHT} />
      <rect x="60" y="120" width="120" height="8" fill={WOOD} />
      <rect x="96" y="96" width="52" height="8" fill={DARK} />
    </g>
  )
}

function frame(): ReactElement {
  return (
    <g stroke={INK} strokeWidth="1.5">
      <rect x="40" y="24" width="160" height="112" fill={WOOD} />
      <rect x="60" y="44" width="120" height="72" fill={LIGHT} />
    </g>
  )
}

function rack(): ReactElement {
  const slats = [50, 70, 90, 110, 130, 150, 170, 190]
  return (
    <g stroke={INK} strokeWidth="1.2">
      <rect x="40" y="40" width="160" height="8" fill={DARK} />
      <rect x="40" y="112" width="160" height="8" fill={DARK} />
      {slats.map((x) => (
        <rect key={x} x={x} y="48" width="8" height="64" fill={WOOD} />
      ))}
    </g>
  )
}

function tray(): ReactElement {
  return (
    <g strokeLinejoin="round" stroke={INK} strokeWidth="1.5">
      <polygon points="50,70 190,70 210,50 30,50" fill={LIGHT} />
      <rect x="50" y="70" width="140" height="24" fill={WOOD} />
      <polygon points="190,70 210,50 210,74 190,94" fill={SIDE} />
    </g>
  )
}

function planter(): ReactElement {
  return (
    <g strokeLinejoin="round" stroke={INK} strokeWidth="1.5">
      <circle cx="80" cy="40" r="18" fill={SAGE} />
      <circle cx="120" cy="32" r="22" fill={SAGE} />
      <circle cx="160" cy="42" r="16" fill={SAGE} />
      <polygon points="60,60 150,60 170,44 80,44" fill={LIGHT} />
      <rect x="60" y="60" width="90" height="60" fill={WOOD} />
      <polygon points="150,60 170,44 170,104 150,120" fill={SIDE} />
    </g>
  )
}

function sign(): ReactElement {
  return (
    <g stroke={INK} strokeWidth="1.5">
      <rect x="60" y="100" width="8" height="50" fill={DARK} />
      <rect x="172" y="100" width="8" height="50" fill={DARK} />
      <rect x="40" y="40" width="160" height="64" fill={WOOD} />
      {[62, 78, 94].map((y) => (
        <rect key={y} x="60" y={y} width="120" height="4" fill={DARK} />
      ))}
    </g>
  )
}

function umbrella(): ReactElement {
  return (
    <g stroke={INK} strokeWidth="1.5">
      <line x1="105" y1="50" x2="95" y2="14" stroke={DARK} strokeWidth="4" />
      <line x1="120" y1="50" x2="120" y2="8" stroke={DARK} strokeWidth="4" />
      <line x1="135" y1="50" x2="145" y2="14" stroke={DARK} strokeWidth="4" />
      <rect x="90" y="50" width="60" height="100" fill={WOOD} />
      <ellipse cx="120" cy="50" rx="30" ry="5" fill={LIGHT} />
    </g>
  )
}

function picnic(): ReactElement {
  return (
    <g stroke={INK} strokeWidth="1.5">
      <rect x="30" y="98" width="50" height="8" fill={WOOD} />
      <rect x="180" y="98" width="50" height="8" fill={WOOD} />
      <rect x="40" y="106" width="6" height="30" fill={DARK} />
      <rect x="204" y="106" width="6" height="30" fill={DARK} />
      <polygon points="60,70 180,70 200,58 80,58" fill={LIGHT} />
      <rect x="60" y="70" width="120" height="8" fill={WOOD} />
      <line x1="80" y1="78" x2="110" y2="120" stroke={DARK} strokeWidth="6" />
      <line x1="160" y1="78" x2="130" y2="120" stroke={DARK} strokeWidth="6" />
    </g>
  )
}

function tree(): ReactElement {
  return (
    <g stroke={INK} strokeWidth="1.5">
      <rect x="60" y="130" width="120" height="8" fill={DARK} />
      <rect x="116" y="40" width="8" height="90" fill={WOOD} />
      <rect x="70" y="40" width="100" height="6" fill={WOOD} />
      <rect x="76" y="56" width="16" height="18" fill={LIGHT} />
      <rect x="112" y="56" width="16" height="18" fill={LIGHT} />
      <rect x="148" y="56" width="16" height="18" fill={LIGHT} />
    </g>
  )
}

const DRAW: Record<IllustrationKind, () => ReactElement> = {
  box, shelf, bench, chair, lounge, table, stand, frame, rack, tray, planter,
  sign, umbrella, picnic, tree,
}

/** איור מקורי של הדגם לאחר הרכבה, להמחשה בלבד. */
export function ModelIllustration({ modelId, name }: { modelId: string; name: string }) {
  const kind = ILLUSTRATION_KIND[modelId] ?? 'box'
  return (
    <svg viewBox="0 0 240 160" role="img" aria-label={`המחשה: ${name} לאחר הרכבה`} style={{ direction: 'ltr', width: '100%', maxWidth: 360, height: 'auto' }}>
      <rect x="0" y="0" width="240" height="160" fill="#FBF6EE" />
      {DRAW[kind]()}
    </svg>
  )
}
