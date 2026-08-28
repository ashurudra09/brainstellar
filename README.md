# Brainstellar

Quantitative Aptitude Puzzles

This repo uses [Gatsbyjs](https://www.gatsbyjs.com) framework.

## Running locally (practice tracker)

This fork adds a personal practice dashboard (`/`), solved/star/notes tracking
per puzzle, and stores that progress in `progress.json` at the repo root.

**Requires Node 20 LTS**, not the latest Node. The lockfile pins
`sharp@0.32.6`, which ships prebuilt binaries for Node 18/20 but not 22+; on
newer Node versions it falls back to compiling from source, which typically
fails on Windows. [nvm-windows](https://github.com/coreybutler/nvm-windows)
is the easiest way to install and pin a specific version:

```sh
winget install CoreyButler.NVMforWindows
nvm install 20.19.0
nvm use 20.19.0
```

Then just double-click **`run-brainstellar.bat`** in this folder. It checks
for Node, runs `npm install` on first launch, starts `gatsby develop`, and
opens the site at `http://localhost:8000`. Keep the window open while you use
the site; closing it stops the server.

## Develop

In order to run this locally, install Use the Gatsby CLI ([install instructions](https://www.gatsbyjs.com/docs/tutorial/getting-started/part-0/#gatsby-cli)).

Following are some commonly used command

```sh

# install gatsby
npm install -g gatsby-cli


# install current project dependencies (run when inside this project folder)
npm install

# run gatsby for local development 
gatsby develop

# The site will appear at URL http://localhost:8000
```



