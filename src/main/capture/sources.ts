import { desktopCapturer } from 'electron'
import type { DesktopSource } from '../../shared/types'

export async function getDesktopSources(): Promise<DesktopSource[]> {
  const sources = await desktopCapturer.getSources({
    types: ['screen', 'window'],
    thumbnailSize: { width: 320, height: 180 },
    fetchWindowIcons: true
  })

  return sources.map((source) => ({
    id: source.id,
    name: source.name,
    thumbnailDataUrl: source.thumbnail.toDataURL(),
    displayId: source.display_id,
    appIcon: source.appIcon?.toDataURL()
  }))
}
