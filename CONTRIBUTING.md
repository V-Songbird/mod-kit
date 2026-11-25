# Contributing

Mod Kit is part of the [Foundry marketplace](https://github.com/V-Songbird/foundry) and has a single maintainer. Contributions are welcome in the form of bug reports, suggestions, and pull requests.

---

## Before opening a PR

- Check existing issues first — the problem may already be tracked or intentionally deferred.
- For substantial changes (a new reference page, a new audit check, a rule that changes a look), open an issue first to align on direction.

---

## Structure

`main` holds the plugin: one package for Claude Code. Mod Kit has no Codex or Antigravity package, because mods are a Claude Code feature.

```text
.claude-plugin/
└── plugin.json         # name, version, description, author, keywords
.github/workflows/      # test.yml: the manifest check, the nav check and the suite, on Linux and Windows, and the private-details scan of pull requests
agents/
└── mod-auditor.md      # the read-only audit of one mod
skills/
└── mod-native-guide/
    ├── SKILL.md        # the workflow, the rules and the quick tables
    └── references/     # 17 detail pages the skill opens on demand
scripts/                # git-hooks/: the commit gates
tests/                  # node:test suite for the commit gates, with fixtures/
CONTRIBUTING.md
LICENSE                 # MIT
README.md               # the front page: what Mod Kit does, install, limits and the evidence
SECURITY.md
assets/                 # the README art, copied from the Foundry brand kit
docs/knowledge/         # how-it-works.md and benchmarks.md
```

The README is the front page. `docs/knowledge/how-it-works.md` holds the whole mechanism and `benchmarks.md` every published measurement of Mod Kit. A figure about Mod Kit names its host, model, date and sample size; the skill's values about the app are not such figures. A fact lives in one place: the README states the short form and links the page.

---

## What to keep in mind

**Every claim carries an evidence label and a build.** A value seen on screen is `OBS`; one read in the build is `CODE`; one only stated by a page is `DOC`. A change keeps the label honest and names the build it was checked on. A look is proven only by a screenshot: the desktop app in light and dark, and the terminal.

**Most reference pages are generated.** The maintainer measures Claude and regenerates `skills/mod-native-guide/references/` from those measurements; `doc-only.md` is the exception. A correction to a generated page is welcome as an issue or a pull request, and lands in the next regeneration.

**There are no hooks.** Mod Kit ships text the assistant reads. Keep it that way unless an issue agrees otherwise.

---

## Tests

Run the tests before submitting:

```bash
node --test tests/*.test.js
```

`claude plugin validate .` checks the package shape. `claude plugin test .` does not apply: it needs a hooks module, and Mod Kit has none.

CI runs the suite on Linux and Windows with Node 22.

---

## Git hooks

Run this once after cloning:

```bash
git config core.hooksPath scripts/git-hooks
```

This enables a `pre-commit` hook that runs `node --test tests/*.test.js` and blocks the commit on failure. It also blocks a commit that stages a Markdown file while the root `README.md` lacks its navigation line, or while a link to a heading anchor in any tracked Markdown file no longer resolves.

Every Foundry plugin keeps byte-identical copies of the files under `scripts/git-hooks/` and of the tests that cover them. A change to one goes into all of them.

---

## Release notes

Release notes live on the [releases page](https://github.com/V-Songbird/mod-kit/releases), written in plain prose when a release is cut. The release commit bumps the version in `.claude-plugin/plugin.json`. The [Foundry](https://github.com/V-Songbird/foundry) catalog pins the released `main` commit and repeats that version.

---

## Code of conduct

This project follows the [Contributor Covenant 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).
