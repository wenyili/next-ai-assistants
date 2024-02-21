'use client'

import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "../ui/select"
import { useModel } from '@/app/lib/model'
import { usePathname } from 'next/navigation'

export default function () {
  const { model, setModel, models } = useModel()
  const path = usePathname()
  const disable = path.startsWith("/gen-image")
  return (
    !disable && (<form>
      <div className="flex items-center justify-between">
        <Select value={model} onValueChange={setModel}>
          <SelectTrigger className="SelectTrigger"> 
            <SelectValue>{model}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem value={model} key={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </form>)
  )
}