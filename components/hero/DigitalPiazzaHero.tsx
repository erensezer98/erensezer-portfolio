'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'

const DigitalPiazza = dynamic(() => import('@/components/three/DigitalPiazza'), {
  ssr: false,
})

export default function DigitalPiazzaHero() {
  const [maxTally, setMaxTally] = useState<number>(1)

  return (
    <section className="relative min-h-[100vh] w-full flex items-center pt-28 pb-14 px-6 md:px-10 overflow-hidden">
      <DigitalPiazza onMaxTallyChange={setMaxTally} />
      
      {/* UI Layer on top of canvas */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between pointer-events-none">
        
        <div className="max-w-[600px] pointer-events-auto">
          <h1 className="mb-6 text-[clamp(2.5rem,5vw,4rem)] font-normal leading-[1.04] tracking-[-0.04em] text-ink lowercase">
            digital piazza
          </h1>
          
          <p className="text-[17px] font-medium leading-relaxed text-muted lowercase mb-8">
            we use piazzas in the cities to go around and circulate, here is a digital one. 
            the cursor footprints on the piazza are being recorded and can be used (?).
          </p>
          
          {/* Legend and stats */}
          <div className="flex items-center gap-4 text-xs font-medium text-muted lowercase tracking-widest mt-8">
            <span>untouched</span>
            <div className="w-32 h-2 rounded-full bg-gradient-to-r from-[#eeeeee] via-[#0044aa] to-[#aa0044]" />
            <span>peak traffic</span>
          </div>
          
          <div className="mt-4 text-sm font-medium text-ink lowercase">
            peak node: <span className="text-[#aa0044] font-bold text-lg">{maxTally}</span>
          </div>
        </div>

      </div>
    </section>
  )
}
