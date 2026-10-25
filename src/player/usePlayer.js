import { useContext } from 'react'
import { PlayerContext } from './playerState'

export function usePlayer() {
  const value = useContext(PlayerContext)
  if (!value) throw new Error('usePlayer must be used inside PlayerProvider')
  return value
}
