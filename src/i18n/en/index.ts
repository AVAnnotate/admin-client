import buttons from './buttons.json';
import error from './error.json';
import events from './events.json';
import common from './common.json';
import accountActions from './account-actions.json';
import signOut from './sign-out.json';
import signIn from './sign-in.json';
import pages from './pages.json';
import projects from './projects.json';
import newProject from './new-project.json';
import tags from './tags.json';

const all = { ...common };
export default {
  'landing-page': { ...all, ...buttons, ...accountActions },
  'error-messages': { ...error },
  'account-actions': { ...all, ...accountActions },
  'sign-out': signOut,
  'sign-in': signIn,
  projects: {
    ...projects,
    ...newProject,
    ...buttons,
    ...pages,
    ...events,
    ...tags,
    ...all,
  },
  pages: { ...buttons, ...pages, ...all },
  'new-project': { ...newProject, ...buttons, ...error, ...projects, ...all },
  events: { ...events, ...projects, ...pages, ...buttons, ...all },
  tags: { ...all, ...tags, ...buttons },
};
