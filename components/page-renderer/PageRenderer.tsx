'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import type {
  PageBlock,
  TextBlockProps,
  ImageBlockProps,
  ThreeJSBlockProps,
  SpacerBlockProps,
  TextStyle,
} from '@/lib/types'

// ─── Lazy-load Three.js components ──────────────────────────────────────────

const ArchitecturalWireframe = dynamic(
  () => import('@/components/three/ArchitecturalWireframe'),
  { ssr: false, loading: () => <ThreeLoading /> }
)

const InteractiveRelight = dynamic(
  () => import('@/components/three/InteractiveRelight'),
  { ssr: false, loading: () => <ThreeLoading /> }
)

// ProjectSphere requires projects prop — render as a placeholder in the page renderer
// since we don't have project data in this context
const ProjectSpherePlaceholder = dynamic(
  () => import('@/components/three/ArchitecturalWireframe'),
  { ssr: false, loading: () => <ThreeLoading /> }
)

function ThreeLoading() {
  return (
    <div className="w-full h-full bg-warm flex items-center justify-center">
      <p className="text-xs text-muted">Loading 3D…</p>
    </div>
  )
}

// ─── Width utility ───────────────────────────────────────────────────────────

function widthClass(w: string) {
  switch (w) {
    case 'full':  return 'w-full'
    case 'wide':  return 'w-full max-w-[85%]'
    case 'half':  return 'w-full max-w-[50%]'
    case 'third': return 'w-full max-w-[33.333%]'
    default:      return 'w-full'
  }
}

// ─── Individual block renderers ──────────────────────────────────────────────

function TextBlock({
  props,
  style,
  layout,
}: {
  props: TextBlockProps
  style: TextStyle | undefined
  layout: PageBlock['layout']
}) {
  const textCss: React.CSSProperties = style
    ? {
        fontSize: style.font_size,
        fontWeight: style.font_weight,
        color: style.color,
        letterSpacing: style.letter_spacing,
        lineHeight: style.line_height,
        textTransform: style.text_transform as React.CSSProperties['textTransform'],
        fontStyle: style.font_style,
        marginBottom: style.margin_bottom !== '0' ? style.margin_bottom : undefined,
        textAlign: props.alignment,
      }
    : {
        textAlign: props.alignment,
      }

  // Support newlines in the text content
  const lines = props.content.split('\n')

  return (
    <div
      className={widthClass(layout.width)}
      style={{
        marginTop: layout.marginTop,
        marginBottom: layout.marginBottom,
        paddingLeft: layout.paddingX,
        paddingRight: layout.paddingX,
      }}
    >
      {lines.map((line, i) => (
        <p key={i} style={textCss}>
          {line || '\u00A0'}
        </p>
      ))}
    </div>
  )
}

function ImageBlock({
  props,
  layout,
}: {
  props: ImageBlockProps
  layout: PageBlock['layout']
}) {
  if (!props.src) return null

  return (
    <div
      className={widthClass(layout.width)}
      style={{
        marginTop: layout.marginTop,
        marginBottom: layout.marginBottom,
        paddingLeft: layout.paddingX,
        paddingRight: layout.paddingX,
      }}
    >
      <div style={{ aspectRatio: props.aspectRatio }} className="overflow-hidden">
        <Image
          src={props.src}
          alt={props.alt || ''}
          width={1200}
          height={800}
          className="w-full h-full"
          style={{ objectFit: props.objectFit }}
        />
      </div>
    </div>
  )
}

function ThreeJSBlock({
  props,
  layout,
}: {
  props: ThreeJSBlockProps
  layout: PageBlock['layout']
}) {
  const componentMap: Record<string, React.ComponentType> = {
    ArchitecturalWireframe,
    InteractiveRelight,
    ProjectSphere: ProjectSpherePlaceholder,
  }

  const Component = componentMap[props.component]
  if (!Component) return null

  return (
    <div
      className={widthClass(layout.width)}
      style={{
        marginTop: layout.marginTop,
        marginBottom: layout.marginBottom,
        paddingLeft: layout.paddingX,
        paddingRight: layout.paddingX,
        height: props.height,
      }}
    >
      <Component />
    </div>
  )
}

function SpacerBlock({
  props,
  layout,
}: {
  props: SpacerBlockProps
  layout: PageBlock['layout']
}) {
  return (
    <div
      className={widthClass(layout.width)}
      style={{
        height: props.height,
        marginTop: layout.marginTop,
        marginBottom: layout.marginBottom,
      }}
    />
  )
}

import { useState, useEffect } from 'react'

function SlideshowBlock({
  props,
  layout,
}: {
  props: import('@/lib/types').SlideshowBlockProps
  layout: PageBlock['layout']
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!props.images || props.images.length === 0) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % props.images.length)
    }, props.delay || 3000)
    return () => clearInterval(timer)
  }, [props.images, props.delay])

  if (!props.images || props.images.length === 0) return null

  return (
    <div
      className={widthClass(layout.width)}
      style={{
        marginTop: layout.marginTop,
        marginBottom: layout.marginBottom,
        paddingLeft: layout.paddingX,
        paddingRight: layout.paddingX,
      }}
    >
      <div style={{ aspectRatio: props.aspectRatio }} className="overflow-hidden relative bg-warm">
        {props.images.map((img, i) => (
          <Image
            key={i}
            src={img.src}
            alt={img.alt || ''}
            fill
            loading="lazy"
            className={`object-cover transition-opacity duration-1000 ${
              i === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* Indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {props.images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Renderer ───────────────────────────────────────────────────────────

export default function PageRenderer({
  blocks,
  textStyles,
}: {
  blocks: PageBlock[]
  textStyles: TextStyle[]
}) {
  if (!blocks || blocks.length === 0) return null

  const sorted = [...blocks].sort((a, b) => a.order - b.order)

  return (
    <div className="page-renderer flex flex-wrap w-full items-start">
      {sorted.map((block) => {
        switch (block.type) {
          case 'text': {
            const props = block.props as TextBlockProps
            const style = props.styleId
              ? textStyles.find((s) => s.id === props.styleId)
              : undefined
            return (
              <TextBlock
                key={block.id}
                props={props}
                style={style}
                layout={block.layout}
              />
            )
          }
          case 'image':
            return (
              <ImageBlock
                key={block.id}
                props={block.props as ImageBlockProps}
                layout={block.layout}
              />
            )
          case 'threejs':
            return (
              <ThreeJSBlock
                key={block.id}
                props={block.props as ThreeJSBlockProps}
                layout={block.layout}
              />
            )
          case 'spacer':
            return (
              <SpacerBlock
                key={block.id}
                props={block.props as SpacerBlockProps}
                layout={block.layout}
              />
            )
          case 'slideshow':
            return (
              <SlideshowBlock
                key={block.id}
                props={block.props as import('@/lib/types').SlideshowBlockProps}
                layout={block.layout}
              />
            )
          default:
            return null
        }
      })}
    </div>
  )
}
