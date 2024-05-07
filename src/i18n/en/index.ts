import buttons from './buttons.json';
import error from './error.json';
import common from './common.json';
import accountActions from './account-actions.json';
import signOut from './sign-out.json';
import signIn from './sign-in.json';
import projects from './projects.json';

const all = { ...common };
export default {
  'landing-page': { ...all, ...buttons, ...accountActions },
  'error-messages': { ...error },
  'account-actions': { ...all, ...accountActions },
  'sign-out': signOut,
  'sign-in': signIn,
  projects: { ...projects, ...buttons },
};
