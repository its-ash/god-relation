export type DeityCategory =
  | 'source' // primordial / abstract principle (Brahman, Prakriti, Time)
  | 'trimurti' // Brahma, Vishnu, Shiva
  | 'devi' // Goddess forms
  | 'deva' // gods (Indra, Agni, Surya, Vayu, Varuna...)
  | 'avatar' // avatars of Vishnu
  | 'sage' // rishis / sages
  | 'demigod' // Ganesha, Kartikeya, Hanuman, Garuda, Nandi...
  | 'asura' // demons / anti-gods
  | 'epic' // Ramayana / Mahabharata mortal-born figures
  | 'realm' // Loka / cosmic realm

export interface DeityNode {
  id: string
  name: string
  sanskrit?: string
  category: DeityCategory
  epithet?: string
  summary: string
  domain?: string[]
  consort?: string[]
  mount?: string
  weapon?: string[]
  source?: string
}

export type RelationType =
  | 'emanates_from' // ontological origin
  | 'parent_of'
  | 'consort_of'
  | 'avatar_of'
  | 'sibling_of'
  | 'child_of_union'
  | 'created_by'
  | 'slays'
  | 'teacher_of'
  | 'incarnation_of'
  | 'rules'
  | 'form_of'

export interface DeityEdge {
  id: string
  from: string
  to: string
  type: RelationType
  label: string
  note?: string
}

export interface MythologyGraph {
  nodes: DeityNode[]
  edges: DeityEdge[]
}
