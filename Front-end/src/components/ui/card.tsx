import * as React from "react"
import { Heart, Share2, ExternalLink, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { Button } from "./button"

const cardVariants = cva(
  // base
  "group relative rounded-2xl border transition-all duration-300 bg-white backdrop-blur-sm overflow-hidden text-gray-900",
  {
    variants: {
      variant: {
        elevated:
          "shadow-lg hover:shadow-2xl hover:-translate-y-2 border-gray-200/60 hover:border-[#4CA771]/30 bg-gradient-to-br from-white to-gray-50/30 text-[#013237]",
        outline:
          "shadow-sm border-gray-200 bg-white hover:shadow-md hover:border-[#4CA771]/40 text-[#013237]",
        glass:
          "border-white/40 bg-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.37)] backdrop-blur-lg hover:bg-white/70 text-[#013237]",
        interactive:
          "shadow-lg hover:shadow-2xl hover:-translate-y-3 border-[#C0E6BA]/50 hover:border-[#4CA771] bg-gradient-to-br from-[#EAF9E7]/80 to-white hover:from-[#EAF9E7] hover:to-[#C0E6BA]/20 cursor-pointer text-[#013237]",
        product:
          "shadow-md hover:shadow-xl hover:-translate-y-1 border-[#C0E6BA]/40 hover:border-[#4CA771]/60 bg-gradient-to-b from-white to-[#EAF9E7]/30 hover:from-[#EAF9E7]/50 hover:to-white text-[#013237]",
        featured:
          "shadow-xl hover:shadow-2xl hover:-translate-y-2 border-[#4CA771]/30 bg-gradient-to-br from-[#EAF9E7] via-white to-[#C0E6BA]/20 ring-2 ring-[#4CA771]/10 hover:ring-[#4CA771]/30 text-[#013237]",
      },
      size: {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        full: "w-full",
      },
      responsive: {
        true: "w-full sm:max-w-sm md:max-w-md lg:max-w-lg",
        false: "",
      },
    },
    defaultVariants: {
      variant: "elevated",
      size: "md",
      responsive: true,
    },
  }
)

interface CardActionsProps {
  onFavorite?: () => void
  onShare?: () => void
  onExternalLink?: () => void
  isFavorited?: boolean
  showActions?: boolean
  rating?: number
  onRatingChange?: (rating: number) => void
}

type CardProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants> &
  CardActionsProps

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    size, 
    responsive, 
    onFavorite, 
    onShare, 
    onExternalLink, 
    isFavorited = false, 
    showActions = false,
    rating,
    onRatingChange,
    children,
    ...props 
  }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, size, responsive }), className)}
      {...props}
    >
      {showActions && (
        <div className="absolute top-3 right-3 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {onFavorite && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 rounded-full backdrop-blur-sm transition-all duration-200",
                isFavorited 
                  ? "bg-red-500/90 text-white hover:bg-red-600" 
                  : "bg-white/80 text-gray-600 hover:bg-white hover:text-red-500"
              )}
              onClick={(e) => {
                e.stopPropagation()
                onFavorite()
              }}
            >
              <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
            </Button>
          )}
          {onShare && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full bg-white/80 text-gray-600 hover:bg-white hover:text-[#4CA771] backdrop-blur-sm transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation()
                onShare()
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
          {onExternalLink && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full bg-white/80 text-gray-600 hover:bg-white hover:text-[#4CA771] backdrop-blur-sm transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation()
                onExternalLink()
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      {rating !== undefined && onRatingChange && (
        <div className="absolute top-3 left-3 z-10 flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              className="transition-all duration-200 hover:scale-110"
              onClick={(e) => {
                e.stopPropagation()
                onRatingChange(star)
              }}
            >
              <Star 
                className={cn(
                  "h-4 w-4 transition-colors duration-200",
                  star <= rating 
                    ? "text-yellow-400 fill-yellow-400" 
                    : "text-gray-300 hover:text-yellow-300"
                )} 
              />
            </button>
          ))}
        </div>
      )}
      {children}
    </div>
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    compact?: boolean
    centered?: boolean
    withBorder?: boolean
  }
>(({ className, compact, centered, withBorder, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-2", 
      compact ? "p-4" : "p-6",
      centered && "text-center items-center",
      withBorder && "border-b border-gray-100",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    size?: "sm" | "md" | "lg" | "xl"
    gradient?: boolean
  }
>(({ className, size = "md", gradient, ...props }, ref) => {
  const sizeClasses = {
    sm: "text-lg font-semibold",
    md: "text-xl font-semibold",
    lg: "text-2xl font-bold",
    xl: "text-3xl font-bold"
  }
  
  return (
    <h3
      ref={ref}
      className={cn(
        "leading-tight tracking-tight transition-colors duration-200",
        sizeClasses[size],
        gradient && "bg-gradient-to-r from-[#013237] to-[#4CA771] bg-clip-text text-transparent",
        !gradient && "text-[#013237] group-hover:text-[#4CA771]",
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    size?: "sm" | "md" | "lg"
    muted?: boolean
  }
>(({ className, size = "md", muted = true, ...props }, ref) => {
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }
  
  return (
    <p
      ref={ref}
      className={cn(
        "leading-relaxed transition-colors duration-200",
        sizeClasses[size],
        muted ? "text-[#4CA771] group-hover:text-[#013237]" : "text-[#013237]",
        className
      )}
      {...props}
    />
  )
})
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    compact?: boolean
    noPadding?: boolean
    centered?: boolean
  }
>(({ className, compact, noPadding, centered, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      !noPadding && (compact ? "p-4 pt-0" : "p-6 pt-0"),
      centered && "flex flex-col items-center text-center",
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    compact?: boolean
    justify?: "start" | "center" | "end" | "between" | "around"
    withBorder?: boolean
    sticky?: boolean
  }
>(({ className, compact, justify = "start", withBorder, sticky, ...props }, ref) => {
  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around"
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-2",
        compact ? "p-4 pt-2" : "p-6 pt-4",
        justifyClasses[justify],
        withBorder && "border-t border-gray-100 mt-4",
        sticky && "sticky bottom-0 bg-white/95 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  )
})
CardFooter.displayName = "CardFooter"

// Componente de Badge para Cards
const CardBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "success" | "warning" | "error" | "info"
    size?: "sm" | "md" | "lg"
  }
>(({ className, variant = "default", size = "sm", ...props }, ref) => {
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-[#EAF9E7] text-[#4CA771] border border-[#C0E6BA]",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    error: "bg-red-100 text-red-800 border border-red-200",
    info: "bg-blue-100 text-blue-800 border border-blue-200"
  }
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-colors duration-200",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
})
CardBadge.displayName = "CardBadge"

// Componente de imagem otimizada para Cards
const CardImage = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    src: string
    alt: string
    aspectRatio?: "square" | "video" | "portrait" | "landscape"
    objectFit?: "cover" | "contain" | "fill"
    overlay?: boolean
  }
>(({ className, src, alt, aspectRatio = "landscape", objectFit = "cover", overlay, ...props }, ref) => {
  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]"
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden bg-gray-100",
        aspectClasses[aspectRatio],
        className
      )}
      {...props}
    >
      <img
        src={src}
        alt={alt}
        className={cn(
          "h-full w-full transition-transform duration-300 group-hover:scale-105",
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill"
        )}
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </div>
  )
})
CardImage.displayName = "CardImage"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardBadge,
  CardImage,
  type CardActionsProps
}
