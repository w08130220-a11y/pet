"use client";

import { useState } from "react";
import SectionHeading from "@/components/SectionHeading";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="py-20">
      <div className="section-container">
        <SectionHeading
          label="Contact Us"
          title="與我們聯繫"
          description="有任何問題、合作洽談或建議，歡迎透過以下方式聯繫我們。"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="card">
            {submitted ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="text-xl font-bold mb-2">感謝您的訊息</h3>
                <p className="text-gray-600">我們將在 1-2 個工作天內回覆您。</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    姓名
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full rounded-xl border border-olive-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-olive-400"
                    placeholder="請輸入您的姓名"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full rounded-xl border border-olive-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-olive-400"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    主題
                  </label>
                  <select className="w-full rounded-xl border border-olive-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-olive-400">
                    <option>一般諮詢</option>
                    <option>合作洽談</option>
                    <option>技術問題</option>
                    <option>其他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    訊息內容
                  </label>
                  <textarea
                    required
                    rows={5}
                    className="w-full rounded-xl border border-olive-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-olive-400 resize-none"
                    placeholder="請描述您的問題或需求..."
                  />
                </div>
                <button type="submit" className="btn-primary w-full justify-center py-3">
                  送出訊息 →
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">聯繫方式</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-olive-100 flex items-center justify-center text-olive-700 flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Email</p>
                    <p className="text-gray-600 text-sm">hello@area-beauty.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-olive-100 flex items-center justify-center text-olive-700 flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">電話</p>
                    <p className="text-gray-600 text-sm">+886 2 1234-5678</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-olive-100 flex items-center justify-center text-olive-700 flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-sm">地址</p>
                    <p className="text-gray-600 text-sm">台北市信義區信義路五段 7 號</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">營業時間</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">週一至週五</span>
                  <span className="font-medium">09:00 - 21:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">週六</span>
                  <span className="font-medium">10:00 - 20:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">週日</span>
                  <span className="font-medium">10:00 - 18:00</span>
                </div>
              </div>
            </div>

            <div className="card bg-olive-200/50">
              <h4 className="font-semibold mb-2">合作店家招募中</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                如果您是美容業者，歡迎加入 Area 平台，我們提供完善的店家管理工具與推廣資源，一起為顧客打造更好的體驗。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
