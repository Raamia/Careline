export default function TestPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Test Page Works!
        </h1>
        <p className="text-gray-600">
          If you can see this, Next.js is working properly.
        </p>
        <div className="mt-8 p-4 bg-green-100 rounded-lg">
          <p className="text-green-800">
            Environment: {process.env.NODE_ENV}
          </p>
          <p className="text-green-800">
            Auth0 Configured: {process.env.AUTH0_ISSUER_BASE_URL ? '✅ Yes' : '❌ No'}
          </p>
        </div>
      </div>
    </div>
  );
}
