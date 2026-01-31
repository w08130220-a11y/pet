#!/usr/bin/env python3
"""
PetLife 訂閱方案分析圖表生成腳本
"""

import matplotlib.pyplot as plt
import matplotlib
import numpy as np

# 設定字體
plt.style.use('seaborn-v0_8-whitegrid')
matplotlib.rcParams['font.family'] = ['DejaVu Sans']
matplotlib.rcParams['axes.unicode_minus'] = False

import os
os.makedirs('/home/ubuntu/petlife-business-plan/images', exist_ok=True)

# 1. 訂閱方案收益貢獻堆疊圖
def create_subscription_revenue_stack():
    years = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']
    plus_revenue = [0.90, 2.64, 7.49, 16.87, 35.93]
    pro_revenue = [0.90, 3.36, 11.39, 29.97, 75.47]
    family_revenue = [0.30, 0.96, 4.32, 13.49, 38.85]
    
    fig, ax = plt.subplots(figsize=(12, 7))
    
    x = np.arange(len(years))
    width = 0.6
    
    bars1 = ax.bar(x, plus_revenue, width, label='Plus ($4.99/mo)', color='#4ECDC4')
    bars2 = ax.bar(x, pro_revenue, width, bottom=plus_revenue, label='Pro ($9.99/mo)', color='#FF6B6B')
    bars3 = ax.bar(x, family_revenue, width, bottom=[p+r for p,r in zip(plus_revenue, pro_revenue)], 
                   label='Family ($14.99/mo)', color='#FFD93D')
    
    # 添加總營收標籤
    totals = [p+r+f for p,r,f in zip(plus_revenue, pro_revenue, family_revenue)]
    for i, total in enumerate(totals):
        ax.text(i, total + 2, f'${total:.1f}M', ha='center', va='bottom', 
               fontsize=11, fontweight='bold')
    
    ax.set_xlabel('Year', fontsize=12)
    ax.set_ylabel('Revenue (Million USD)', fontsize=12)
    ax.set_title('Subscription Revenue by Plan (5-Year Projection)', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(years)
    ax.legend(loc='upper left', fontsize=10)
    ax.set_ylim(0, 180)
    
    plt.tight_layout()
    plt.savefig('/home/ubuntu/petlife-business-plan/images/subscription_revenue_stack.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Created: subscription_revenue_stack.png")

# 2. 各業務線營收貢獻圓餅圖（Year 5）
def create_revenue_breakdown_pie():
    labels = ['Subscription\n$150.25M', 'Beauty Booking\n$46.80M', 'Pet Matching\n$45.00M', 
              'Walking Service\n$21.60M', 'E-commerce\n$24.00M', 'Insurance\n$10.80M']
    sizes = [150.25, 46.80, 45.00, 21.60, 24.00, 10.80]
    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
    explode = (0.05, 0, 0, 0, 0, 0)
    
    fig, ax = plt.subplots(figsize=(12, 9))
    
    wedges, texts, autotexts = ax.pie(sizes, explode=explode, labels=labels, colors=colors,
                                       autopct='%1.1f%%', shadow=True, startangle=90,
                                       textprops={'fontsize': 10})
    
    for autotext in autotexts:
        autotext.set_fontweight('bold')
        autotext.set_fontsize(11)
    
    ax.set_title('Revenue Breakdown by Business Line (Year 5)\nTotal: $298.45M', 
                fontsize=14, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('/home/ubuntu/petlife-business-plan/images/revenue_breakdown_year5.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Created: revenue_breakdown_year5.png")

# 3. 用戶轉換漏斗圖
def create_conversion_funnel():
    fig, ax = plt.subplots(figsize=(12, 8))
    
    stages = ['Total Users\n10M', 'Active Users\n7M (70%)', 'Engaged Users\n3.5M (50%)', 
              'Trial Users\n1.75M (50%)', 'Paid Users\n1.5M (86%)']
    values = [10, 7, 3.5, 1.75, 1.5]
    colors = ['#E8E8E8', '#B8D4E3', '#7FB3D5', '#4ECDC4', '#FF6B6B']
    
    # 繪製漏斗
    for i, (stage, value, color) in enumerate(zip(stages, values, colors)):
        width = value / 10 * 0.8
        left = (1 - width) / 2
        rect = plt.Rectangle((left, 4-i), width, 0.8, facecolor=color, edgecolor='white', linewidth=2)
        ax.add_patch(rect)
        ax.text(0.5, 4-i+0.4, stage, ha='center', va='center', fontsize=11, fontweight='bold')
    
    ax.set_xlim(0, 1)
    ax.set_ylim(-0.5, 5.5)
    ax.axis('off')
    ax.set_title('User Conversion Funnel (Year 5)', fontsize=14, fontweight='bold', pad=20)
    
    plt.tight_layout()
    plt.savefig('/home/ubuntu/petlife-business-plan/images/conversion_funnel.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Created: conversion_funnel.png")

# 4. LTV 比較圖
def create_ltv_comparison():
    plans = ['Plus', 'Pro', 'Family']
    ltv = [39.92, 139.86, 269.82]
    cac = [10, 25, 40]
    ltv_cac_ratio = [4.0, 5.6, 6.7]
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    
    # LTV vs CAC
    x = np.arange(len(plans))
    width = 0.35
    
    bars1 = ax1.bar(x - width/2, ltv, width, label='LTV', color='#4ECDC4')
    bars2 = ax1.bar(x + width/2, cac, width, label='CAC', color='#FF6B6B')
    
    ax1.set_xlabel('Subscription Plan', fontsize=12)
    ax1.set_ylabel('USD', fontsize=12)
    ax1.set_title('Customer Lifetime Value vs Acquisition Cost', fontsize=13, fontweight='bold')
    ax1.set_xticks(x)
    ax1.set_xticklabels(plans)
    ax1.legend()
    
    # 添加數值標籤
    for bar in bars1:
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 5, 
                f'${bar.get_height():.0f}', ha='center', va='bottom', fontsize=10)
    for bar in bars2:
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 5, 
                f'${bar.get_height():.0f}', ha='center', va='bottom', fontsize=10)
    
    # LTV/CAC Ratio
    bars3 = ax2.bar(plans, ltv_cac_ratio, color=['#4ECDC4', '#FF6B6B', '#FFD93D'])
    ax2.axhline(y=3, color='#333', linestyle='--', linewidth=2, label='Healthy Threshold (3x)')
    ax2.set_xlabel('Subscription Plan', fontsize=12)
    ax2.set_ylabel('LTV/CAC Ratio', fontsize=12)
    ax2.set_title('LTV/CAC Ratio by Plan', fontsize=13, fontweight='bold')
    ax2.legend()
    
    for bar in bars3:
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1, 
                f'{bar.get_height():.1f}x', ha='center', va='bottom', fontsize=11, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('/home/ubuntu/petlife-business-plan/images/ltv_comparison.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Created: ltv_comparison.png")

# 5. 多元營收成長預測
def create_diversified_revenue_growth():
    years = ['Year 2', 'Year 3', 'Year 4', 'Year 5']
    
    subscription = [6.96, 23.20, 60.33, 150.25]
    beauty = [1.08, 5.28, 18.00, 46.80]
    matching = [0.75, 4.32, 16.50, 45.00]
    walking = [0, 1.20, 6.72, 21.60]
    ecommerce = [0, 1.50, 6.00, 24.00]
    insurance = [0, 0.54, 3.15, 10.80]
    
    fig, ax = plt.subplots(figsize=(14, 8))
    
    x = np.arange(len(years))
    width = 0.12
    
    ax.bar(x - 2.5*width, subscription, width, label='Subscription', color='#FF6B6B')
    ax.bar(x - 1.5*width, beauty, width, label='Beauty Booking', color='#4ECDC4')
    ax.bar(x - 0.5*width, matching, width, label='Pet Matching', color='#45B7D1')
    ax.bar(x + 0.5*width, walking, width, label='Walking Service', color='#96CEB4')
    ax.bar(x + 1.5*width, ecommerce, width, label='E-commerce', color='#FFEAA7')
    ax.bar(x + 2.5*width, insurance, width, label='Insurance', color='#DDA0DD')
    
    # 添加總營收線
    totals = [sum(x) for x in zip(subscription, beauty, matching, walking, ecommerce, insurance)]
    ax.plot(x, totals, 'ko-', linewidth=2, markersize=8, label='Total Revenue')
    
    for i, total in enumerate(totals):
        ax.annotate(f'${total:.1f}M', (i, total), textcoords="offset points", 
                   xytext=(0, 10), ha='center', fontsize=10, fontweight='bold')
    
    ax.set_xlabel('Year', fontsize=12)
    ax.set_ylabel('Revenue (Million USD)', fontsize=12)
    ax.set_title('Diversified Revenue Growth Projection', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(years)
    ax.legend(loc='upper left', fontsize=9, ncol=2)
    ax.set_ylim(0, 350)
    
    plt.tight_layout()
    plt.savefig('/home/ubuntu/petlife-business-plan/images/diversified_revenue_growth.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Created: diversified_revenue_growth.png")

# 6. 修正後市值預測
def create_updated_valuation():
    years = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']
    revenue = [2.1, 8.79, 36.04, 110.70, 298.45]
    valuation_low = [r * 6 for r in revenue]
    valuation_high = [r * 8 for r in revenue]
    
    fig, ax = plt.subplots(figsize=(12, 7))
    
    x = np.arange(len(years))
    
    # 繪製營收柱狀圖
    bars = ax.bar(x, revenue, 0.5, label='Annual Revenue', color='#4ECDC4', alpha=0.8)
    
    # 繪製市值範圍
    ax.fill_between(x, [v/10 for v in valuation_low], [v/10 for v in valuation_high], 
                   alpha=0.3, color='#FF6B6B', label='Valuation Range (6-8x)')
    ax.plot(x, [v/10 for v in valuation_low], 'r--', linewidth=2)
    ax.plot(x, [v/10 for v in valuation_high], 'r-', linewidth=2)
    
    # 添加 $1B 和 $2B 目標線
    ax.axhline(y=100, color='#FFD700', linestyle='--', linewidth=3, label='$1B Target')
    ax.axhline(y=200, color='#FF8C00', linestyle='--', linewidth=3, label='$2B Target')
    
    # 添加標籤
    for i, (rev, val_h) in enumerate(zip(revenue, valuation_high)):
        ax.text(i, rev + 5, f'${rev:.1f}M', ha='center', fontsize=9, fontweight='bold', color='#4ECDC4')
        ax.text(i, val_h/10 + 5, f'${val_h:.0f}M', ha='center', fontsize=9, fontweight='bold', color='#FF6B6B')
    
    ax.set_xlabel('Year', fontsize=12)
    ax.set_ylabel('Million USD', fontsize=12)
    ax.set_title('Updated Revenue & Valuation Projection\n(With Diversified Revenue Streams)', 
                fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(years)
    ax.legend(loc='upper left', fontsize=10)
    ax.set_ylim(0, 280)
    
    plt.tight_layout()
    plt.savefig('/home/ubuntu/petlife-business-plan/images/updated_valuation.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Created: updated_valuation.png")

# 執行所有圖表生成
if __name__ == '__main__':
    print("Generating PetLife Analysis Charts...")
    create_subscription_revenue_stack()
    create_revenue_breakdown_pie()
    create_conversion_funnel()
    create_ltv_comparison()
    create_diversified_revenue_growth()
    create_updated_valuation()
    print("\nAll analysis charts generated successfully!")
