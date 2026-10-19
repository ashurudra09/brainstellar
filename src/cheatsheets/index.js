// Registry of interactive cheatsheets: slug -> data module. A cheatsheet is
// interactive when its stub .md in src/data/cheatsheets has `kind: "interactive"`.
import mlKit from './ml-kit.json'
import ethicalHackingKit from './ethical-hacking-kit.json'

const registry = {
  'ml-kit': mlKit,
  'ethical-hacking-kit': ethicalHackingKit,
}

export default registry
