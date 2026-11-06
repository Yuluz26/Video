import React from 'react';
import { Composition, delayRender, continueRender, Still } from 'remotion';
import { Cover } from './Cover';
import { Demo, demoFrames } from './Demo';
import { Promo, PROMO_FRAMES } from './Promo';
import { HYPE_FRAMES, PromoHype } from './PromoHype';
import { PromoLandscape } from './PromoLandscape';
import { FPS, loadFonts } from './theme';

const fonts = delayRender('DIDIK fonts');
loadFonts().then(() => continueRender(fonts));

export const DidikRoot: React.FC = () => (
  <>
    <Composition id="DIDIK-Promo-9x16" component={PromoHype} durationInFrames={HYPE_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ withAudio: true }} />
    <Composition id="DIDIK-Promo-9x16-Calm" component={Promo} durationInFrames={PROMO_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ withAudio: true }} />
    <Composition id="DIDIK-Promo-16x9" component={PromoLandscape} durationInFrames={PROMO_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{ withAudio: true }} />
    <Composition id="DIDIK-Demo-16x9" component={Demo} durationInFrames={demoFrames()} fps={FPS} width={1920} height={1080} defaultProps={{ withAudio: true }} />
    <Still id="DIDIK-Cover-9x16" component={Cover} width={1080} height={1920} />
  </>
);
