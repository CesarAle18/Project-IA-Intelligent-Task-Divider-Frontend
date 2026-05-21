"use client"

interface PageHeaderProps {
  title: string
  description?: string
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="px-4 md:px-6 py-4">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
  )
}
