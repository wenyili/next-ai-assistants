'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { ThemeProviderProps } from 'next-themes/dist/types'

import { ModelProvider } from '@/app/lib/model'

import { TooltipProvider } from '@/app/ui/tooltip'

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <TooltipProvider>
        <ModelProvider>{children}</ModelProvider>
      </TooltipProvider>
    </NextThemesProvider>
  )
}
