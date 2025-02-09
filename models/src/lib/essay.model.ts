/**
 * Represents an essay in the system
 */
export interface Essay {
  /** Unique identifier for the essay */
  id: string
  /** Title of the essay */
  title: string
  /** Contents of the essay in markdown format */
  contents: string
  /** When the essay was created */
  created_at: Date
  /** When the essay was last updated */
  updated_at: Date
}

/**
 * Data transfer object for creating a new essay
 */
export interface CreateEssayDto {
  /** Title of the essay */
  title: string
  /** Contents of the essay in markdown format */
  contents: string
}

/**
 * Data transfer object for updating an existing essay
 */
export interface UpdateEssayDto {
  /** Title of the essay */
  title: string
  /** Contents of the essay in markdown format */
  contents: string
} 