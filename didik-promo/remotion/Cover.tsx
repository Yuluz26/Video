import React from 'react';
import { AbsoluteFill, Img, OffthreadVideo, staticFile } from 'remotion';
import { Logo, PixelStar, Phone } from './components';
import { P } from './clips';
import { C, FONT_BODY, FONT_DISPLAY } from './theme';

// 1080×1920 cover / thumbnail: the logo, the line, and one real frame of a child's phone.
export const Cover: React.FC = () => (
  <AbsoluteFill style={{ background: C.paper }}>
    <div style={{ position: 'absolute', left: 80, top: 230, right: 110 }}>
      <Logo width={600} />
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 104, color: C.ink, lineHeight: 1.02, marginTop: 56, letterSpacing: '-0.01em' }}>
        Kuiz yang
        <br />
        jadi <span style={{ color: C.coral }}>permainan.</span>
      </div>
      <div style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 40, color: C.ink2, marginTop: 26, lineHeight: 1.3 }}>
        Ibu bapa tulis soalan. Anak-anak main bersama.
      </div>
    </div>
    <Phone height={900} style={{ left: 300, top: 880, transform: 'rotate(-4deg)' }}>
      <OffthreadVideo src={staticFile(`clips/${P.cover.clip}.mp4`)} startFrom={P.cover.from} muted style={{ width: '100%', height: '100%' }} />
    </Phone>
    <PixelStar size={56} color={C.sun} style={{ left: 200, top: 960 }} />
    <PixelStar size={40} color={C.berry} style={{ left: 870, top: 1010 }} />
    <PixelStar size={34} color={C.sea} style={{ left: 230, top: 1560 }} />
  </AbsoluteFill>
);

export const CoverBadge: React.FC = () => <Img src={staticFile('brand/didik-logo-dark.png')} />;
