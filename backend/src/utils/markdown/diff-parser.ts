import { MarkdownDiff } from './types'
/**
 * Parses XML diff tags from AI responses into structured diff operations
 */
export class DiffParser {
  /**
   * Extracts diff operations from AI response text
   * @param text The AI response text containing XML diff tags
   * @returns Array of parsed diff operations
   */
  public static parseDiffs(text: string): Array<MarkdownDiff> {
    const diffs: Array<MarkdownDiff> = []

    // Match both self-closing tags and regular tags with content
    const selfClosingRegex = /<diff\s+type="(replace|insert|delete)"\s+section="(\d+)"\s*\/>/g
    const regularTagRegex = /<diff\s+type="(replace|insert|delete)"\s+section="(\d+)">([\s\S]*?)<\/diff>/g
    
    // Process self-closing tags first, which currently only have a delete operation
    Array.from(text.matchAll(selfClosingRegex)).forEach(match => {
      const type = match[1] as 'delete'
      const sectionIndex = parseInt(match[2], 10)
      diffs.push({type, sectionIndex, content: undefined})
    })
    
    // Then process regular tags with content
    Array.from(text.matchAll(regularTagRegex)).forEach(match => {
      const type = match[1] as 'replace' | 'insert'
      const sectionIndex = parseInt(match[2], 10)
      diffs.push({type, sectionIndex, content: match[3].trim()})
    })
    
    return diffs
  }
}