# Changelog

All notable changes to Mycelia are documented here.

## [0.1.0] - 2026-02-19

Initial MVP — conversation-first knowledge base.

### Added

- **Chat interface** with streaming Claude API responses
- **Knowledge extraction** — automatic background extraction of notes from conversations into structured markdown with YAML frontmatter and `[[wikilinks]]`
- **Daily journal** — auto-writes summarized entries to `journals/YYYY-MM-DD.md` with timestamps
- **Graph view** — force-directed visualization of notes and their wikilink connections, color-coded by folder
- **RAG retrieval** — detects retrieval queries and injects vault context into the conversation
- **Vault structure** — auto-creates `journals/`, `topics/`, `people/`, `projects/`, `decisions/`, `ideas/` folders
- **Onboarding** — first-run wizard for API key and vault directory selection
- **Chat persistence** — conversation history saved to `.mycelia/chat.json`
- **Settings page** with:
  - Conversation model selector (Opus 4.6, Sonnet 4.6, Haiku 4.5)
  - Extraction model selector (separate from conversation model)
  - Writing perspective toggle (first person vs second person)
  - Vault directory picker
  - API key management
- **Obsidian compatibility** — all output is standard markdown with wikilinks, works as an Obsidian vault
- **Dark theme** UI with Tailwind CSS
