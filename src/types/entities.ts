export interface Entity {
  name: string
  displayName: string
  icon: string
  description: string
  category: string
  allowCreate: boolean
  allowRead: boolean
  allowUpdate: boolean
  allowDelete: boolean
}

export interface EntityMetadata {
  id: string
  name: string
  displayName: string
  tableName: string
  icon: string
  description: string
  fields: Field[]
  relationships: Relationship[]
  permissions: Permission[]
  allowCreate: boolean
  allowRead: boolean
  allowUpdate: boolean
  allowDelete: boolean
}

export interface Permission {
  id: string
  entityId: string
  role: string
  canCreate: boolean
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
  canReadOwnOnly: boolean
  fieldPermissions: any
  createdAt: string
  updatedAt: string
}

export type DataType = 'string' | 'integer' | 'decimal' | 'boolean' | 'date' | 'datetime' | 'uuid' | 'text'

export interface Field {
  id: string
  name: string
  displayName: string
  dataType: DataType
  isRequired: boolean
  isReadOnly: boolean
  showInList: boolean
  showInCreate: boolean
  showInUpdate: boolean
  showInDetail: boolean
  listOrder: number
  formOrder: number
  maxLength?: number
  defaultValue?: any
  hasOptions?: boolean
  hasRelationship?: boolean
  relationship?: any
  options?: FieldOption[]
  validation?: {
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
  }
}

export interface FieldOption {
  id?: string
  value: string
  label: string
  description?: string
}

export interface Relationship {
  id: string
  fieldId: string
  relatedEntityName: string
  relatedEntityDisplayName: string
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'
  displayField: string
  foreignKeyColumn: string
}

export interface ListResponse<T = any> {
  data: Array<{ data: T }>
  pagination: {
    page: number
    pageSize: number
    totalCount: number
    totalPages: number
  }
}

export interface EntitiesResponse {
  entities: Entity[]
}
