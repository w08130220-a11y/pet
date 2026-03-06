import Link from "next/link";
import FeatureCard from "@/components/FeatureCard";

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "一站式整合",
    description: "整合所有美容服務於單一平台，從髮型設計、護膚保養到美甲美睫，一鍵即可瀏覽。",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    title: "智慧預約",
    description: "AI 智慧推薦最佳時段，即時查看空檔，預約流程簡單快速，零等待體驗。",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "品質保證",
    description: "嚴格篩選合作店家，每位技師皆通過專業認證，確保服務品質與安全。",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "專屬會員",
    description: "累積消費點數兌換優惠，專屬會員折扣與生日禮遇，越用越划算。",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    title: "個人化設定",
    description: "根據您的膚質、喜好與過往紀錄，提供量身訂做的美容方案推薦。",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    title: "即時溝通",
    description: "內建即時聊天功能，直接與設計師或店家溝通需求，確認細節不遺漏。",
  },
];

const stats = [
  { value: "50+", label: "合作店家" },
  { value: "200+", label: "專業技師" },
  { value: "10K+", label: "滿意顧客" },
  { value: "4.9", label: "平均評分" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="min-h-[90vh] flex items-center">
        <div className="section-container w-full">
          <div className="max-w-3xl">
            <span className="text-olive-500 text-sm font-medium tracking-wide uppercase mb-4 block">
              Area Beauty Platform
            </span>
            <h1 className="mb-6 leading-[1.1]">
              重新定義
              <br />
              <span className="text-olive-700">美的體驗</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl leading-relaxed">
              探索頂級美容服務，從預約到體驗，每一步都為您精心設計。解鎖數據驅動的決策分析，為您的美麗旅程提供策略性指引。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-primary text-base px-8 py-3">
                Learn More →
              </Link>
              <Link href="/benefits" className="btn-outline text-base px-8 py-3">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12">
        <div className="section-container">
          <div className="bg-olive-700 rounded-2xl px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-olive-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="section-container">
          <div className="text-center mb-14">
            <span className="text-olive-500 text-sm font-medium tracking-wide uppercase mb-3 block">
              Features
            </span>
            <h2 className="mb-4">為何選擇 Area</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              解鎖全方位美容體驗，結合科技與專業，讓每次服務都超越期待。
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Area CTA Sections (matching Figma's dashed-border area blocks) */}
      <section className="py-16">
        <div className="section-container space-y-6">
          {/* Full-width CTA */}
          <div className="bg-olive-200/50 border-2 border-dashed border-olive-300 rounded-2xl px-8 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                立即開始您的美麗旅程
              </h2>
              <p className="text-gray-600">
                探索最適合您的美容方案，從今天開始改變。
              </p>
            </div>
            <Link href="/contact" className="btn-primary whitespace-nowrap">
              Learn More →
            </Link>
          </div>

          {/* Centered CTA */}
          <div className="bg-olive-200/50 border-2 border-dashed border-olive-300 rounded-2xl px-8 py-10 text-center">
            <h2 className="text-2xl font-bold mb-4">加入會員享專屬優惠</h2>
            <Link href="/contact" className="btn-primary">
              Learn More →
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Checklist */}
      <section className="py-16">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 max-w-3xl">
            <div className="feature-check">極速瀏覽體驗</div>
            <div className="feature-check">即時預約確認</div>
            <div className="feature-check">安全支付保障</div>
            <div className="feature-check">多平台同步</div>
            <div className="feature-check">智慧推薦系統</div>
            <div className="feature-check">24/7 客服支援</div>
          </div>
        </div>
      </section>
    </>
  );
}
