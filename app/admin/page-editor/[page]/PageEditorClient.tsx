'use client'

import { useState, useTransition, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { savePageContent } from '../actions'
import type {
  PageBlock,
  BlockType,
  TextBlockProps,
  ImageBlockProps,
  ThreeJSBlockProps,
  SpacerBlockProps,
  TextStyle,
  BlockLayout,
} from '@/lib/types'
import { THREEJS_COMPONENTS } from '@/lib/types'

// ─── helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return crypto.randomUUID()
}

const DEFAULT_LAYOUT: BlockLayout = {
  width: 'full',
  marginTop: '0',
  marginBottom: '1rem',
  paddingX: '0',
}

function createBlock(type: BlockType): PageBlock {
  const base = { id: uid(), type, order: 0, layout: { ...DEFAULT_LAYOUT } }

  switch (type) {
    case 'text':
      return { ...base, props: { content: 'Enter your text here…', styleId: null, alignment: 'left' } as TextBlockProps }
    case 'image':
      return { ...base, props: { src: '', alt: '', aspectRatio: '16/9', objectFit: 'cover' } as ImageBlockProps }
    case 'threejs':
      return { ...base, props: { component: 'ArchitecturalWireframe', height: '400px' } as ThreeJSBlockProps }
    case 'spacer':
      return { ...base, props: { height: '4rem' } as SpacerBlockProps }
  }
}

// ─── block type metadata ─────────────────────────────────────────────────────

const BLOCK_TYPES: { type: BlockType; label: string; icon: string; desc: string }[] = [
  { type: 'text', label: 'Text', icon: 'T', desc: 'Text with predefined style' },
  { type: 'image', label: 'Image', icon: '◻', desc: 'Image container' },
  { type: 'threejs', label: 'Three.js', icon: '△', desc: '3D scene placeholder' },
  { type: 'spacer', label: 'Spacer', icon: '↕', desc: 'Vertical spacing' },
]

// ─── Sortable Block wrapper ──────────────────────────────────────────────────

function SortableBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
  textStyles,
}: {
  block: PageBlock
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  textStyles: TextStyle[]
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border-2 transition-colors duration-150 ${
        isSelected ? 'border-ink' : 'border-transparent hover:border-rule'
      }`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
    >
      {/* Drag handle + type badge */}
      <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          {...attributes}
          {...listeners}
          className="w-7 h-7 flex items-center justify-center bg-white border border-rule text-muted hover:text-ink hover:border-ink transition-colors cursor-grab active:cursor-grabbing text-xs"
          title="Drag to reorder"
        >
          ⠿
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="w-7 h-7 flex items-center justify-center bg-white border border-rule text-muted hover:text-red-500 hover:border-red-300 transition-colors text-xs"
          title="Delete block"
        >
          ✕
        </button>
      </div>

      {/* Type badge */}
      <div className="absolute -right-2 -top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[9px] uppercase tracking-wider bg-ink text-white px-2 py-0.5">
          {block.type}
        </span>
      </div>

      {/* Block preview */}
      <BlockPreview block={block} textStyles={textStyles} />
    </div>
  )
}

// ─── Block Preview (in-canvas) ───────────────────────────────────────────────

function BlockPreview({
  block,
  textStyles,
}: {
  block: PageBlock
  textStyles: TextStyle[]
}) {
  const widthClass =
    block.layout.width === 'full' ? 'w-full'
    : block.layout.width === 'wide' ? 'w-[85%]'
    : block.layout.width === 'half' ? 'w-1/2'
    : 'w-1/3'

  const wrapStyle: React.CSSProperties = {
    marginTop: block.layout.marginTop,
    marginBottom: block.layout.marginBottom,
    paddingLeft: block.layout.paddingX,
    paddingRight: block.layout.paddingX,
  }

  switch (block.type) {
    case 'text': {
      const props = block.props as TextBlockProps
      const style = textStyles.find((s) => s.id === props.styleId)
      const textStyle: React.CSSProperties = style
        ? {
            fontSize: style.font_size.startsWith('clamp') ? '1.8rem' : style.font_size,
            fontWeight: style.font_weight,
            color: style.color,
            letterSpacing: style.letter_spacing,
            lineHeight: style.line_height,
            textTransform: style.text_transform as React.CSSProperties['textTransform'],
            fontStyle: style.font_style,
            textAlign: props.alignment,
          }
        : { textAlign: props.alignment }

      return (
        <div className={widthClass} style={wrapStyle}>
          <div className="bg-white p-4 min-h-[3rem]">
            {style && (
              <span className="text-[9px] uppercase tracking-wider text-muted bg-warm px-1.5 py-0.5 mb-2 inline-block">
                {style.name}
              </span>
            )}
            <p style={textStyle}>{props.content || 'Empty text block'}</p>
          </div>
        </div>
      )
    }

    case 'image': {
      const props = block.props as ImageBlockProps
      return (
        <div className={widthClass} style={wrapStyle}>
          <div
            className="bg-warm border border-rule flex items-center justify-center overflow-hidden"
            style={{ aspectRatio: props.aspectRatio }}
          >
            {props.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={props.src}
                alt={props.alt}
                className="w-full h-full"
                style={{ objectFit: props.objectFit }}
              />
            ) : (
              <div className="text-center text-muted">
                <p className="text-2xl mb-1">◻</p>
                <p className="text-[10px] uppercase tracking-wider">Image</p>
                <p className="text-[10px]">{props.aspectRatio}</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'threejs': {
      const props = block.props as ThreeJSBlockProps
      return (
        <div className={widthClass} style={wrapStyle}>
          <div
            className="bg-ink/5 border border-dashed border-muted flex items-center justify-center"
            style={{ height: props.height }}
          >
            <div className="text-center text-muted">
              <p className="text-2xl mb-1">△</p>
              <p className="text-[10px] uppercase tracking-wider">Three.js</p>
              <p className="text-[10px]">{props.component}</p>
            </div>
          </div>
        </div>
      )
    }

    case 'spacer': {
      const props = block.props as SpacerBlockProps
      return (
        <div className={widthClass} style={wrapStyle}>
          <div
            className="bg-warm/50 border border-dashed border-rule flex items-center justify-center"
            style={{ height: props.height }}
          >
            <span className="text-[10px] uppercase tracking-wider text-muted">
              Spacer · {props.height}
            </span>
          </div>
        </div>
      )
    }
  }
}

// ─── Properties Panel ────────────────────────────────────────────────────────

function PropertiesPanel({
  block,
  textStyles,
  onChange,
}: {
  block: PageBlock
  textStyles: TextStyle[]
  onChange: (updated: PageBlock) => void
}) {

  function updateProps(partial: Record<string, unknown>) {
    onChange({
      ...block,
      props: { ...block.props, ...partial } as PageBlock['props'],
    })
  }

  function updateLayout(partial: Partial<BlockLayout>) {
    onChange({
      ...block,
      layout: { ...block.layout, ...partial },
    })
  }

  return (
    <div className="space-y-5">
      {/* ── Layout section ─── */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted mb-3 border-b border-rule pb-2">Layout</p>
        <div className="space-y-3">
          {/* Width */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Width</label>
            <div className="flex gap-1">
              {(['full', 'wide', 'half', 'third'] as const).map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => updateLayout({ width: w })}
                  className={`px-2.5 py-1 text-[10px] border transition-colors ${
                    block.layout.width === w
                      ? 'border-ink bg-ink text-white'
                      : 'border-rule text-muted hover:border-muted'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Margin Top */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Margin Top</label>
            <input
              type="text"
              value={block.layout.marginTop}
              onChange={(e) => updateLayout({ marginTop: e.target.value })}
              className="w-full border border-rule px-2.5 py-1.5 text-xs text-ink bg-white focus:border-ink outline-none"
              placeholder="0"
            />
          </div>

          {/* Margin Bottom */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Margin Bottom</label>
            <input
              type="text"
              value={block.layout.marginBottom}
              onChange={(e) => updateLayout({ marginBottom: e.target.value })}
              className="w-full border border-rule px-2.5 py-1.5 text-xs text-ink bg-white focus:border-ink outline-none"
              placeholder="1rem"
            />
          </div>

          {/* Padding X */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Horizontal Padding</label>
            <input
              type="text"
              value={block.layout.paddingX}
              onChange={(e) => updateLayout({ paddingX: e.target.value })}
              className="w-full border border-rule px-2.5 py-1.5 text-xs text-ink bg-white focus:border-ink outline-none"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* ── Type-specific props ─── */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted mb-3 border-b border-rule pb-2">
          {block.type === 'text' ? 'Text' : block.type === 'image' ? 'Image' : block.type === 'threejs' ? 'Three.js' : 'Spacer'} Properties
        </p>

        {block.type === 'text' && (
          <TextProperties
            props={block.props as TextBlockProps}
            textStyles={textStyles}
            onChange={updateProps}
          />
        )}

        {block.type === 'image' && (
          <ImageProperties
            props={block.props as ImageBlockProps}
            onChange={updateProps}
          />
        )}

        {block.type === 'threejs' && (
          <ThreeJSProperties
            props={block.props as ThreeJSBlockProps}
            onChange={updateProps}
          />
        )}

        {block.type === 'spacer' && (
          <SpacerProperties
            props={block.props as SpacerBlockProps}
            onChange={updateProps}
          />
        )}
      </div>
    </div>
  )
}

// ─── Type-specific property editors ──────────────────────────────────────────

function TextProperties({
  props,
  textStyles,
  onChange,
}: {
  props: TextBlockProps
  textStyles: TextStyle[]
  onChange: (p: Record<string, unknown>) => void
}) {
  return (
    <div className="space-y-3">
      {/* Style Selector */}
      <div>
        <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Text Style</label>
        <select
          value={props.styleId || ''}
          onChange={(e) => onChange({ styleId: e.target.value || null })}
          className="w-full border border-rule px-2.5 py-1.5 text-xs text-ink bg-white focus:border-ink outline-none"
        >
          <option value="">— No style (default) —</option>
          {textStyles.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.font_size}, wt {s.font_weight})
            </option>
          ))}
        </select>
        {props.styleId && (
          <p className="text-[10px] text-muted mt-1">
            Edit this style in Admin → Text Styles
          </p>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Content</label>
        <textarea
          value={props.content}
          onChange={(e) => onChange({ content: e.target.value })}
          className="w-full border border-rule px-2.5 py-2 text-xs text-ink bg-white focus:border-ink outline-none min-h-[100px] resize-y"
          placeholder="Enter text content…"
        />
      </div>

      {/* Alignment */}
      <div>
        <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Alignment</label>
        <div className="flex gap-1">
          {(['left', 'center', 'right'] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onChange({ alignment: a })}
              className={`px-3 py-1 text-[10px] border transition-colors ${
                props.alignment === a
                  ? 'border-ink bg-ink text-white'
                  : 'border-rule text-muted hover:border-muted'
              }`}
            >
              {a === 'left' ? '◧' : a === 'center' ? '▣' : '◨'} {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ImageProperties({
  props,
  onChange,
}: {
  props: ImageBlockProps
  onChange: (p: Record<string, unknown>) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Image URL</label>
        <input
          type="text"
          value={props.src}
          onChange={(e) => onChange({ src: e.target.value })}
          className="w-full border border-rule px-2.5 py-1.5 text-xs text-ink bg-white focus:border-ink outline-none"
          placeholder="https://… or /images/…"
        />
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Alt Text</label>
        <input
          type="text"
          value={props.alt}
          onChange={(e) => onChange({ alt: e.target.value })}
          className="w-full border border-rule px-2.5 py-1.5 text-xs text-ink bg-white focus:border-ink outline-none"
          placeholder="Describe the image…"
        />
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Aspect Ratio</label>
        <div className="flex gap-1 flex-wrap">
          {['1/1', '4/3', '3/2', '16/9', '21/9'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange({ aspectRatio: r })}
              className={`px-2.5 py-1 text-[10px] border transition-colors ${
                props.aspectRatio === r
                  ? 'border-ink bg-ink text-white'
                  : 'border-rule text-muted hover:border-muted'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Object Fit</label>
        <div className="flex gap-1">
          {(['cover', 'contain'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onChange({ objectFit: f })}
              className={`px-3 py-1 text-[10px] border transition-colors ${
                props.objectFit === f
                  ? 'border-ink bg-ink text-white'
                  : 'border-rule text-muted hover:border-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ThreeJSProperties({
  props,
  onChange,
}: {
  props: ThreeJSBlockProps
  onChange: (p: Record<string, unknown>) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Component</label>
        <select
          value={props.component}
          onChange={(e) => onChange({ component: e.target.value })}
          className="w-full border border-rule px-2.5 py-1.5 text-xs text-ink bg-white focus:border-ink outline-none"
        >
          {THREEJS_COMPONENTS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Height</label>
        <input
          type="text"
          value={props.height}
          onChange={(e) => onChange({ height: e.target.value })}
          className="w-full border border-rule px-2.5 py-1.5 text-xs text-ink bg-white focus:border-ink outline-none"
          placeholder="400px"
        />
      </div>
    </div>
  )
}

function SpacerProperties({
  props,
  onChange,
}: {
  props: SpacerBlockProps
  onChange: (p: Record<string, unknown>) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-[11px] uppercase tracking-wider text-muted block mb-1.5">Height</label>
        <input
          type="text"
          value={props.height}
          onChange={(e) => onChange({ height: e.target.value })}
          className="w-full border border-rule px-2.5 py-1.5 text-xs text-ink bg-white focus:border-ink outline-none"
          placeholder="4rem"
        />
        <div className="flex gap-1 mt-1.5">
          {['2rem', '4rem', '6rem', '8rem'].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => onChange({ height: h })}
              className={`px-2 py-0.5 text-[10px] border transition-colors ${
                props.height === h
                  ? 'border-ink bg-ink text-white'
                  : 'border-rule text-muted hover:border-muted'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Editor Component ───────────────────────────────────────────────────

interface Props {
  pageSlug: string
  pageLabel: string
  initialBlocks: PageBlock[]
  textStyles: TextStyle[]
}

export default function PageEditorClient({
  pageSlug,
  pageLabel,
  initialBlocks,
  textStyles,
}: Props) {
  const [blocks, setBlocks] = useState<PageBlock[]>(initialBlocks)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null

  // ── Block CRUD ──

  const addBlock = useCallback((type: BlockType) => {
    const newBlock = createBlock(type)
    newBlock.order = blocks.length
    setBlocks((prev) => [...prev, newBlock])
    setSelectedId(newBlock.id)
    setStatus('idle')
  }, [blocks.length])

  const updateBlock = useCallback((updated: PageBlock) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === updated.id ? updated : b))
    )
    setStatus('idle')
  }, [])

  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id))
    if (selectedId === id) setSelectedId(null)
    setStatus('idle')
  }, [selectedId])

  const duplicateBlock = useCallback((id: string) => {
    const block = blocks.find((b) => b.id === id)
    if (!block) return
    const copy = { ...block, id: uid(), props: { ...block.props }, layout: { ...block.layout } }
    const idx = blocks.findIndex((b) => b.id === id)
    const newBlocks = [...blocks]
    newBlocks.splice(idx + 1, 0, copy)
    setBlocks(newBlocks)
    setSelectedId(copy.id)
    setStatus('idle')
  }, [blocks])

  // ── DnD handlers ──

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over || active.id === over.id) return

    setBlocks((prev) => {
      const oldIdx = prev.findIndex((b) => b.id === active.id)
      const newIdx = prev.findIndex((b) => b.id === over.id)
      return arrayMove(prev, oldIdx, newIdx)
    })
    setStatus('idle')
  }

  // ── Save ──

  function handleSave() {
    startTransition(async () => {
      try {
        const ordered = blocks.map((b, i) => ({ ...b, order: i }))
        const result = await savePageContent(pageSlug, ordered)
        if (result.error) {
          setStatus('error')
        } else {
          setStatus('saved')
        }
      } catch {
        setStatus('error')
      }
    })
  }

  // ── Render ──

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="text-xs tracking-widest uppercase text-muted mb-2">
            admin / page editor / {pageSlug}
          </p>
          <h1 className="text-4xl font-light text-ink">
            Edit: {pageLabel}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {status === 'saved' && <p className="text-xs text-muted">Saved ✓</p>}
          {status === 'error' && <p className="text-xs text-red-500">Save failed</p>}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="text-xs tracking-widest uppercase border border-ink bg-ink text-white px-6 py-2.5 hover:bg-white hover:text-ink transition-colors duration-200 disabled:opacity-40"
          >
            {isPending ? 'saving…' : 'save page'}
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* ── Left sidebar: Block toolbox ─── */}
        <div className="w-48 shrink-0 sticky top-20">
          <div className="border border-rule bg-white">
            <div className="border-b border-rule px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-muted">Add Block</p>
            </div>
            <div className="p-2 space-y-1">
              {BLOCK_TYPES.map((bt) => (
                <button
                  key={bt.type}
                  onClick={() => addBlock(bt.type)}
                  className="w-full text-left px-3 py-2.5 border border-transparent hover:border-rule hover:bg-warm/50 transition-colors duration-150 group"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 flex items-center justify-center border border-rule bg-warm text-xs text-muted group-hover:border-ink group-hover:text-ink transition-colors">
                      {bt.icon}
                    </span>
                    <div>
                      <p className="text-[11px] text-ink">{bt.label}</p>
                      <p className="text-[9px] text-muted">{bt.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Block count */}
          <p className="text-[10px] text-muted mt-3 px-1">
            {blocks.length} block{blocks.length !== 1 ? 's' : ''} on page
          </p>
        </div>

        {/* ── Center: Canvas ─── */}
        <div
          className="flex-1 min-h-[60vh] border border-rule bg-white p-8"
          onClick={() => setSelectedId(null)}
        >
          {blocks.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[40vh] text-center">
              <div>
                <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-rule flex items-center justify-center text-2xl text-muted">
                  +
                </div>
                <p className="text-sm text-muted">No blocks yet</p>
                <p className="text-xs text-muted mt-1">
                  Click a block type on the left to add one
                </p>
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 pl-10">
                  {blocks.map((block) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      isSelected={selectedId === block.id}
                      onSelect={() => setSelectedId(block.id)}
                      onDelete={() => deleteBlock(block.id)}
                      textStyles={textStyles}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <div className="opacity-80 rotate-1 shadow-lg">
                    <BlockPreview
                      block={blocks.find((b) => b.id === activeId)!}
                      textStyles={textStyles}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        {/* ── Right sidebar: Properties ─── */}
        <div className="w-64 shrink-0 sticky top-20">
          <div className="border border-rule bg-white">
            <div className="border-b border-rule px-4 py-3 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-widest text-muted">Properties</p>
              {selectedBlock && (
                <button
                  onClick={() => duplicateBlock(selectedBlock.id)}
                  className="text-[10px] text-muted hover:text-ink transition-colors"
                  title="Duplicate block"
                >
                  ⊞ duplicate
                </button>
              )}
            </div>
            <div className="p-4">
              {selectedBlock ? (
                <PropertiesPanel
                  block={selectedBlock}
                  textStyles={textStyles}
                  onChange={updateBlock}
                />
              ) : (
                <p className="text-xs text-muted py-8 text-center">
                  Select a block to edit its properties
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
