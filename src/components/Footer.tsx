import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10 text-gray-700">
        <div>
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">FLUX AI</h3>
          <p className="text-gray-500">Empowering creativity and productivity with AI</p>
        </div>
        <div>
          <h4 className="font-bold mb-2">Quick Links</h4>
          <ul className="space-y-1">
            <li><a href="#features" className="hover:text-blue-500">Features</a></li>
            <li><a href="#pricing" className="hover:text-blue-500">Pricing</a></li>
            <li><a href="#help" className="hover:text-blue-500">Help</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-2">Resources</h4>
          <ul className="space-y-1">
            <li><a href="#blog" className="hover:text-blue-500">Blog</a></li>
            <li><a href="#docs" className="hover:text-blue-500">Documentation</a></li>
            <li><a href="#api" className="hover:text-blue-500">API</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-2">Contact</h4>
          <ul className="space-y-1">
            <li><a href="mailto:support@fluxai.com" className="hover:text-blue-500">support@fluxai.com</a></li>
            <li><a href="#contact" className="hover:text-blue-500">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div className="text-center text-gray-400 mt-12 text-sm">
        &copy; {new Date().getFullYear()} FLUX AI. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer; 