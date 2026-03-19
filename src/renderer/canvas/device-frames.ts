import type { DeviceFrame } from '../../shared/types'

export const DEVICE_FRAMES: DeviceFrame[] = [
  {
    id: 'none',
    name: 'No Frame',
    imagePath: '',
    padding: { top: 0, right: 0, bottom: 0, left: 0 }
  },
  {
    id: 'macbook',
    name: 'MacBook Pro',
    imagePath: 'frames/macbook.png',
    padding: { top: 24, right: 16, bottom: 48, left: 16 }
  },
  {
    id: 'browser',
    name: 'Browser Window',
    imagePath: 'frames/browser.png',
    padding: { top: 36, right: 1, bottom: 1, left: 1 }
  },
  {
    id: 'iphone',
    name: 'iPhone',
    imagePath: 'frames/iphone.png',
    padding: { top: 60, right: 20, bottom: 60, left: 20 }
  }
]
