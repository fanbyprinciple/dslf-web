import React from 'react';
import { Composition } from 'remotion';
import Showcase, { TOTAL_FRAMES } from './Showcase';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DSLFShowcase"
        component={Showcase}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
