import * as RadixAvatar from '@radix-ui/react-avatar';
import { User } from '@phosphor-icons/react/User';
import type { UserProfile } from '@ty/Types.ts';

interface AvatarProps {
  name?: string;

  color?: string;

  avatar?: string;

  showBorder?: boolean;
}

export const formatName = (user: UserProfile) => {
  const { gitHubName, name } = user;

  if (gitHubName) return gitHubName;

  return name;

  // Remember that this function returns undefined if user has no (nick)name set!
};

export const getDisplayName = (user: UserProfile) => {
  if (user.gitHubName) return user.gitHubName;

  return user.name;
};

const getInitials = (name: string): string => {
  const tokens = name.split(/\s+/);
  if (tokens.length === 1) {
    return tokens[0].charAt(0).toUpperCase();
  } else {
    return (
      tokens[0].charAt(0) + tokens[tokens.length - 1].charAt(0)
    ).toUpperCase();
  }
};

export const Avatar = (props: AvatarProps) => {
  const { name, color, avatar } = props;

  return (
    <RadixAvatar.Root className='avatar'>
      <span
        className={color ? 'avatar-wrapper ring' : 'avatar-wrapper'}
        style={color ? { borderColor: color } : undefined}
      >
        {avatar && (
          <RadixAvatar.Image
            className='avatar-image'
            title={`${name} avatar`}
            src={avatar}
          />
        )}

        <RadixAvatar.Fallback
          className='avatar-fallback'
          title={`${name} avatar image`}
          style={{ backgroundColor: 'gray' }}
        >
          {name ? getInitials(name) : <User size={16} />}
        </RadixAvatar.Fallback>
      </span>
    </RadixAvatar.Root>
  );
};
