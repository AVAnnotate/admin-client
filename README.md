# AVAnnotate Admin Client

This repository contains the code for the admin backend that powers AVAnnotate sites. It is made with the Astro framework, with a backend powered entirely by GitHub. It also uses React for client-side components.

## Local Development

If you have access to the project on Netlify, install the Netlify CLI with `npm install -g netlify-cli`, then run `netlify link` in the project root to link your local repo to the desired Netlify project (for most local development this should probably be the staging instance). Once that link is done you can start a local server with `netlify dev`. In this case you don't need to worry about maintaining a local `.env` file for environment variables, since Netlify will inject them. 

You can also run a local environment without linking to Netlify by running `npm run dev`. In this case you'll need a local `.env` file; copy the contents of `.env.example` and fill in the client ID and secret for the GitHub application you're using for authentication. (Values for these secrets can be copied from the Netlify projects, under Project Configuration -> Environment Variables.)

Note that running the site locally still requires authentication via GitHub, and changes made to projects will be applied, so be sure to create testing projects for playing around with any new and untested features.

### UTexas GitHub Enterprise Managed User (EMU) login

A second "Sign in with UTexas EID" button can be shown on the sign-in page to let UTexas users authenticate via the [GitHub Enterprise Managed Users SSO](https://docs.github.com/en/enterprise-cloud@latest/admin/managing-iam/configuring-authentication-for-enterprise-managed-users/configuring-saml-single-sign-on-for-enterprise-managed-users) for the `utexas-internal` enterprise (<https://github.com/enterprises/utexas-internal>).

To enable this button you need a separate OAuth App registered inside the UTexas enterprise and two additional environment variables:

| Variable | Description |
| --- | --- |
| `PUBLIC_UTEXAS_GITHUB_CLIENT_ID` | Client ID of the OAuth App created inside the UTexas enterprise |
| `UTEXAS_GITHUB_CLIENT_SECRET` | Client secret for that OAuth App (server-side only) |

**Creating the OAuth App:** 
1. Navigate to <https://github.com/enterprises/utexas-internal> (requires enterprise admin access).
2. Go to *Settings → OAuth Apps → New OAuth App*.  (this is actually under the developer section at the very bottom of your org's settings on the left.)
3. Set **Authorization callback URL** to `{PUBLIC_REDIRECT_URL}/git-enterprise` (e.g. `https://avannotate.netlify.app/git-enterprise`).
4. Copy the **Client ID** into `PUBLIC_UTEXAS_GITHUB_CLIENT_ID` and generate/copy a **Client secret** into `UTEXAS_GITHUB_CLIENT_SECRET`.

When `PUBLIC_UTEXAS_GITHUB_CLIENT_ID` is blank (the default), the UTexas EID button is hidden, so the sign-in page works exactly as before for non-UTexas deployments.

# Astro Basics

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
