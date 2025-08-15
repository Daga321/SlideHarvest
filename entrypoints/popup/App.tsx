import { useEffect, useState } from 'react';
import SlidesCard from '../../src/componets/SlidesCard';
import './App.css';

function App() {
  // Static array of presentation URLs for testing
  const iframeUrls = [
    'https://www.canva.com/design/DADj-4dm8eI/lqfBhzaWxbygT5b4HvZPGQ/view?embed',
    'https://docs.google.com/presentation/d/e/2PACX-1vS…AQpF/pubembed?start=false&loop=false&delayms=3000',
    'https://prezi.com/p/embed/rs98JJUxsiQMfymi7vNH/',
    'https://1drv.ms/p/c/0ee12c5ec48ae9c4/IQQuftt30hz4T…cbQYPNk?em=2&wdAr=1.7777777777777777&wdEaaCheck=0'
  ];

  return (
    <div className="app">
      <h1>Welcome to SlideHarvest</h1>
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
