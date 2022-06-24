import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { select } from '@storybook/addon-knobs';
import { BaseAvatarSize } from '../BaseAvatar';
import FaviconAvatar from '.';
import { foxImageUri } from './FaviconAvatar.data';

storiesOf('Component Library / FaviconAvatar', module)
  .addDecorator((getStory) => getStory())
  .add('Default', () => {
    const sizeSelector = select(
      'size',
      BaseAvatarSize,
      BaseAvatarSize.Md,
      'Avatar Size',
    );

    return <FaviconAvatar size={sizeSelector} imageUrl={foxImageUri} />;
  })
  .add('With Error', () => {
    const sizeSelector = select(
      'size',
      BaseAvatarSize,
      BaseAvatarSize.Md,
      'Avatar Size',
    );

    return <FaviconAvatar size={sizeSelector} imageUrl={''} />;
  });
