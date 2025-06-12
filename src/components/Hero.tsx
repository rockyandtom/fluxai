import React from 'react';

const Hero: React.FC = () => {
  return (
    <>
    <section className="pt-32 pb-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
          Bring your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">ideas to life</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl">
          Unlock creativity and productivity with FLUX AI. Let your story shine with intelligent tools and beautiful design.
        </p>
        <a
          href="#register"
          className="inline-block px-10 py-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-xl shadow-lg hover:opacity-90 transition mb-10"
        >
          Get Started
        </a>
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
          alt="AI creativity"
          className="rounded-3xl shadow-2xl w-full max-w-2xl mx-auto"
        />
      </div>
    </section>
      {/* Chibify 功能介绍区块 */}
      <section id="chibify" className="py-24 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 mb-6">Chibify：真人转GPT-4o卡通3D玩偶</h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8">Chibify 是一项AI驱动的创新功能，只需上传一张真人照片，即可一键生成专属GPT-4o风格的卡通3D玩偶形象。适用于社交头像、虚拟形象、创意周边等多种场景。</p>
          <button
            onClick={() => window.location.href = '/#/chibify'}
            className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-bold text-xl shadow-lg hover:opacity-90 transition"
          >
            立即体验
          </button>
        </div>
      </section>
    </>
  );
};

export default Hero; 