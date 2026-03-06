import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-olive-200/50 mt-20">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <svg
                width="24"
                height="32"
                viewBox="0 0 28 36"
                fill="none"
                className="text-gray-900"
              >
                <circle cx="14" cy="6" r="4" fill="currentColor" />
                <path
                  d="M14 12C14 12 8 16 8 22C8 26 10 30 14 34"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M14 12C14 12 20 16 20 22C20 26 18 30 14 34"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-lg font-bold">Area</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              專業美容整合預約平台，<br />
              為您打造完美體驗。
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-900">平台</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/benefits" className="hover:text-olive-700">Benefits</Link></li>
              <li><Link href="/specifications" className="hover:text-olive-700">Specifications</Link></li>
              <li><Link href="/howto" className="hover:text-olive-700">How-to</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-900">資源</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/contact" className="hover:text-olive-700">Contact Us</Link></li>
              <li><span className="cursor-default">FAQ</span></li>
              <li><span className="cursor-default">Privacy Policy</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-900">聯繫我們</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>hello@area-beauty.com</li>
              <li>+886 2 1234-5678</li>
              <li>台北市信義區</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-olive-200/50 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>&copy; 2026 Area Beauty. All rights reserved.</p>
          <div className="flex gap-4 mt-3 md:mt-0">
            <span>Terms</span>
            <span>Privacy</span>
            <span>Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
