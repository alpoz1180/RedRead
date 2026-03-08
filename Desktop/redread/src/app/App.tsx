import { useState } from 'react';
import { StoryFeed } from './components/StoryFeed';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { Profile } from './components/Profile';
import { Onboarding } from './components/Onboarding';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <div className="relative w-full h-screen bg-[#0A0909] overflow-hidden text-[#E8E6E1] font-sans antialiased selection:bg-[#E85D7A]">
      <TopBar activeTab={activeTab} />
      
      {activeTab === 'home' ? (
        <StoryFeed />
      ) : (
        <Profile />
      )}
      
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
