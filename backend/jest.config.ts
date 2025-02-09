import type { Config } from 'jest'
import { join } from 'path'

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: join(__dirname, 'src'),
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@gnosis/models$': join(__dirname, '../models/src/index.ts')
  }
}

export default config
