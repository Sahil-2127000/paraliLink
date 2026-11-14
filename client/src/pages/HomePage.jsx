import { ClosingCta } from '../features/home/ClosingCta'
import { Faq } from '../features/home/Faq'
import { Hero } from '../features/home/Hero'
import { Process } from '../features/home/Process'
import { Roles } from '../features/home/Roles'
import { Statement } from '../features/home/Statement'
import { System } from '../features/home/System'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Statement />
      <Process />
      <System />
      <Roles />
      <Faq />
      <ClosingCta />
    </>
  )
}
