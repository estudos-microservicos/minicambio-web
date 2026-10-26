import { createContext } from 'react'

export type Announce = (message: string) => void

// Fora do LiveAnnouncer (ex.: componente renderizado isolado) o anúncio simplesmente não acontece.
export const AnnouncerContext = createContext<Announce>(() => {})
