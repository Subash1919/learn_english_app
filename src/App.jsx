import { useState, useEffect, useCallback } from 'react'
import BottomNav from './components/BottomNav'
import ReminderBanner from './components/ReminderBanner'
import Onboarding from './components/Onboarding'
import HomeTab from './tabs/HomeTab'
import LearnTab from './tabs/LearnTab'
import GamesTab from './tabs/GamesTab'
import ProfileTab from './tabs/ProfileTab'
import { isOnboardingDone, getUser, updateStreak, getReminderMessage } from './storage'

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [onboarded, setOnboarded] = useState(false)
  const [user, setUser] = useState(null)
  const [reminder, setReminder] = useState(null)
  const [showReminder, setShowReminder] = useState(true)

  const refreshUser = useCallback(() => {
    setUser(getUser())
  }, [])

  useEffect(() => {
    if (isOnboardingDone()) {
      setOnboarded(true)
      updateStreak()
      setUser(getUser())
      setReminder(getReminderMessage())
    }
  }, [])

  function handleOnboardingDone() {
    updateStreak()
    setUser(getUser())
    setOnboarded(true)
  }

  if (!onboarded) {
    return <Onboarding onDone={handleOnboardingDone} />
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white relative overflow-hidden">
      {/* Reminder banner */}
      {reminder && showReminder && (
        <ReminderBanner message={reminder} onDismiss={() => setShowReminder(false)} />
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'home' && <HomeTab user={user} onRefresh={refreshUser} onNavigate={setActiveTab} />}
        {activeTab === 'learn' && <LearnTab user={user} onRefresh={refreshUser} />}
        {activeTab === 'games' && <GamesTab user={user} onRefresh={refreshUser} />}
        {activeTab === 'profile' && <ProfileTab user={user} onRefresh={refreshUser} />}
      </div>

      {/* Bottom nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
