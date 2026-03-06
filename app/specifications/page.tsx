import SectionHeading from "@/components/SectionHeading";

const services = [
  {
    category: "髮型設計",
    items: [
      { name: "精緻剪髮", price: "NT$ 800 起", duration: "60 min" },
      { name: "質感染髮", price: "NT$ 2,500 起", duration: "120 min" },
      { name: "造型燙髮", price: "NT$ 3,000 起", duration: "150 min" },
      { name: "深層護髮", price: "NT$ 1,200 起", duration: "45 min" },
    ],
  },
  {
    category: "臉部護理",
    items: [
      { name: "基礎保濕護理", price: "NT$ 1,500 起", duration: "60 min" },
      { name: "深層清潔護理", price: "NT$ 2,000 起", duration: "75 min" },
      { name: "抗老緊緻療程", price: "NT$ 3,500 起", duration: "90 min" },
      { name: "美白亮膚療程", price: "NT$ 2,800 起", duration: "80 min" },
    ],
  },
  {
    category: "美甲美睫",
    items: [
      { name: "經典美甲", price: "NT$ 600 起", duration: "45 min" },
      { name: "凝膠指甲彩繪", price: "NT$ 1,200 起", duration: "75 min" },
      { name: "自然嫁接睫毛", price: "NT$ 1,800 起", duration: "90 min" },
      { name: "濃密款嫁接", price: "NT$ 2,500 起", duration: "120 min" },
    ],
  },
];

export default function SpecificationsPage() {
  return (
    <section className="py-20">
      <div className="section-container">
        <SectionHeading
          label="Specifications"
          title="服務項目與規格"
          description="完整的服務列表與透明價格，讓您輕鬆選擇最適合的方案。"
        />

        <div className="space-y-10">
          {services.map((group) => (
            <div key={group.category}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-olive-700" />
                {group.category}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-olive-200 text-left text-sm text-gray-500">
                      <th className="pb-3 font-medium">服務項目</th>
                      <th className="pb-3 font-medium">價格</th>
                      <th className="pb-3 font-medium">時長</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item) => (
                      <tr
                        key={item.name}
                        className="border-b border-olive-100 hover:bg-olive-50 transition-colors"
                      >
                        <td className="py-4 font-medium">{item.name}</td>
                        <td className="py-4 text-olive-700 font-semibold">
                          {item.price}
                        </td>
                        <td className="py-4 text-gray-500 text-sm">
                          {item.duration}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>* 實際價格依店家與服務內容可能有所調整</p>
          <p>* 部分療程需事前諮詢，請透過平台預約諮詢時段</p>
        </div>
      </div>
    </section>
  );
}
