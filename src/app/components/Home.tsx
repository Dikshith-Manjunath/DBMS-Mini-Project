import Link from "next/link";
export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Modern Database</span>
              <span className="block text-indigo-600 dark:text-indigo-400">
                Management Solution
              </span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Unlock the full potential of your store's sales data with our
              intelligent, AI-powered database management system. Designed for
              efficiency and scalability, this solution automatically organizes,
              analyzes, and visualizes sales transactions — helping you make
              smarter business decisions, faster. From real-time performance
              tracking to predictive sales insights, our system transforms raw
              data into actionable intelligence.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link href="/database">
                  <div className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10">
                    Get Started
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
