---
type: knowledge
summary: "What Mod Kit's skill and agent hold and do: how the skill is loaded, its evidence labels, its reference pages, and what the mod-auditor agent checks; read to predict what Mod Kit adds to a session or before changing the skill or the agent."
related_files:
  - README.md
  - skills/mod-native-guide/SKILL.md
  - skills/mod-native-guide/references/
  - agents/mod-auditor.md
---

# How Mod Kit works

This page explains each part of Mod Kit and what it adds to a session. It extends [What does it do?](../../README.md#what-does-it-do) on the README.

## Contents

- [What you can do](#what-you-can-do)
- [The skill](#the-skill)
- [Evidence labels](#evidence-labels)
- [The reference pages](#the-reference-pages)
- [The audit](#the-audit)

Mod Kit ships two files that the assistant reads: one skill and one agent. It has no hooks, no scripts and no settings, so nothing runs unless the assistant opens one of them. Mod Kit itself sends nothing anywhere.

## What you can do

| You want to | What to type |
| --- | --- |
| Build a mod that looks native | Describe it, for example "Make a pane that lists open pull requests" |
| Restyle a mod you have | "Make `my-mod` look native in the desktop app and the terminal" |
| Check a mod before you share it | "Audit the mod in `my-mod/`" |
| Find out why a mod draws wrong | "Why do my mod's buttons touch?" |
| Learn what the docs leave out | "What do the mods pages say that `plugin-authoring` does not?" |

Mod Kit has no settings.

Why you would want it:

- **Native by default.** The assistant reaches for the element and theme key the app uses, not a lookalike.
- **Measured, not guessed.** Each rule says if it was seen, drawn on a test page, read in the build or only stated.
- **The traps, written down.** A list of places where the types promise one look and the app draws another.
- **An audit before you share.** A read-only helper checks one mod and reports each problem with its file and line.

| Part | What it does |
| --- | --- |
| The skill `mod-native-guide` | A skill is a guide the assistant loads when a task matches it. This one holds the rules, recipes and traps for what a mod draws, on the desktop app and in the terminal. |
| The agent `mod-auditor` | A subagent, which is a helper the assistant starts for one job. It reads a mod's source and never edits it. |

A mod is a plugin that draws inside Claude Code: a band above the prompt, a pane beside the chat, a toast, a theme. The types say what each element accepts, but not how the Claude desktop app draws it. With Mod Kit the assistant starts from rules measured on the desktop app and the terminal, and paints with theme keys, the named colors that follow light and dark.

## The skill

The skill `mod-native-guide` lives in [skills/mod-native-guide/SKILL.md](../../skills/mod-native-guide/SKILL.md). Claude Code loads it when a task matches its description: designing, building, restyling or auditing anything a mod draws.

It adds to the `plugin-authoring` skill that ships with Claude Code. That skill holds the hook API and its types. Mod Kit holds how Claude itself draws, so a mod can match it. When a page, the types and Mod Kit disagree, the types of the installed build win.

The skill opens with a workflow:

1. Find the native control that already does the job.
2. Pick one site: the band above the prompt, a pane, the footer chip, a status line, a toast, a transcript row or a theme.
3. Take a recipe before composing one.
4. Space with steps, color with theme keys and size with text roles.
5. Draw every state, in both themes and on both surfaces.
6. Check with screenshots of the desktop app, light and dark, and of the terminal.

Then come the 21 rules that decide most reviews, quick tables of steps and text roles, and the theme rules.

## Evidence labels

Every claim in the skill carries one label, so the assistant knows how far to trust it.

| Label | How it is known |
| --- | --- |
| `OBS` | Seen on screen, in a screenshot or a live run |
| `HARNESS` | Drawn by the desktop app's own code on a test page, outside the app, and measured |
| `CODE` | Read in the build named |
| `DOC` | Stated by Anthropic's pages or the bundled skill, and not measured |
| `INF` | Inferred from code or records |
| `UNVERIFIED` | Stated by types or inferred, and never seen on screen |

Each value names its build. The measurements ran on Claude Desktop 5.11492.5 with Claude Code 2.1.325. The comparison with Anthropic's pages used Claude Code 2.1.330.

## The reference pages

The skill keeps its detail in 18 pages under [references/](../../skills/mod-native-guide/references/). The assistant opens only the page a task needs.

| Page | Holds |
| --- | --- |
| `doc-only.md` | What Anthropic's mods pages add to the bundled skill, and where a page and a measurement disagree |
| `traps.md` | Places where the types promise one look and the app draws another |
| `recipes.md` | Meters, tooltips, sections, rows, cards, toggles, fields, the footer chip and empty states |
| `desktop-tokens.md`, `desktop-elements.md`, `desktop-sites.md` | The desktop app's sizes and colors, what each element becomes there, and each site |
| `harness-measurements.md`, `native-screens.md` | What trees and native controls measure on the desktop app |
| `native-components.md`, `native-catalog.md`, `native-forms.md` | The native controls to imitate |
| `codetab-surfaces.md`, `composer-and-pr.md` | What sits beside a mod in the Code tab |
| `engine-behaviour.md`, `api-behaviour.md`, `mounts-and-transcript.md` | When a site redraws, its limits, and how transcript rows are framed |
| `terminal.md` | The terminal side: elements, themes and the CLI's own conventions |
| `themes.md` | What three published theme mods do beyond the bundled guide, and a checklist before shipping a theme |

The pages were written in the repository where the measurements were taken. `themes.md` is the exception: it was written from Anthropic's `theme-examples` and two community theme mods, and nothing in it was measured. Where they name "the owner" or "the project checks", read your own project's reviewer and checks.

## The audit

The agent `mod-auditor` lives in [agents/mod-auditor.md](../../agents/mod-auditor.md). It can read and search files and nothing else.

Given one mod folder, it reads the skill, then the mod's manifest, hook registration, modules, types and tests. It checks:

1. That the mod loads: module names and the static reading rules.
2. State and redraw: state kept where the host can redraw it, and no redraw faster than the data.
3. Each of the skill's 21 rules.
4. The tree limits of the desktop app.
5. Themes, when the mod sets one.
6. APIs that were removed or renamed in the build named.

It returns its findings ranked most serious first, each with its file, line, rule and evidence label. It ends with what it could not judge from source, which always includes how the mod looks.
