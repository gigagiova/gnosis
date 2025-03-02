/**
 * Represents a diff operation to be applied to sectioned markdown
 */
export interface MarkdownDiff {
  /** The type of diff operation */
  type: 'replace' | 'insert' | 'delete'
  
  /** The section index to apply the diff to */
  sectionIndex: number
  
  /** The content for replace/insert operations (undefined for delete) */
  content?: string
} 