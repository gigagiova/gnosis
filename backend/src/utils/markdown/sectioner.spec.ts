import { SectionedMarkdown } from './sectioner'

describe('SectionedMarkdown', () => {
  // Test basic markdown sectioning
  describe('constructor', () => {
    it('should correctly section markdown by headings', () => {
      // Create test markdown with headings - fix indentation and whitespace
      const markdown = `# Heading 1
This is content under heading 1.

## Heading 2
This is content under heading 2.

# Another Heading 1
This is more content.`

      const sectioned = new SectionedMarkdown(markdown)
      
      // The getMarkdownWithDelimiters output can help us verify correct sectioning
      const output = sectioned.getMarkdownWithDelimiters()
      
      // Verify that we have one section for each heading
      expect(output.match(/<!-- section:\d+ start -->/g)?.length).toBe(3)
    })

    it('should break large sections into smaller ones', () => {
      // Create a very large content section that should be broken up
      // Need much more content to trigger the breakpoint logic
      const largeContent = 'Lorem ipsum dolor sit amet.\n'.repeat(500)
      const markdown = `# Heading 1\n${largeContent}`
      
      const sectioned = new SectionedMarkdown(markdown)
      const output = sectioned.getMarkdownWithDelimiters()
      
      // Should have more than 1 section despite having only 1 heading
      expect(output.match(/<!-- section:\d+ start -->/g)?.length).toBeGreaterThan(1)
    })

    it('should not create empty sections for consecutive headings', () => {
      // Create markdown with consecutive headings and no content between some of them
      const markdown = `# Heading 1
This is content under heading 1.

## Heading 2
  
## Heading 3

This content belongs to Heading 3.

# Heading 4
`

      const sectioned = new SectionedMarkdown(markdown)
      const output = sectioned.getMarkdownWithDelimiters()
      
      // Extract sections from output to check their content
      const sectionPattern = /<!-- section:\d+ start -->([\s\S]*?)<!-- section:\d+ end -->/g
      let match
      let emptySectionsCount = 0
      
      // Iterate through all sections to check for emptiness
      while ((match = sectionPattern.exec(output)) !== null) {
        const sectionContent = match[1].trim()
        // If we find an empty section, increment our counter
        if (sectionContent.length === 0) {
          emptySectionsCount++
        }
      }
      
      // Verify no empty sections were created
      expect(emptySectionsCount).toBe(0)
      
      // Also verify that we have the expected number of sections
      expect(output.match(/<!-- section:\d+ start -->/g)?.length).toBe(4)
    })
  })

  // Test the getMarkdownWithDelimiters method
  describe('getMarkdownWithDelimiters', () => {
    it('should add proper section delimiters', () => {
      const markdown = `# Test Heading\nThis is test content.`
      const sectioned = new SectionedMarkdown(markdown)
      
      const output = sectioned.getMarkdownWithDelimiters()
      
      // Check that the output has the expected format
      expect(output).toContain('<!-- section:0 start -->')
      expect(output).toContain('# Test Heading')
      expect(output).toContain('This is test content.')
      expect(output).toContain('<!-- section:0 end -->')
    })
    
    it('should preserve section indices in delimiters', () => {
      const markdown = `# First Section\nContent 1\n\n# Second Section\nContent 2`
      const sectioned = new SectionedMarkdown(markdown)
      
      const output = sectioned.getMarkdownWithDelimiters()
      
      // Use more flexible regex patterns that account for potential whitespace differences
      expect(output).toMatch(/<!-- section:0 start -->[^\n]*\n[^\n]*# First Section[^\n]*\nContent 1/)
      expect(output).toMatch(/<!-- section:1 start -->[^\n]*\n[^\n]*# Second Section[^\n]*\nContent 2/)
    })
  })

  // Test applyDiffs method
  describe('applyDiffs', () => {
    it('should correctly apply replacement diffs', () => {
      const markdown = `# Section 1\nOriginal content.\n\n# Section 2\nMore content.`
      const sectioned = new SectionedMarkdown(markdown)
      
      // Apply a diff to replace content in the first section
      const result = sectioned.applyDiffs([{
        type: 'replace',
        sectionIndex: 0,
        content: '# Section 1\nUpdated content.'
      }])
      
      expect(result).toContain('# Section 1\nUpdated content.')
      expect(result).toContain('# Section 2\nMore content.')
    })
    
    it('should correctly apply insertion diffs', () => {
      const markdown = `# Section 1\nContent 1.`
      const sectioned = new SectionedMarkdown(markdown)
      
      // Apply a diff to insert content after the first section
      const result = sectioned.applyDiffs([{
        type: 'insert',
        sectionIndex: 0,
        content: '# Section 2\nInserted content.'
      }])
      
      expect(result).toContain('# Section 1\nContent 1.')
      expect(result).toContain('# Section 2\nInserted content.')
    })
    
    it('should correctly apply deletion diffs', () => {
      const markdown = `# Section 1\nContent 1.\n\n# Section 2\nContent 2.`
      const sectioned = new SectionedMarkdown(markdown)
      
      // Apply a diff to delete the first section
      const result = sectioned.applyDiffs([{
        type: 'delete',
        sectionIndex: 0
      }])
      
      expect(result).not.toContain('# Section 1\nContent 1.')
      expect(result).toContain('# Section 2\nContent 2.')
    })

    it('Should insert sections when empty', () => {
      const sectioned = new SectionedMarkdown("")
      
      const result = sectioned.applyDiffs([{
        type: 'insert',
        sectionIndex: 0,
        content: '# Section 1\nContent 1.'
      }])
      
      expect(result).toContain('# Section 1\nContent 1.')
    })
  })
}) 