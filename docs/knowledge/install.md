---
type: knowledge
summary: "How to install Mod Kit in Claude Code, check that it worked and update it to a new release; Mod Kit has no Codex or Antigravity package."
related_files:
  - README.md
  - .claude-plugin/plugin.json
---

# Install and update Mod Kit

This page says how to install Mod Kit, how to tell it worked and how to move to a new release. The short form is in the README, under [Install](../../README.md#install).

Mod Kit works in Claude Code only. It has no Codex package and no Antigravity package.

## Claude Code

You need Claude Code 2.1.323 or later.

Inside Claude Code, run:

```text
/plugin marketplace add V-Songbird/foundry
/plugin install mod-kit@foundry
```

Then start a new session.

To check that it worked, run `claude plugin list` in a terminal. The list names `mod-kit`.

## Update

In Claude Code, run these. Then start a new session:

```text
/plugin marketplace update foundry
/plugin update mod-kit@foundry
```
