import SectionHeading from "@/components/SectionHeading";
import Link from "next/link";

const steps = [
  {
    step: "01",
    title: "瀏覽服務",
    description:
      "在首頁或服務頁面瀏覽所有美容類別，使用篩選功能找到您需要的服務項目，查看價格與評價。",
  },
  {
    step: "02",
    title: "選擇店家與時段",
    description:
      "根據地區、評分與價格篩選合適的店家，查看技師的個人介紹與作品集，選擇偏好的預約時段。",
  },
  {
    step: "03",
    title: "確認預約",
    description:
      "填寫基本資訊、選擇付款方式並確認預約。系統將即時發送確認通知，並於服務前提醒您。",
  },
  {
    step: "04",
    title: "享受服務",
    description:
      "準時到店享受專業服務。服務完成後可為技師評分、上傳照片，幫助其他使用者做出更好的選擇。",
  },
];

const faqs = [
  {
    q: "如何取消或更改預約？",
    a: "進入「我的預約」頁面，選擇要修改的預約，點選修改或取消即可。24 小時前免費取消。",
  },
  {
    q: "付款方式有哪些？",
    a: "支援信用卡、Apple Pay、Google Pay 和 LINE Pay，也可選擇到店付款。",
  },
  {
    q: "如何挑選適合的技師？",
    a: "每位技師都有個人頁面，包含資歷、作品集和顧客評價，幫助您做出最佳選擇。",
  },
];

export default function HowToPage() {
  return (
    <section className="py-20">
      <div className="section-container">
        <SectionHeading
          label="How-to"
          title="如何使用 Area"
          description="只需簡單四個步驟，即可完成預約並享受專業美容服務。"
        />

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {steps.map((s) => (
            <div key={s.step} className="card flex gap-5">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-olive-700 text-white flex items-center justify-center text-xl font-bold">
                {s.step}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold mb-8">常見問題</h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="border-b border-olive-200 pb-6"
              >
                <h4 className="font-semibold mb-2">{faq.q}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-olive-200/50 border-2 border-dashed border-olive-300 rounded-2xl px-8 py-10 text-center">
          <h2 className="text-2xl font-bold mb-3">還有其他問題？</h2>
          <p className="text-gray-600 mb-6">歡迎聯繫我們的客服團隊，我們很樂意為您解答。</p>
          <Link href="/contact" className="btn-primary">
            Contact Us →
          </Link>
        </div>
      </div>
    </section>
  );
}
