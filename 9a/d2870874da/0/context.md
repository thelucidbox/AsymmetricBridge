# Session Context

## User Prompts

### Prompt 1

Open up the zipped file that's in my downloads folder. It's the latest downloads in there. It's named asymmetric bridge bundle open it up and I wanna go ahead and create this.

### Prompt 2

[Request interrupted by user for tool use]

### Prompt 3

I kind of wanna go with live data feeds though I want to do a mix of Liv data feeds and using Claude code

### Prompt 4

Base directory for this skill: /Users/fabianaguilar/Projects/ALOS/.claude/skills/scaffold-project

# /scaffold-project — New Project with ALOS Integration

Create a new project from scratch with the full ALOS toolchain wired up. This is Phase 0 — before even `/clarify`.

## Usage

```bash
/scaffold-project                    # Start interview
/scaffold-project [name] [type]      # Quick scaffold (skip interview)
```

## Pipeline Position

```
★ /scaffold-project ★ → /clarify → /spec ...

### Prompt 5

Base directory for this skill: /Users/fabianaguilar/.claude/skills/clarify

# Clarify — Pre-Prompt Clarity Engineering

Force the cognitive work that separates great outputs from slop. This skill runs the "invisible work" that should happen before any major creative prompt.

## Philosophy

From the article: "The gap between what you want and what you get has nothing to do with the model being limited... it's about you not knowing what you want with enough precision to communicate it."

This sk...

### Prompt 6

Base directory for this skill: /Users/fabianaguilar/Projects/ALOS/.claude/skills/spec

# /spec — Product Spec → Tasks → Ship

Capture what you're building, break it into tasks an AI agent can one-shot, and scale to parallel worktrees when the project is big.

## Usage

```bash
/spec                     # Start spec interview for current project
/spec from <file>         # Parse existing spec/PRD document
/spec tasks               # Show current task decomposition
/spec status              ...

### Prompt 7

Base directory for this skill: /Users/fabianaguilar/Projects/ALOS/.claude/skills/design

# /design — First-Principles Design Document

Produce a formal design document between spec and implementation. Every constraint gets evaluated, every approach gets justified. No implementation begins without an approved design.

## Philosophy

The gap between spec and code is where bad decisions hide. `/spec` captures *what* to build. `/design` captures *why this approach* and *what alternatives were reje...

### Prompt 8

[Request interrupted by user]

### Prompt 9

Let's go to the original recommendationMy recommendation: Use Claude Code + Codex. I handle the brain (schema, threshold engine, ALOS integration, orchestration). Codex handles the hands (UI port, data feeds, alert function). That's 3 features for
   me, 5 for Codex, with me writing execution-grade briefs for each Codex task.

### Prompt 10

As far as Codex, should I just tell Codex to read the dispatch MD file in the asymmetric bridge project or can you give me the prompt right here so I can give it to Codex

