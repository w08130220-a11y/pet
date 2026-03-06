import SectionHeading from "@/components/SectionHeading";
import Link from "next/link";

const benefits = [
  {
    title: "節省時間",
    desc: "不再需要打電話或親自到店預約，隨時隨地在線上完成預約流程，平均只需 30 秒。",
    icon: "⏱",
  },
  {
    title: "透明價格",
    desc: "所有服務價格清晰公開，無隱藏費用。比較不同店家方案，找到最適合您的選擇。",
    icon: "💰",
  },
  {
    title: "真實評價",
    desc: "來自真實顧客的評價與照片，讓您在預約前就能了解服務品質與效果。",
    icon: "⭐",
  },
  {
    title: "彈性管理",
    desc: "輕鬆查看、修改或取消預約。提供免費改期服務，讓行程安排更加靈活。",
    icon: "📅",
  },
  {
    title: "專屬優惠",
    desc: "平台會員獨享折扣、限時優惠和點數回饋，長期使用省更多。",
    icon: "🎁",
  },
  {
    title: "安全保障",
    desc: "所有合作店家皆經過嚴格審核，提供服務保障機制，讓您安心享受。",
    icon: "🛡",
  },
];

export default function BenefitsPage() {
  return (
    <section className="py-20">
      <div className="section-container">
        <SectionHeading
          label="Benefits"
          title="使用 Area 的好處"
          description="我們致力於為每位使用者提供最佳的美容預約體驗，以下是選擇我們的理由。"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {benefits.map((b) => (
            <div key={b.title} className="card group hover:shadow-lg hover:shadow-olive-200/30 transition-all">
              <div className="text-3xl mb-4">{b.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{b.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-olive-200/50 border-2 border-dashed border-olive-300 rounded-2xl px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">準備好體驗了嗎？</h2>
            <p className="text-gray-600">立即加入 Area，享受無與倫比的美容服務體驗。</p>
          </div>
          <Link href="/contact" className="btn-primary whitespace-nowrap">
            Learn More →
          </Link>
        </div>
      </div>
    </section>
  );
}
