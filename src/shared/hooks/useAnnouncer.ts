import { useContext } from 'react'
import { AnnouncerContext } from '../components/announcerContext'

// Anuncia uma mensagem para leitores de tela pela região aria-live="polite" do LiveAnnouncer.
export function useAnnouncer() {
  return useContext(AnnouncerContext)
}
