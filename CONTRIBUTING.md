# Contributing

Mod Kit is part of the [Foundry marketplace](https://github.com/V-Songbird/foundry) and has a single maintainer. Contributions are welcome as bug reports, suggestions and pull requests.

One package serves Claude Code. Mod Kit has no Codex or Antigravity package, because mods are a Claude Code feature.

---

## Before opening a PR

- Check existing issues first. The problem may already be tracked or deliberately deferred.
- For a substantial change, such as a new reference page, a new audit check or a rule that changes a look, open an issue first to agree on direction.
- Branch from `main` and open the pull request against `main`.

---

## Structure

```text
.claude-plugin/
└── plugin.json         # name, version, description, author, keywords
.github/
└── workflows/
    └── test.yml        # CI: manifest check, nav check and suite on Linux and Windows, private-details scan
agents/
└── mod-auditor.md      # the read-only audit of one mod
skills/
└── mod-native-guide/
    ├── SKILL.md        # the workflow, the rules and the quick tables
    └── references/     # 18 detail pages the skill opens on demand
scripts/
└── git-hooks/          # the commit gates
tests/                  # node:test suite for the commit gates, with fixtures/
CONTRIBUTING.md         # this file
SECURITY.md             # how to report a vulnerability
LICENSE                 # MIT
assets/                 # the README art, copied from the Foundry brand kit
docs/
└── knowledge/          # how-it-works.md and benchmarks.md
README.md               # the front page: what Mod Kit does, install, limits and the evidence
```

The README is the front page. The pages under `docs/knowledge/` hold the detail it links, and a fact lives in one place: the README states the short form and links the page.

---

## What to keep in mind

**Every claim carries an evidence label and a build.** A value seen on screen is `OBS`; one read in the build is `CODE`; one only stated by a page is `DOC`. A change keeps the label honest and names the build it was checked on. A look is proven only by a screenshot: the desktop app in light and dark, and the terminal.

**Most reference pages are generated.** The maintainer measures Claude and regenerates `skills/mod-native-guide/references/` from those measurements; `doc-only.md` and `themes.md` are the exceptions, written by hand. A correction to a generated page is welcome as an issue or a pull request, and lands in the next regeneration.

**There are no hooks.** Mod Kit ships text the assistant reads. Keep it that way unless an issue agrees otherwise.

**Published figures follow one rule.** Each result names its host, model, date and sample size. Losses and limits stay, a host with no results shows `Not measured`, and a result from one host never stands for another.

A figure about Mod Kit names its host, model, date and sample size. The skill's values about the app are not such figures.

---

## Tests

Run the suite with Node.js 22 or later and Git on your PATH:

```bash
node --test tests/*.test.js
node scripts/git-hooks/check-readme-nav.js
```

A pull request that changes behavior without updating its tests is not merged.

CI runs `.github/workflows/test.yml` on pushes and pull requests to `main`. Its `suite` job runs on Linux and Windows with Node 22. It parses `.claude-plugin/plugin.json`, runs the README nav check and runs `node --test tests/*.test.js`. Its `private-details` job scans each pull request for private details. The `test` job passes only when both succeed.

Validate the package for Claude Code with `claude plugin validate .`. `claude plugin test .` does not apply, because it needs a hooks module and Mod Kit has none. Mod Kit has no Codex or Antigravity package to validate.

---

## Git hooks

Run this once after cloning:

```bash
git config core.hooksPath scripts/git-hooks
```

This enables a `pre-commit` hook that runs `node --test tests/*.test.js` and blocks the commit on failure. It also blocks a commit that stages a Markdown file while the root `README.md` lacks its navigation line, or while a link to a heading anchor in any tracked Markdown file no longer resolves.

Every Foundry plugin keeps byte-identical copies of the commit gates under `scripts/git-hooks/` and of the tests that cover them. A change to one goes into all of them.

Keep credentials and personal session data out of commits.

---

## Release notes

Release notes live on the [releases page](https://github.com/V-Songbird/mod-kit/releases). Describe every user-visible change in your pull request, so it can go into the next release's notes.

The release commit bumps the version in `.claude-plugin/plugin.json`. The [Foundry](https://github.com/V-Songbird/foundry) catalog pins the released `main` commit and repeats that version.

A pull request never changes a contributor's installed plugins or personal configuration.

---

## Code of conduct

This project follows the [Contributor Covenant 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). To report behavior that goes against it, contact the maintainer privately through the address in [SECURITY.md](SECURITY.md).
