export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold">
          Welcome to <span className="text-blue-600">EventHorizon</span>
        </h1>
        <p className="mt-3 text-xl">
          A modern event management platform
        </p>
        <div className="mt-6">
          <a
            href="/users"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Manage Users
          </a>
        </div>
      </main>
    </div>
  );
}
