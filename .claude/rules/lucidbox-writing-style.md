# LucidBox Writing Style (Enforcement)
# Path: **/*.md, **/templates/*, **/SKILL.md, **/*.txt

Voice spec: `LucidBox-LLC/synthesis/VOICE-DNA.md` | Style guide: `LucidBox-LLC/synthesis/STYLE-GUIDE.md`

## Three Non-Negotiables (Always Enforce)

1. **Proof before claim** — Evidence first, then let the reader conclude. Never "X is incredible" without showing why.
2. **Hero's journey framing** — Frame transformations as arcs: before → struggle → after. Not static descriptions.
3. **Negative definition** — Define by exclusion alongside inclusion. "Doesn't capture data. Not designed to be addictive."

## Opening Rules

- Opening sentence MUST be declarative, under 15 words
- REJECT: questions as openers ("Have you ever..."), meta-commentary ("In this document..."), filler ("Great question!")
- REJECT: "I just wanted to," "I think it's worth noting that"

## Closing Rules

- Every message MUST end with a next step OR a single declarative
- REJECT: "Please don't hesitate to reach out," "Looking forward to our continued partnership"
- REJECT: dead-end closings with no forward momentum

## Forbidden Words — Hard Reject

### AI Slop
REJECT: "delve," "tapestry," "nuanced," "landscape," "paradigm," "synergy," "leverage" (as verb), "utilize," "facilitate," "robust" (unless describing infrastructure), "seamlessly," "cutting-edge," "best-in-class," "game-changing," "revolutionary"

### Clickbait Framing
REJECT: "The one thing nobody's talking about," "What you're missing," "Here's why that matters," "Stop doing X," "I need to talk about," "Unpopular opinion," "Hot take"

### Hedging
REJECT: "just wanted to," "I think maybe," "hopefully," "it might be worth considering," "I could be wrong but," "I'm no expert but"

### Superlatives Without Proof
REJECT: "incredible," "amazing," "game-changing," "revolutionary" — unless preceded by specific evidence

## Structural Rules

- Priorities and categories come in **triads** (groups of three) — this is a cognitive signature
- Credibility through output, not titles — let shipped work speak
- Self-awareness when genuine — acknowledge limitations before others name them
- Specificity over abstraction — exact numbers, named tools, concrete details
- Lists are for sequential processes only — not a substitute for prose

## Tone Matching

| Context | Warmth | Formality | Key Move |
|---------|--------|-----------|----------|
| Parent/personal | 8 | 3 | Narrative, emotional-but-controlled |
| Builder/peer | 5 | 4 | Compressed, output-as-credential |
| Sales/client | 5 | 6 | Acknowledge → own → reframe → solve → next step |
| Educational (Art of Fact) | 4 | 7 | Authoritative, teach by showing |
| Product (PracticePal) | 8 | 3 | Parent-facing, negative definition, values-driven |
| Machine (Linear issues) | 0 | 9 | Imperative, no personality — EXEMPT from voice rules |

**Machine Voice exemption:** Linear issue descriptions, agent briefs, and system prompts do NOT use Fabian's voice. They use imperative action sentences, context blocks, and acceptance criteria. No warmth, no narrative, no colloquialisms.

## Approved Colloquialisms

These conversational phrases are part of the voice — use in moderation (1-2 per message):
"get the ball rolling," "give you a ring," "working his tail off," "hop on a quick call," "the whole thing," "like most of us probably are"

## Quality Check (for /style-review)

| Dimension | Weight | Check |
|-----------|--------|-------|
| Directness | 25% | Declarative opening, point-first structure |
| Proof-Claim Order | 25% | Evidence before conclusions |
| Forbidden Patterns | 20% | Zero reject-list violations |
| Forward Momentum | 15% | Ends with next step or clear close |
| Voice Match | 15% | Correct surface variant applied |

## Sub-Brand Voice Lookup

Before flagging voice mismatch, check which sub-brand surface is active:
1. Check project-root `BRAND.md` for voice notes
2. Check VOICE-DNA.md surface variants table
3. If writing matches a documented variant: **compliant**
4. If writing uses Fabian's core voice on a Machine Voice surface: **flag it**
5. If writing uses Machine Voice on a human-facing surface: **flag it**
