<div align="center">
  <img src="assets/banner-light.png#gh-light-mode-only" alt="Mod Kit" width="900" />
  <img src="assets/banner-dark.png#gh-dark-mode-only" alt="Mod Kit" width="900" />
  <h1>Mod Kit</h1>
  <p><strong>Mods that look like part of Claude Code.</strong></p>
</div>

<p align="center"><strong>Available on</strong></p>
<table align="center">
  <tr>
    <td align="center"><a href="#install"><img src="assets/edition-claude.svg" alt="" width="80" height="80" /><br />Claude Code</a></td>
  </tr>
</table>
<p align="center">Mod Kit works in Claude Code only.</p>

<p align="center"><a href="#install"><strong>Install</strong></a> · <a href="#how-to-use-it">How to use it</a> · <a href="#does-it-work">Does it work?</a> · <a href="#learn-more">Learn more</a></p>

## What does it do?

Mod Kit is an add-on for Claude Code, the AI assistant that writes code for you. It teaches the assistant to build mods that look like Claude Code's own screens.

A mod is an add-on that draws inside Claude Code. It can be a bar above the prompt, a side panel, a pop-up note or a color theme.

Without Mod Kit, buttons touch and meters look foreign.

With Mod Kit, the assistant uses the same pieces and spacing as the app. A second helper reads a finished mod and lists what would break.

<p align="center"><img src="assets/mascot.svg" alt="Ember holds a crooked panel piece that is too wide for the slot in an app window, and its buttons touch. A ruler measures it. The piece then sits in the slot with its buttons spaced and a round meter, and Ember answers: It fits. Light and dark." width="700"></p>

*Ember is the mascot of the Foundry plugins. The scene is an illustration, not a measurement.*

**You ask:** "Make a band that shows the build status, native on the desktop app and in the terminal."

**You get:** a band built from a ready recipe, with every state drawn, and a list of what only a screenshot can prove. This is an illustration, not a recorded session.

## Install

You need Claude Code 2.1.323 or later.

1. Open Claude Code.
2. Type these two lines, one at a time:

   ```text
   /plugin marketplace add V-Songbird/foundry
   /plugin install mod-kit@foundry
   ```

3. Start a new session.

To check that it worked, run `claude plugin list` in a terminal. The list names `mod-kit`.

Mod Kit has no Codex or Antigravity package. To get a new version, follow [Update](docs/knowledge/install.md#update).

## How to use it

- **"Make a pane that lists open pull requests"** builds a new mod that looks native.
- **"Make `my-mod` look native in the desktop app and the terminal"** restyles a mod you have.
- **"Audit the mod in `my-mod/`"** checks a mod before you share it.
- **"Why do my mod's buttons touch?"** finds why a mod draws wrong.

Mod Kit has no settings.

## Does it work?

Not measured yet. No recorded session has compared a mod built with Mod Kit against one built without it.

The pixel and color values inside Mod Kit describe the app's own screens. They are not results of Mod Kit. [Mod Kit benchmarks](docs/knowledge/benchmarks.md) explains the difference.

## Good to know

- **Measurements have a build.** On a newer Claude Code, treat a value as likely, not certain. [The evidence labels](docs/knowledge/how-it-works.md#evidence-labels) name the builds.
- **A look is proven only on screen.** Check the desktop app in light and dark, and the terminal, with screenshots.
- **The preview is not the app.** It draws a mod with your installed desktop app's code, so the assistant can check it first. It skips the window, hover and shader effects. [How it works](docs/knowledge/how-it-works.md#what-you-can-do) says more.
- **Some rules are not yet seen.** A rule labelled `UNVERIFIED` rests on inference. Do not ship it without a screenshot.
- **The audit reads source only.** `mod-auditor` cannot judge how a mod looks. It lists what only screenshots can prove.

## Learn more

[How Mod Kit works](docs/knowledge/how-it-works.md) · [Install and update](docs/knowledge/install.md) · [Mod Kit benchmarks](docs/knowledge/benchmarks.md)

Release notes are on the [Mod Kit releases page](https://github.com/V-Songbird/mod-kit/releases). Report a bug on [Mod Kit's issue tracker](https://github.com/V-Songbird/mod-kit/issues), a vulnerability as [SECURITY.md](SECURITY.md) says. To change Mod Kit, read [CONTRIBUTING.md](CONTRIBUTING.md). [Foundry](https://github.com/V-Songbird/foundry) lists the whole family.

## License

MIT, see [LICENSE](LICENSE).
