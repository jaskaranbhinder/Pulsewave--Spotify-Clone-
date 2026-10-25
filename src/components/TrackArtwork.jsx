import { useState } from 'react'
import { Music2 } from 'lucide-react'

const fallbackArtwork = '/artwork/track-artwork-placeholder.svg'

export default function TrackArtwork({ track, className = '', placeholderClassName = 'track-art-placeholder', alt = '' }) {
  const [failedSource, setFailedSource] = useState('')
  const originalSource = track?.artwork || ''
  const useFallback = !originalSource || failedSource === originalSource
  const source = useFallback ? fallbackArtwork : originalSource

  if (failedSource === fallbackArtwork) {
    return <span className={placeholderClassName} aria-hidden="true"><Music2 size={22}/></span>
  }

  return <img
    className={useFallback ? `${placeholderClassName} artwork-fallback-image` : className}
    src={source}
    alt={alt}
    onError={() => setFailedSource(source)}
  />
}
