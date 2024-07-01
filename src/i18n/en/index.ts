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

const all = { ...common };
export default {
  'landing-page': { ...all, ...buttons, ...accountActions },
  'error-messages': { ...error },
  'account-actions': { ...all, ...accountActions },
  'sign-out': signOut,
  'sign-in': signIn,
  projects: { ...projects, ...buttons, ...pages, ...all },
  pages: { ...buttons, ...pages, ...all },
  'new-project': { ...newProject, ...buttons, ...all },
  events: { ...events, ...projects, ...buttons, ...all },
};
