import Navigation from '../components/Navigation'

export default function FriendsPage() {
  return (
    <main className="bg-dark-blue text-white h-screen flex flex-col">
      <h1 className="text-4xl font-bold text-center mb-8">Goals</h1>
      <div className="flex flex-col">
      <span>🏋️ здоровье</span>
      <span>💑 отношения</span>
      <span>⏳ время</span>
      <span>🎯 цели</span>
      <span>💰 деньги</span>
      <span>💼 карьера</span>
      <span>🏠 дом</span>
      <span>🏖 путешествия</span>
      <span>🎨 хобби</span>
      <span>👪 семья</span>
      </div>

      <Navigation />
    </main>
  );
}