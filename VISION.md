# Mycelia — Vision

## The problem with every PKM tool

Every personal knowledge management tool ever built has the same core assumption: the user is willing to do the work of organizing.

You capture a thought. Then you title it, tag it, put it in the right folder, link it to related notes, maybe write a summary. If you're disciplined, you do this consistently for months and build something genuinely useful. If you're a normal person, you capture twenty things, lose the habit, and open the app six months later to find a graveyard of half-finished notes with no connections.

The tools are good. The workflow is the problem. Organization is friction. Friction compounds. The knowledge base never reaches critical mass, so it never becomes genuinely useful, so there's no reward to sustain the habit.

Notion, Roam, Obsidian, Logseq, Mem, Reflect — they're all solving for the same user: someone who is willing to make their PKM system a second job. That user exists, but they're rare. Everyone else bounces.

## The inversion

Mycelia starts from a different assumption: the user will never do the work of organizing, and they shouldn't have to.

The only interface is a chat window. You talk to it the way you'd talk to a smart, curious friend — about your day, your ideas, a problem you're working through, something you read. You don't think about organization at all. You just talk.

Behind the scenes, a second AI reads every exchange and does the work:

- It decides what's worth remembering and what isn't.
- It writes structured notes with titles, tags, and wikilinks.
- It routes each note to the right folder.
- It recognizes when something connects to a note that already exists and appends to it rather than creating a duplicate.
- It writes a journal entry for the day.

The knowledge base assembles itself. By the time you think to look something up, there's already something to look up.

## The principles

**Conversation is the only interface.**
No forms. No templates. No drag-and-drop. You just talk. The cognitive load of a conversation is near zero because it's the most natural thing humans do. The knowledge base is a side effect of doing something you'd do anyway.

**Local-first, always.**
Your notes live in a folder on your computer. Plain markdown files with YAML frontmatter. You own them completely. If you stop using Mycelia tomorrow, nothing is locked away. Open the folder in any text editor. Drop it into Obsidian. Push it to git. It's just files.

**Obsidian-compatible by design.**
The vault format is not proprietary. It uses standard markdown, standard YAML frontmatter, and standard `[[wikilinks]]`. This is a deliberate constraint, not an incidental detail. You should be able to use Obsidian alongside Mycelia, or instead of it, at any time.

**No cloud, no sync, no account.**
There is no Mycelia server. Settings persist locally. The only network traffic is the Anthropic API call you make with your own key. You are not the product.

**The knowledge graph is a consequence, not a feature.**
Every other tool asks you to build the graph. Mycelia's graph emerges from the connections the AI discovers and writes. Every `[[wikilink]]` in a note is a potential edge. The graph view is just a window into what the AI found interesting enough to connect.

## What Mycelia is not

Mycelia is not a writing tool. It does not have a rich text editor or a document composer. The vault is where knowledge goes after it's been extracted — not where you write.

Mycelia is not a task manager. It has no due dates, no checkboxes, no project boards. If you mention a task in conversation, it might be recorded as a decision or project note, but the app will not track it for you.

Mycelia is not a replacement for Obsidian. It is a front-end for talking to an AI that happens to write its outputs into an Obsidian-compatible vault. Many users will use both.

Mycelia is not a subscription. There is no SaaS play here. You pay for your own Anthropic API usage and run the app yourself.

## The target user

Someone who thinks out loud. Someone with too many browser tabs and not enough time to file things properly. Someone who has tried Notion, or Roam, or Obsidian, and bounced off the maintenance overhead. Someone who journals occasionally but not consistently. Someone who has good ideas in the shower and forgets them by noon.

That person does not need a better filing system. They need a system that files itself.

## The long-term picture

The vault grows quietly. Every conversation adds to it. Over months it becomes a genuine record of what you know, what you've decided, who you've talked about, and what you care about.

When you ask "what did I decide about X?", the answer is in there. When you ask "do I know anything about Y?", the answer is probably yes. The system has perfect recall of everything you've told it. You don't.

Eventually the vault becomes a second brain in the literal sense — not a metaphor for a complicated filing system, but an actual external memory that knows you well enough to be useful without being asked the right question in exactly the right way.

That is the thing Mycelia is trying to be.
