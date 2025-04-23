import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-4xl font-bold text-white mb-4">404 - Not Found</h2>
      <p className="text-gray-400 mb-8 max-w-md">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      
      <Link href="/" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
        Return to Home
      </Link>
    </div>
  );
} 