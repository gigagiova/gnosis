import { DiffParser } from './diff-parser'

describe('DiffParser', () => {
  // Test parsing of self-closing delete tags
  describe('parseDiffs with delete operations', () => {
    it('should correctly parse self-closing delete tags', () => {
      // Sample text with a self-closing delete tag
      const text = 'Here is some text with a <diff type="delete" section="2" /> delete operation.'
      
      // Parse the diffs from the text
      const diffs = DiffParser.parseDiffs(text)
      
      // Verify the parsed diff
      expect(diffs.length).toBe(1)
      expect(diffs[0].type).toBe('delete')
      expect(diffs[0].sectionIndex).toBe(2)
      expect(diffs[0].content).toBeUndefined()
    })
    
    it('should handle multiple delete operations', () => {
      // Text with multiple delete operations
      const text = `
        <diff type="delete" section="0" />
        Some text in between
        <diff type="delete" section="3" />
      `
      
      const diffs = DiffParser.parseDiffs(text)
      
      // Verify we found both delete operations
      expect(diffs.length).toBe(2)
      expect(diffs[0].type).toBe('delete')
      expect(diffs[0].sectionIndex).toBe(0)
      expect(diffs[1].type).toBe('delete')
      expect(diffs[1].sectionIndex).toBe(3)
    })
  })
  
  // Test parsing of regular tags with content
  describe('parseDiffs with replace operations', () => {
    it('should correctly parse replace tags with content', () => {
      // Sample text with a replace operation
      const text = 'Here is a <diff type="replace" section="1">new content</diff> operation.'
      
      const diffs = DiffParser.parseDiffs(text)
      
      // Verify the parsed diff
      expect(diffs.length).toBe(1)
      expect(diffs[0].type).toBe('replace')
      expect(diffs[0].sectionIndex).toBe(1)
      expect(diffs[0].content).toBe('new content')
    })
    
    it('should handle replace tags with multiline content', () => {
      // Replace operation with multiline content
      const text = `
        <diff type="replace" section="2">
          # New Heading
          
          This is a multiline
          content block.
        </diff>
      `
      
      const diffs = DiffParser.parseDiffs(text)
      
      // Verify the parsed diff
      expect(diffs.length).toBe(1)
      expect(diffs[0].type).toBe('replace')
      expect(diffs[0].sectionIndex).toBe(2)
      expect(diffs[0].content).toBe('# New Heading\n          \n          This is a multiline\n          content block.')
    })
  })
  
  // Test parsing of insert operations
  describe('parseDiffs with insert operations', () => {
    it('should correctly parse insert tags with content', () => {
      // Sample text with an insert operation
      const text = 'Here is an <diff type="insert" section="3">inserted content</diff> operation.'
      
      const diffs = DiffParser.parseDiffs(text)
      
      // Verify the parsed diff
      expect(diffs.length).toBe(1)
      expect(diffs[0].type).toBe('insert')
      expect(diffs[0].sectionIndex).toBe(3)
      expect(diffs[0].content).toBe('inserted content')
    })
  })
  
  // Test parsing of mixed operations
  describe('parseDiffs with mixed operations', () => {
    it('should handle a mix of different diff operations', () => {
      // Text with multiple types of diff operations
      const text = `
        Here's a <diff type="replace" section="0">replacement</diff> and
        <diff type="delete" section="1" />
        and also <diff type="insert" section="2">new content</diff>.
      `
      
      const diffs = DiffParser.parseDiffs(text)
      
      // Verify all operations were parsed correctly
      expect(diffs.length).toBe(3)
      
      // Check first diff (replace)
      expect(diffs[0].type).toBe('delete')
      expect(diffs[0].sectionIndex).toBe(1)
      expect(diffs[0].content).toBeUndefined()
      
      // Check second diff (delete)
      expect(diffs[1].type).toBe('replace')
      expect(diffs[1].sectionIndex).toBe(0)
      expect(diffs[1].content).toBe('replacement')
      
      // Check third diff (insert)
      expect(diffs[2].type).toBe('insert')
      expect(diffs[2].sectionIndex).toBe(2)
      expect(diffs[2].content).toBe('new content')
    })
  })
  
  // Test edge cases
  describe('parseDiffs edge cases', () => {
    it('should return an empty array when no diff tags are present', () => {
      const text = 'This text has no diff tags at all.'
      
      const diffs = DiffParser.parseDiffs(text)
      
      // Verify no diffs were found
      expect(diffs.length).toBe(0)
    })
    
    it('should handle malformed tags gracefully', () => {
      // Text with incomplete tags that shouldn't be matched
      const text = `
        <diff type="replace" section="0">
        This tag is not closed properly.
        
        <diff type="delete" section="1" 
        This tag is incomplete.
      `
      
      // Should not throw an error
      const diffs = DiffParser.parseDiffs(text)
      
      // Should not find any valid diffs
      expect(diffs.length).toBe(0)
    })
  })
}) 