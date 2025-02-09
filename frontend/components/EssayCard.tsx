import Link from 'next/link'
import { Essay } from '@gnosis/models'
import ReactMarkdown from 'react-markdown'

// Props interface for the EssayCard component
interface EssayCardProps {
  essay: Essay
}

// Props interface for CreateNewCard component
interface CreateNewCardProps {
  onCreate: () => Promise<void>
}

// EssayCard component that displays an individual essay in a card format
export function EssayCard({ essay }: EssayCardProps) {
  // Take the first 300 characters of content as preview
  const contentPreview = essay.contents.slice(0, 300) + (essay.contents.length > 300 ? '...' : '')

  return (
    <Link 
      href={`/e/${essay.id}`} 
      className="block no-underline group"
    >
      <div className="h-[280px] rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer overflow-hidden flex flex-col">
        {/* Preview Section */}
        <div className="flex-1 p-6 text-muted-foreground text-sm overflow-hidden prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-headings:font-serif">
          <ReactMarkdown>
            {contentPreview}
          </ReactMarkdown>
        </div>
        
        {/* Title Section */}
        <div className="p-4 border-t border-border bg-background/50 group-hover:bg-accent/30 transition-colors">
          <h2 className="font-serif text-base font-bold text-card-foreground leading-snug tracking-tight truncate">
            {essay.title || "Untitled"}
          </h2>
          <div className="flex justify-between text-muted-foreground text-xs mt-1">
            <span>Created {new Date(essay.created_at).toLocaleDateString()}</span>
            <span>Updated {new Date(essay.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Create New Card Component
export function CreateNewCard({ onCreate }: CreateNewCardProps) {
  return (
    <form action={onCreate}>
      <button 
        type="submit"
        className="w-full h-[280px] rounded-lg border border-dashed border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer overflow-hidden flex flex-col items-center justify-center group"
      >
        <div className="text-4xl text-muted-foreground mb-2 group-hover:scale-110 transition-transform">+</div>
        <div className="text-muted-foreground font-medium">Create new essay</div>
      </button>
    </form>
  )
} 