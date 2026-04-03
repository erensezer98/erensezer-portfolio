export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { EDITABLE_PAGES } from '@/lib/types'

export default function PageEditorIndex() {
  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs tracking-widest uppercase text-muted mb-2">admin / page editor</p>
        <h1 className="text-4xl font-light text-ink">Page Editor</h1>
      </div>

      <div className="border border-rule bg-warm/60 px-6 py-4 text-xs text-muted leading-relaxed">
        <span className="text-ink font-medium">Visual Editor:</span>{' '}
        Choose a page below to open the drag-and-drop editor. You can add text blocks,
        image containers, Three.js scenes, and spacers — then rearrange them freely.
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {EDITABLE_PAGES.map((page) => (
          <Link
            key={page.slug}
            href={`/admin/page-editor/${page.slug}`}
            className="group border border-rule bg-white hover:border-ink transition-colors duration-200 block"
          >
            <div className="px-6 py-8 text-center">
              <div className="w-12 h-12 mx-auto mb-4 border border-rule bg-warm flex items-center justify-center">
                <span className="text-lg text-muted group-hover:text-ink transition-colors">
                  {page.slug === 'home' ? '⌂' : page.slug === 'about' ? '≡' : '✉'}
                </span>
              </div>
              <p className="text-[13px] text-ink font-medium">{page.label}</p>
              <p className="text-xs text-muted mt-1">/{page.slug === 'home' ? '' : page.slug}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
