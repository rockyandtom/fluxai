import React from 'react';

const features = [
  {
    title: 'AI Studio',
    desc: 'Create inspiring content with powerful AI tools.',
    icon: '💡',
  },
  {
    title: 'Smart Assistant',
    desc: 'Get help with your daily tasks and projects.',
    icon: '🤖',
  },
  {
    title: 'Analytics',
    desc: 'Track and analyze your AI usage and performance.',
    icon: '📊',
  },
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-extrabold text-center mb-16 text-gray-900">
          Our AI Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center text-center transform hover:scale-105 transition-all duration-300 hover:shadow-3xl cursor-pointer"
            >
              <div className="text-6xl mb-6 drop-shadow-lg">{f.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">{f.title}</h3>
              <p className="text-gray-500 text-lg">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 