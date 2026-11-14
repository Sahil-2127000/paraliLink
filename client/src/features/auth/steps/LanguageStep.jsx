import { cn } from '../../../lib/cn'
import { PrimaryAction } from '../components/PrimaryAction'
import { StepHeading } from '../components/StepHeading'
import { COPY, LANGUAGE_OPTIONS } from '../copy'

export function LanguageStep({ language, onChange, onNext }) {
  function submit(e) {
    e.preventDefault()
    onNext()
  }

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col">
      <StepHeading copy={COPY.language} language={language} />
      <fieldset className="mt-8">
        <legend className="sr-only">Language</legend>
        <div className="border-t border-soil/15">
          {LANGUAGE_OPTIONS.map((option) => {
            const selected = option.id === language
            return (
              <label
                key={option.id}
                className={cn(
                  'flex h-16 cursor-pointer items-center justify-between border-b border-soil/15 px-4 transition-colors',
                  selected ? 'bg-forest text-paper' : 'hover:bg-husk',
                )}
              >
                <input type="radio" name="language" value={option.id} checked={selected} onChange={() => onChange(option.id)} className="sr-only" />
                <span className="flex items-baseline gap-3">
                  <span lang={option.id} className="pa text-[22px] font-semibold">
                    {option.native}
                  </span>
                  {option.id !== 'en' && (
                    <span lang="en" className="label opacity-75">
                      {option.english}
                    </span>
                  )}
                </span>
                <span aria-hidden="true" className="grid size-5 place-items-center border-2 border-current">
                  <span className={cn('size-2.5', selected && 'bg-straw')} />
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
      <div className="mt-auto pt-10">
        <PrimaryAction copy={COPY.continue} language={language} />
      </div>
    </form>
  )
}
