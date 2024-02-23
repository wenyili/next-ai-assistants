'use client'

import { Select, SelectTrigger, SelectItem, SelectContent, SelectValue } from "../ui/select"
import { useModel } from '@/app/lib/model'
import { usePathname } from 'next/navigation'

function ModelType() {
  const { model, setModel, models } = useModel()
  const path = usePathname()
  return (
    <form>
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
    </form>
  )
}

ModelType.displayname = 'ModelType';
export default ModelType;