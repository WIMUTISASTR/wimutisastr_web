import Link from "next/link";
import Nav from "@/compounents/Nav";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      
      {/* Hero Section - FORM KH Style */}
      <section className="relative overflow-hidden bg-slate-900 text-white min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-linear-to-br from-amber-900/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Text Content */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                Learn Cambodian Law
                <span className="block text-amber-400 mt-2">In Minutes, Not Years</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl">
                Instant access to expert legal education with zero barriers. Comprehensive videos and documents 
                to master Cambodian law securely and efficiently.
              </p>
              <Link 
                href="/law_video"
                className="inline-block px-8 py-4 bg-white text-slate-900 rounded-lg font-semibold text-lg hover:bg-amber-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Start Learning Now
              </Link>
            </div>

            {/* Right Side - Illustration */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[500px] flex items-center justify-center">
                {/* Main Illustration Container */}
                <div className="relative w-full h-full max-w-md">
                  {/* Dashed Circle Border */}
                  <div className="absolute inset-0 border-2 border-dashed border-amber-400/30 rounded-full"></div>
                  
                  {/* Center - Law Book/Scale of Justice */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      {/* Law Book */}
                      <div className="w-32 h-24 bg-linear-to-br from-amber-600 to-yellow-700 rounded-lg shadow-2xl transform rotate-[-5deg]">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Scale of Justice */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                        <svg className="w-20 h-20 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                          <path d="M7 10h2v2H7zm8 0h2v2h-2z"/>
                          <path d="M9 7h6v1H9zm0 6h6v1H9z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Floating Document Icons */}
                  <div className="absolute top-10 left-10 w-16 h-20 bg-white/10 backdrop-blur-sm rounded-lg border border-amber-400/20">
                    <div className="p-2 space-y-1">
                      <div className="h-1 bg-amber-400/40 rounded"></div>
                      <div className="h-1 bg-amber-400/40 rounded w-3/4"></div>
                      <div className="h-1 bg-amber-400/40 rounded w-5/6"></div>
                    </div>
                  </div>
                  
                  <div className="absolute top-32 right-16 w-16 h-20 bg-white/10 backdrop-blur-sm rounded-lg border border-amber-400/20">
                    <div className="p-2 space-y-1">
                      <div className="h-1 bg-amber-400/40 rounded"></div>
                      <div className="h-1 bg-amber-400/40 rounded w-4/5"></div>
                      <div className="h-1 bg-amber-400/40 rounded w-2/3"></div>
                    </div>
                  </div>

                  <div className="absolute bottom-20 left-20 w-16 h-20 bg-white/10 backdrop-blur-sm rounded-lg border border-amber-400/20">
                    <div className="p-2 space-y-1">
                      <div className="h-1 bg-amber-400/40 rounded"></div>
                      <div className="h-1 bg-amber-400/40 rounded w-full"></div>
                      <div className="h-1 bg-amber-400/40 rounded w-3/4"></div>
                    </div>
                  </div>

                  {/* Video Play Icon */}
                  <div className="absolute bottom-32 right-12">
                    <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white/20">
                      <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>

                  {/* Shield with Lock - Security Symbol */}
                  <div className="absolute top-20 right-8">
                    <div className="relative">
                      <svg className="w-16 h-16 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                      </svg>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Simplified */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Videos Feature */}
            <Link 
              href="/law_video"
              className="group flex items-center space-x-6 p-8 rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300"
            >
              <div className="shrink-0 w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                <svg className="w-8 h-8 text-amber-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                  Educational Videos
                </h3>
                <p className="text-gray-600">
                  Learn from expert legal professionals through comprehensive video tutorials
                </p>
              </div>
            </Link>

            {/* Documents Feature */}
            <Link 
              href="/law_documents"
              className="group flex items-center space-x-6 p-8 rounded-xl border-2 border-gray-200 hover:border-amber-400 hover:shadow-xl transition-all duration-300"
            >
              <div className="shrink-0 w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-500 transition-colors">
                <svg className="w-8 h-8 text-amber-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                  Legal Documents
                </h3>
                <p className="text-gray-600">
                  Access comprehensive legal documents, statutes, and case studies
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted By Section - FORM KH Style */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-600 mb-8 text-lg font-medium">
            Trusted by legal professionals and institutions
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
            {/* Placeholder for partner logos - You can replace these with actual logos */}
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-linear-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">LAW</span>
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">Law School</p>
            </div>
            
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-linear-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">BAR</span>
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">Bar Association</p>
            </div>
            
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-linear-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">JUD</span>
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">Judicial Institute</p>
            </div>
            
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-linear-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">MIN</span>
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">Ministry</p>
            </div>
            
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-linear-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">LEG</span>
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">Legal Firm</p>
            </div>
            
            <div className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 bg-linear-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">EDU</span>
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">Education</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">About Us</h3>
              <Link href="/about_us" className="text-gray-400 hover:text-white transition-colors">
                Learn More
              </Link>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Resources</h3>
              <div className="space-y-2">
                <Link href="/law_video" className="block text-gray-400 hover:text-white transition-colors">
                  Legal Videos
                </Link>
                <Link href="/law_documents" className="block text-gray-400 hover:text-white transition-colors">
                  Legal Documents
                </Link>
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Account</h3>
              <div className="space-y-2">
                <Link href="/auth/login" className="block text-gray-400 hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/auth/register" className="block text-gray-400 hover:text-white transition-colors">
                  Register
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Cambodian Law Education Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
