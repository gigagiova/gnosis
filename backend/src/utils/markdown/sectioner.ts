import { MarkdownDiff } from './types'

/**
 * Class for handling markdown sectioning and reassembly
 * Breaks markdown into logical sections based on headings and length
 */
export class SectionedMarkdown {
  private sections: Array<{index: number, content: string}> = []

  /**
   * Creates a new SectionedMarkdown and immediately sections the content
   * @param markdown The raw markdown content to section
   */
  constructor(markdown: string) {

    // First, find all heading positions as potential breakpoints
    const headingPositions: number[] = Array.from(markdown.matchAll(/^(#{1,6} .+)$/gm)).map(match => match.index)
    
    // Add beginning and end of document to our list of breakpoints
    let breakpoints = [...new Set([0, ...headingPositions, markdown.length])].sort((a, b) => a - b)
    
    // Pre-process to break down any large slices
    breakpoints = this.preprocessLargeSlices(markdown, breakpoints)
    
    // Now create sections from our pre-processed breakpoints
    let sectionIndex = 0
    for (let i = 1; i < breakpoints.length; i++) {
      const start = breakpoints[i-1]
      const end = breakpoints[i]
      const content = markdown.substring(start, end)
      
      this.sections.push({index: sectionIndex++, content})
    }
  }
  
  /**
   * Pre-processes the document to break down large slices into manageable sections
   * @param markdown The full markdown content
   * @param initialBreakpoints The initial set of breakpoints
   * @returns Updated array of breakpoints
   */
  private preprocessLargeSlices(markdown: string, initialBreakpoints: number[]): number[] {
    const newBreakpoints: number[] = []
    
    // Process each slice between breakpoints
    for (let i = 1; i < initialBreakpoints.length; i++) {
      const start = initialBreakpoints[i-1]
      const end = initialBreakpoints[i]
      const slice = markdown.substring(start, end)

      // Add the start of the slice as a breakpoint
      newBreakpoints.push(start)
      
      // If this slice is of reasonable size, keep the original breakpoints
      if (slice.length <= 2000) continue
      
      // Break down the large slice
      const additionalBreakpoints = this.findBreakpointsForLargeSlice(slice, start)
      newBreakpoints.push(...additionalBreakpoints)
    }
    
    // Always add the final breakpoint (end of document)
    newBreakpoints.push(initialBreakpoints[initialBreakpoints.length - 1])
    
    // Returns the sorted breakpoints
    return [...new Set(newBreakpoints)].sort((a, b) => a - b)
  }
  
  /**
   * Finds appropriate breakpoints for a large slice of content
   * @param content The large content to break down
   * @param baseOffset The offset of this content in the original document
   * @returns Array of additional breakpoints
   */
  private findBreakpointsForLargeSlice(content: string, baseOffset: number): number[] {
    const additionalBreakpoints: number[] = []
    const lines = content.split('\n')
    
    let currentSize = 0
    let lastBreakpoint = 0
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineSize = line.length + (i < lines.length - 1 ? 1 : 0) // +1 for newline
      
      // If adding this line would exceed the soft limit and we have enough content
      if (currentSize + lineSize > 2000 && currentSize >= 500) {
        // Add a breakpoint at the end of the current accumulation
        additionalBreakpoints.push(baseOffset + lastBreakpoint)
        
        // Reset for next section
        lastBreakpoint += currentSize
        currentSize = lineSize
      } else {
        // Add to current section
        currentSize += lineSize
      }
    }
    
    return additionalBreakpoints
  }
  
  /**
   * Reassembles the markdown with section delimiters as HTML comments
   * @returns The markdown with section delimiters
   */
  public getMarkdownWithDelimiters(): string {
    return this.sections.map(section => 
      `<!-- section:${section.index} start -->\n${section.content}\n<!-- section:${section.index} end -->`
    ).join('\n')
  }

  /**
   * Reassembles the markdown without section delimiters
   * @returns The markdown without section delimiters
   */
  public getMarkdown(): string {
    return this.sections.map(section => section.content).join('\n')
  }
  
  /**
   * Applies diffs to the sectioned markdown
   * @param diffs Array of diff operations
   * @returns The updated markdown content
   */
  public applyDiffs(diffs: Array<MarkdownDiff>): string {
    // Create a copy of sections to modify
    const updatedSections = [...this.sections]
    
    // Apply each diff
    for (const diff of diffs) {
      const sectionIndex = updatedSections.findIndex(s => s.index === diff.sectionIndex)
      
      if (sectionIndex === -1) {
        continue // Skip if section not found
      }
      
      switch (diff.type) {
        case 'replace':
          if (diff.content) updatedSections[sectionIndex].content = diff.content
          break
          
        case 'delete':
          updatedSections.splice(sectionIndex, 1)
          break
          
        case 'insert':
          if (diff.content !== undefined) {
            // Insert after the specified section
            updatedSections.splice(sectionIndex + 1, 0, {
              index: Math.max(...updatedSections.map(s => s.index)) + 1,
              content: diff.content
            })
          }
          break
      }
    }
    
    // Reassemble the content without delimiters
    return this.getMarkdown()
  }
}
