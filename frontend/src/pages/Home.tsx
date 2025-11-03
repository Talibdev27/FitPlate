import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section with Enhanced Design */}
      <section className="relative bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 py-24 md:py-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse-custom"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
              {t('home.heroTitle')}
            </h1>
            <p className="text-xl md:text-2xl text-green-50 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/register"
                className="group relative bg-white text-emerald-600 font-bold py-4 px-10 rounded-full text-lg shadow-2xl hover-lift transform transition-all duration-300 hover:scale-105 btn-pulse"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t('home.ctaMain')}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link
                to="/login"
                className="bg-transparent border-3 border-white text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                {t('auth.login')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b-4 border-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12 animate-fade-in">
            {t('home.statsTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-stagger">
            <div className="text-center hover-lift p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="text-5xl font-extrabold text-emerald-600 mb-2 animate-bounce-custom">
                {t('home.statsCustomers')}
              </div>
              <div className="text-lg text-gray-600 font-semibold">Happy Customers 😊</div>
            </div>
            <div className="text-center hover-lift p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50">
              <div className="text-5xl font-extrabold text-orange-600 mb-2 animate-bounce-custom" style={{ animationDelay: '0.2s' }}>
                {t('home.statsMeals')}
              </div>
              <div className="text-lg text-gray-600 font-semibold">Meals Delivered 🍽️</div>
            </div>
            <div className="text-center hover-lift p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="text-5xl font-extrabold text-purple-600 mb-2 animate-bounce-custom" style={{ animationDelay: '0.4s' }}>
                {t('home.statsRating')}
              </div>
              <div className="text-lg text-gray-600 font-semibold">Average Rating ⭐</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Enhanced Design */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4 animate-fade-in">
            {t('home.features')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 animate-stagger">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-2xl shadow-lg hover-lift border-2 border-transparent hover:border-blue-300 transition-all duration-300">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl transform group-hover:rotate-12 transition-transform duration-300">
                📋
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {t('home.feature1Title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('home.feature1Desc')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 p-8 rounded-2xl shadow-lg hover-lift border-2 border-transparent hover:border-orange-300 transition-all duration-300">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl transform group-hover:rotate-12 transition-transform duration-300">
                👨‍🍳
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {t('home.feature2Title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('home.feature2Desc')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8 rounded-2xl shadow-lg hover-lift border-2 border-transparent hover:border-green-300 transition-all duration-300">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl transform group-hover:rotate-12 transition-transform duration-300">
                🚚
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {t('home.feature3Title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('home.feature3Desc')}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 p-8 rounded-2xl shadow-lg hover-lift border-2 border-transparent hover:border-purple-300 transition-all duration-300">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl transform group-hover:rotate-12 transition-transform duration-300">
                📊
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {t('home.feature4Title')}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t('home.feature4Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16 animate-fade-in">
            {t('home.howItWorks')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-stagger">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-xl transform group-hover:scale-110 transition-transform duration-300 hover-glow">
                  <span className="animate-bounce-custom">1️⃣</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('home.step1')}
              </h3>
            </div>

            {/* Step 2 */}
            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-xl transform group-hover:scale-110 transition-transform duration-300 hover-glow" style={{ animationDelay: '0.2s' }}>
                  <span className="animate-bounce-custom" style={{ animationDelay: '0.2s' }}>2️⃣</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('home.step2')}
              </h3>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-xl transform group-hover:scale-110 transition-transform duration-300 hover-glow" style={{ animationDelay: '0.4s' }}>
                  <span className="animate-bounce-custom" style={{ animationDelay: '0.4s' }}>3️⃣</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('home.step3')}
              </h3>
            </div>

            {/* Step 4 */}
            <div className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-xl transform group-hover:scale-110 transition-transform duration-300 hover-glow" style={{ animationDelay: '0.6s' }}>
                  <span className="animate-bounce-custom" style={{ animationDelay: '0.6s' }}>4️⃣</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t('home.step4')}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-16 animate-fade-in">
            {t('home.testimonialTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-stagger">
            <div className="bg-white p-8 rounded-2xl shadow-xl hover-lift border-l-4 border-emerald-500">
              <div className="text-5xl mb-4">💬</div>
              <p className="text-xl text-gray-700 italic mb-6 leading-relaxed">
                {t('home.testimonial1')}
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-2xl mr-4">
                  😊
                </div>
                <div>
                  <div className="font-bold text-gray-900">{t('home.testimonial1Author')}</div>
                  <div className="text-yellow-500">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl hover-lift border-l-4 border-orange-500">
              <div className="text-5xl mb-4">💬</div>
              <p className="text-xl text-gray-700 italic mb-6 leading-relaxed">
                {t('home.testimonial2')}
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-2xl mr-4">
                  😃
                </div>
                <div>
                  <div className="font-bold text-gray-900">{t('home.testimonial2Author')}</div>
                  <div className="text-yellow-500">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-6 animate-bounce-custom">🎉</div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 animate-fade-in-up">
            {t('home.joinToday')}
          </h2>
          <p className="text-2xl text-green-100 mb-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Start your healthy journey today and join thousands of satisfied customers! 💪✨
          </p>
          <Link
            to="/register"
            className="inline-block group relative bg-white text-emerald-600 font-extrabold py-5 px-12 rounded-full text-xl shadow-2xl hover-lift transform transition-all duration-300 hover:scale-110 btn-pulse"
          >
            <span className="relative z-10 flex items-center gap-3">
              {t('home.getStarted')}
              <span className="text-2xl animate-bounce-custom">🚀</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>
      </section>
    </div>
  );
};
