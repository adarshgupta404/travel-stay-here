"use client"

import * as React from "react"
import { Users } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface GuestsRoomsPickerProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelectionChange?: (selection: {
    adults: number
    children: number
    rooms: number
  }) => void
}

export function GuestsRoomsPicker({ className, onSelectionChange, ...props }: GuestsRoomsPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [adults, setAdults] = React.useState(2)
  const [children, setChildren] = React.useState(0)
  const [rooms, setRooms] = React.useState(1)

  const handleIncrement = (type: "adults" | "children" | "rooms") => {
    switch (type) {
      case "adults":
        setAdults((prev) => Math.min(prev + 1, 30))
        break
      case "children":
        setChildren((prev) => Math.min(prev + 1, 10))
        break
      case "rooms":
        setRooms((prev) => Math.min(prev + 1, 30))
        break
    }
  }

  const handleDecrement = (type: "adults" | "children" | "rooms") => {
    switch (type) {
      case "adults":
        setAdults((prev) => Math.max(prev - 1, 1))
        break
      case "children":
        setChildren((prev) => Math.max(prev - 1, 0))
        break
      case "rooms":
        setRooms((prev) => Math.max(prev - 1, 1))
        break
    }
  }

  React.useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange({ adults, children, rooms })
    }
  }, [adults, children, rooms, onSelectionChange])

  const getSummaryText = () => {
    return `${adults} adult${adults !== 1 ? "s" : ""} · ${children} child${children !== 1 ? "ren" : ""} · ${rooms} room${rooms !== 1 ? "s" : ""}`
  }

  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-2 w-full cursor-pointer">
            <Users className="text-gray-400" />
            <Input
              readOnly
              value={getSummaryText()}
              className="border-0 focus-visible:ring-0 cursor-pointer"
              onClick={() => setOpen(true)}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <div className="space-y-4">
                  <CounterItem
                    label="Adults"
                    value={adults}
                    onIncrement={() => handleIncrement("adults")}
                    onDecrement={() => handleDecrement("adults")}
                    minValue={1}
                  />

                  <CounterItem
                    label="Children"
                    subLabel="Ages 0-17"
                    value={children}
                    onIncrement={() => handleIncrement("children")}
                    onDecrement={() => handleDecrement("children")}
                    minValue={0}
                  />

                  <CounterItem
                    label="Rooms"
                    value={rooms}
                    onIncrement={() => handleIncrement("rooms")}
                    onDecrement={() => handleDecrement("rooms")}
                    minValue={1}
                  />

                  {children > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2 border-t"
                    >
                      <p className="text-sm font-medium mb-2">Children's ages</p>
                      <div className="grid grid-cols-2 gap-2">
                        {Array.from({ length: children }).map((_, index) => (
                          <select key={index} className="w-full p-2 border rounded-md text-sm" defaultValue="7">
                            <option value="0">0 years old</option>
                            {Array.from({ length: 17 }).map((_, i) => (
                              <option key={i} value={i + 1}>
                                {i + 1} years old
                              </option>
                            ))}
                          </select>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <Button className="bg-blue-700 hover:bg-blue-800" onClick={() => setOpen(false)}>
                      Done
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </PopoverContent>
      </Popover>
    </div>
  )
}

interface CounterItemProps {
  label: string
  subLabel?: string
  value: number
  onIncrement: () => void
  onDecrement: () => void
  minValue: number
}

function CounterItem({ label, subLabel, value, onIncrement, onDecrement, minValue }: CounterItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        {subLabel && <p className="text-sm text-gray-500">{subLabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`w-8 h-8 flex items-center justify-center rounded-full border ${value <= minValue ? "text-gray-300 cursor-not-allowed" : "text-blue-700 border-blue-700"}`}
          onClick={onDecrement}
          disabled={value <= minValue}
        >
          -
        </motion.button>
        <span className="w-6 text-center">{value}</span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-blue-700 text-blue-700"
          onClick={onIncrement}
        >
          +
        </motion.button>
      </div>
    </div>
  )
}

