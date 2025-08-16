import { useEffect, useState } from 'react';
import SlidesCard from '../../src/componets/SlidesCard';
import './App.css';

function App() {
  // Static array of presentation URLs for testing
  const iframeUrls = [
    'https://www.canva.com/design/DADj-4dm8eI/lqfBhzaWxbygT5b4HvZPGQ/view?embed',
    'https://docs.google.com/presentation/d/e/2PACX-1vShm0xfo4N7YM9_nmjyLAVzxluKno_fN1nI1cwV_xO67jPkMwbx3JUfq8sNl6lWpL3x5qAHZyx-AQpF/pubembed?start=false&loop=false&delayms=3000',
    'https://prezi.com/p/embed/rs98JJUxsiQMfymi7vNH/',
    'https://1drv.ms/p/c/0ee12c5ec48ae9c4/IQQuftt30hz4TbjVXOgZJ4mVAaUi8MM_SfN1PDSbcbQYPNk?em=2&wdAr=1.7777777777777777&wdEaaCheck=0'
  ];

  return (
    <div className="app">
      <h1 className="popup-title">SlideHarvest</h1>
      <hr style={{ border: 'none', borderTop: '1.5px solid #e0e0e0', margin: '0.5em 0 1.5em 0' }} />
      <div className="slides-list">
        {iframeUrls.length === 0 && <div>No presentations found on this page.</div>}
        {iframeUrls.map((url, idx) => (
          <SlidesCard
            key={idx}
            title={`Presentation #${idx + 1}`}
            description={url}
            link={url}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
