"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronRight } from "lucide-react"

interface DropdownMenuContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null)

function DropdownMenu({
  children,
  open: controlledOpen,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      {children}
    </DropdownMenuContext.Provider>
  )
}

function DropdownMenuTrigger({
  children,
  asChild,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const ctx = React.useContext(DropdownMenuContext)

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<{ onClick?: () => void }>
    return React.cloneElement(child, {
      onClick: () => ctx?.setOpen(!ctx.open),
    })
  }

  return (
    <button onClick={() => ctx?.setOpen(!ctx.open)} {...props}>
      {children}
    </button>
  )
}

function DropdownMenuContent({
  className,
  children,
  align = "center",
  ...props
}: React.ComponentProps<"div"> & { align?: "start" | "center" | "end" }) {
  const ctx = React.useContext(DropdownMenuContext)
  if (!ctx?.open) return null

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => ctx.setOpen(false)} />
      <div
        data-slot="dropdown-menu-content"
        className={cn(
          "absolute z-50 mt-1 min-w-[12rem] rounded-xl border border-border/50 bg-card shadow-lg backdrop-blur-xl p-1",
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  )
}

function DropdownMenuItem({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="dropdown-menu-item"
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors text-muted-foreground hover:text-foreground hover:bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-menu-separator"
      className={cn("my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
