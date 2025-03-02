import { MinusIcon, PlusIcon, TrashIcon, PencilIcon } from 'lucide-react'
import React, { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
/**
 * Interface for parsed diff tags
 */
interface DiffTag {
  type: string
  content: string
  fullMatch: string
}

/**
 * Renders a diff tag as a box with type header and content
 * If content is empty, only the header will be displayed
 */
export const DiffBox = ({ type, content }: { type: string; content: string }) => {
  // Function to render the appropriate icon based on diff type
  const renderIcon = () => {
    switch (type.toLowerCase()) {
      case 'insert':
        return <PlusIcon className="w-3 h-3" />
      case 'delete':
        return <TrashIcon className="w-3 h-3" />
      case 'replace':
        return <PencilIcon className="w-3 h-3" />
    }
  }

  return (
    <div className="mt-2 mb-2 border border-neutral-600 rounded-md overflow-hidden">
      {/* Header showing the diff type with icon */}
      <div className="bg-neutral-700 px-3 py-1 text-xs font-medium text-neutral-300 uppercase flex items-center gap-1.5">
        {renderIcon()}
        {type}
      </div>
      {/* Content section - only rendered when content exists */}
      {content && (
        <div className="p-3 text-sm bg-neutral-800 whitespace-pre-wrap">
          <ReactMarkdown
            components={{
              // Custom heading components with proportionally small sizes
              h1: ({node, ...props}) => <h1 className="text-xl font-bold" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-lg font-bold" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-base font-bold" {...props} />
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}

/**
 * Parses content for diff tags and returns a mix of text and DiffBox components
 */
export const RenderMessageContent = ({ content }: { content: string }) => {
  // Use useMemo to cache the parsed result and only recalculate when content changes
  const renderedContent = useMemo(() => {
    // Regular expression to match opening diff tags
    const openDiffRegex = /<diff\s+/g
    
    // Find all diff tag opening positions
    const positions: number[] = []
    let openMatch: RegExpExecArray | null
    
    while ((openMatch = openDiffRegex.exec(content)) !== null) {
      positions.push(openMatch.index)
    }
    
    // If no diff tags, just return the content
    if (positions.length === 0) {
      return [<span key="text-only">{content}</span>]
    }
    
    // Parse each diff tag and prepare content for rendering
    const diffs: DiffTag[] = []
    
    positions.forEach((startPos, idx) => {
      // Find the next opening tag or end of content
      const nextPos = idx < positions.length - 1 ? positions[idx + 1] : content.length
      
      // Extract the substring containing this diff tag
      const substring = content.substring(startPos, nextPos)
      
      // Check if the tag is self-closing or has a closing tag
      const isSelfClosing = substring.includes('/>')
      const hasClosingTag = substring.includes('</diff>')
      
      // Extract type attribute
      const typeMatch = substring.match(/type="([^"]+)"/)
      const type = typeMatch ? typeMatch[1] : 'unknown'
      
      let diffContent: string
      let fullMatch: string
      
      if (isSelfClosing) {
        // Handle self-closing tag
        const closePos = substring.indexOf('/>') + 2
        fullMatch = substring.substring(0, closePos)
        diffContent = '' // No content for self-closing tag
      } else if (hasClosingTag) {
        // Handle tag with proper closing
        const closePos = substring.indexOf('</diff>') + 7
        fullMatch = substring.substring(0, closePos)
        
        // Extract content between opening and closing tags
        const contentStartPos = substring.indexOf('>') + 1
        const contentEndPos = substring.indexOf('</diff>')
        diffContent = substring.substring(contentStartPos, contentEndPos)
      } else {
        // Handle unclosed tag - treat everything after the opening tag as content
        const contentStartPos = substring.indexOf('>') + 1
        
        // If we can't find '>', use the end of the type declaration as a fallback
        const openingEnds = contentStartPos > 0 ? 
                            contentStartPos : 
                            (typeMatch ? startPos + typeMatch[0].length + 1 : startPos + 5)
        
        diffContent = substring.substring(openingEnds)
        fullMatch = substring
      }
      
      diffs.push({
        type,
        content: diffContent,
        fullMatch: content.substring(startPos, startPos + fullMatch.length)
      })
    })
    
    // Split the content by diff tags and render each piece
    const result: React.ReactNode[] = []
    let lastIndex = 0
    
    diffs.forEach((diff, index) => {
      // Add text before the diff tag
      const startIndex = content.indexOf(diff.fullMatch, lastIndex)
      if (startIndex > lastIndex) {
        result.push(
          <span key={`text-${index}`}>
            {content.substring(lastIndex, startIndex)}
          </span>
        )
      }
      
      // Add the diff box
      result.push(
        <DiffBox key={`diff-${index}`} type={diff.type} content={diff.content} />
      )
      
      // Update the last index
      lastIndex = startIndex + diff.fullMatch.length
    })
    
    // Add any remaining text
    if (lastIndex < content.length) {
      result.push(
        <span key="text-last">
          {content.substring(lastIndex)}
        </span>
      )
    }
    
    return result
  }, [content]) // Only recalculate when content changes
  
  return <>{renderedContent}</>
} 