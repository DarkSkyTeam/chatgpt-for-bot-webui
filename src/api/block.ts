import { http } from '@/utils/http'

export interface BlockInput {
  name: string
  description: string
  type: string
  required: boolean
  default?: any
}

export interface BlockOutput {
  name: string
  description: string
  type: string
}

export interface BlockConfig {
  name: string
  description: string
  type: string
  required: boolean
  default?: any
}

export interface BlockType {
  type_name: string
  name: string
  description: string
  inputs: BlockInput[]
  outputs: BlockOutput[]
  configs: BlockConfig[]
}

export interface BlockTypeListResponse {
  types: BlockType[]
}

export interface BlockTypeResponse {
  type: BlockType
}

export async function listBlockTypes() {
  return http.get<BlockTypeListResponse>('/block/types')
}

export async function getBlockType(typeName: string) {
  return http.get<BlockTypeResponse>(`/block/types/${typeName}`)
} 