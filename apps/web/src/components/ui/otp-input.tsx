'use client'

import { cn } from '@/lib/utils'
import { useRef, KeyboardEvent, ClipboardEvent, ChangeEvent } from 'react'

interface OTPInputProps {
    value: string
    onChange: (value: string) => void
    length?: number
    disabled?: boolean
    className?: string
}

/**
 * Professional OTP Input with individual boxes for each digit
 * Supports: keyboard navigation, paste, auto-focus next
 */
export function OTPInput({
    value,
    onChange,
    length = 6,
    disabled = false,
    className,
}: OTPInputProps) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Split value into array of digits
    const digits = value.split('').slice(0, length)
    while (digits.length < length) {
        digits.push('')
    }

    const focusInput = (index: number) => {
        if (index >= 0 && index < length) {
            inputRefs.current[index]?.focus()
        }
    }

    const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value

        // Only allow digits
        if (inputValue && !/^\d$/.test(inputValue)) {
            return
        }

        const newDigits = [...digits]
        newDigits[index] = inputValue
        onChange(newDigits.join(''))

        // Auto-focus next input
        if (inputValue && index < length - 1) {
            focusInput(index + 1)
        }
    }

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (!digits[index] && index > 0) {
                // If current input is empty, go to previous
                focusInput(index - 1)
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault()
            focusInput(index - 1)
        } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            focusInput(index + 1)
        }
    }

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text')
        const digits = pastedData.replace(/\D/g, '').slice(0, length)

        if (digits) {
            onChange(digits)
            // Focus last filled input or the next empty one
            focusInput(Math.min(digits.length, length - 1))
        }
    }

    const handleFocus = (index: number) => {
        inputRefs.current[index]?.select()
    }

    return (
        <div className={cn('flex justify-center w-full overflow-hidden', className)}>
            <div className="flex border border-input rounded-lg bg-background/50 backdrop-blur-sm overflow-hidden w-full max-w-[400px] shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary">
                {digits.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(index, e)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        onFocus={() => handleFocus(index)}
                        disabled={disabled}
                        className={cn(
                            'flex-1 min-w-0 h-12 text-center text-lg font-mono font-bold',
                            'bg-transparent outline-none transition-all duration-200',
                            'border-r border-input/30 last:border-r-0',
                            'focus:bg-accent/20 focus:text-primary',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            'sm:h-14 sm:text-xl'
                        )}
                        aria-label={`Digit ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
