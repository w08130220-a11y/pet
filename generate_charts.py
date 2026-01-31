#!/usr/bin/env python3
"""
PetLife 企劃書圖表生成腳本
"""

import matplotlib.pyplot as plt
import matplotlib
import numpy as np

# 設定中文字體
plt.style.use('seaborn-v0_8-whitegrid')
matplotlib.rcParams['font.family'] = ['Noto Sans CJK TC', 'Noto Sans CJK SC', 'DejaVu Sans']
matplotlib.rcParams['axes.unicode_minus'] = False

# 創建輸出目錄
import os
os.makedirs('/home/ubuntu/pet-social-app/charts/output', exist_ok=True)

# 1. 全球寵物市場規模成長圖
def create_market_growth_chart():
    years = ['2024', '2025', '2026', '2027', '2028', '2029', '2030']
    market_size = [259, 273, 310, 355, 405, 450, 500]
    
    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.bar(years, market_size, color='#FF6B6B', edgecolor='white', linewidth=2)
    
    # 添加數值標籤
    for bar, size in zip(bars, market_size):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 5, 
                f'${size}B', ha='center', va='bottom', fontsize=11, fontweight='bold')
    
    ax.set_xlabel('Year', fontsize=12)
    ax.set_ylabel('Market Size (Billion USD)', fontsize=12)
    ax.set_title('Global Pet Care Market Size Forecast', fontsize=14, fontweight='bold')
    ax.set_ylim(0, 550)
    
    plt.tight_layout()
    plt.savefig('/home/ubuntu/pet-social-app/charts/output/market_growth.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Created: market_growth.png")

# 2. 五年營收預測圖
def create_revenue_forecast_chart():
    years = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']
    revenue = [2.1, 6.7, 21, 52.5, 126]
    users = [0.5, 1, 2.5, 5, 10]  # 百萬用戶
    
    fig, ax1 = plt.subplots(figsize=(10, 6))
    
    # 營收柱狀圖
    bars = ax1.bar(years, revenue, color='#4ECDC4', edgecolor='white', linewidth=2, label='Revenue')
    ax1.set_xlabel('Year', fontsize=12)
    ax1.set_ylabel('Revenue (Million USD)', fontsize=12, color='#4ECDC4')
    ax1.tick_params(axis='y', labelcolor='#4ECDC4')
    
    # 添加營收數值標籤
    for bar, rev in zip(bars, revenue):
        ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 2, 
                f'${rev}M', ha='center', va='bottom', fontsize=10, fontweight='bold', color='#4ECDC4')
    
    # 用戶數折線圖
    ax2 = ax1.twinx()
    line = ax2.plot(years, users, color='#FF6B6B', marker='o', linewidth=3, markersize=10, label='Users')
    ax2.set_ylabel('Users (Million)', fontsize=12, color='#FF6B6B')
    ax2.tick_params(axis='y', labelcolor='#FF6B6B')
    
    # 添加用戶數標籤
    for i, (year, user) in enumerate(zip(years, users)):
        ax2.annotate(f'{user}M', (i, user), textcoords="offset points", 
                    xytext=(0, 10), ha='center', fontsize=10, color='#FF6B6B', fontweight='bold')
    
    ax1.set_title('PetLife 5-Year Revenue & User Growth Forecast', fontsize=14, fontweight='bold')
    ax1.set_ylim(0, 150)
    ax2.set_ylim(0, 12)
    
    plt.tight_layout()
    plt.savefig('/home/ubuntu/pet-social-app/charts/output/revenue_forecast.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Created: revenue_forecast.png")

# 3. 訂閱方案價格比較圖
def create_subscription_chart():
    plans = ['Free', 'Plus\n$4.99/mo', 'Pro\n$9.99/mo', 'Family\n$14.99/mo']
    features = ['Pets', '3D Scenes', 'AI Chat', 'Cloud Sync', 'Priority Support']
    
    # 功能矩陣 (0=無, 1=有限, 2=完整)
    data = np.array([
        [1, 1, 0, 0, 0],  # Free
        [2, 2, 0, 1, 0],  # Plus
        [3, 3, 2, 2, 2],  # Pro
        [3, 3, 2, 2, 2],  # Family
    ])
    
    fig, ax = plt.subplots(figsize=(10, 6))
    
    colors = ['#FFE5E5', '#FFB3B3', '#FF6B6B']
    cmap = matplotlib.colors.ListedColormap(colors)
    
    im = ax.imshow(data, cmap=cmap, aspect='auto')
    
    ax.set_xticks(np.arange(len(features)))
    ax.set_yticks(np.arange(len(plans)))
    ax.set_xticklabels(features, fontsize=11)
    ax.set_yticklabels(plans, fontsize=11)
    
    # 添加格線
    ax.set_xticks(np.arange(len(features)+1)-.5, minor=True)
    ax.set_yticks(np.arange(len(plans)+1)-.5, minor=True)
    ax.grid(which="minor", color="white", linestyle='-', linewidth=2)
    
    # 添加文字標籤
    labels = [
        ['1', '1', '✗', '✗', '✗'],
        ['3', '4', '✗', '✓', '✗'],
        ['∞', 'All+', '✓', '✓', '✓'],
        ['∞×5', 'All+', '✓', '✓', '✓'],
    ]
    
    for i in range(len(plans)):
        for j in range(len(features)):
            text = ax.text(j, i, labels[i][j], ha="center", va="center", 
                          color="black", fontsize=12, fontweight='bold')
    
    ax.set_title('PetLife Subscription Plans Comparison', fontsize=14, fontweight='bold', pad=20)
    
    plt.tight_layout()
    plt.savefig('/home/ubuntu/pet-social-app/charts/output/subscription_plans.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Created: subscription_plans.png")

# 4. 營收來源分布圓餅圖
def create_revenue_sources_chart():
    labels = ['Subscription', 'Virtual Goods', 'O2O Commission', 'Advertising', 'E-commerce']
    sizes = [45, 15, 20, 10, 10]
    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
    explode = (0.05, 0, 0, 0, 0)
    
    fig, ax = plt.subplots(figsize=(10, 8))
    
    wedges, texts, autotexts = ax.pie(sizes, explode=explode, labels=labels, colors=colors,
                                       autopct='%1.1f%%', shadow=True, startangle=90,
                                       textprops={'fontsize': 11})
    
    for autotext in autotexts:
        autotext.set_fontweight('bold')
        autotext.set_fontsize(12)
    
    ax.set_title('PetLife Revenue Sources Distribution (Year 5)', fontsize=14, fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('/home/ubuntu/pet-social-app/charts/output/revenue_sources.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Created: revenue_sources.png")

# 5. 發展藍圖時間軸
def create_roadmap_chart():
    fig, ax = plt.subplots(figsize=(14, 8))
    
    phases = [
        ('Phase 1\nYear 1', 'Foundation', ['Core Features', 'iOS & Android', '500K Users', 'Community Team'], '#FF6B6B'),
        ('Phase 2\nYear 2', 'Expansion', ['Beauty Booking', 'Pet Matching', 'Advanced AI', 'Japan & Korea'], '#4ECDC4'),
        ('Phase 3\nYear 3', 'Ecosystem', ['Walking Service', 'Pet Hotel', 'Insurance', 'E-commerce'], '#45B7D1'),
        ('Phase 4\nYear 4-5', 'Global', ['Europe & SEA', 'AR Features', 'Pet NFT', 'Metaverse'], '#96CEB4'),
    ]
    
    y_positions = [3, 2, 1, 0]
    
    for i, (phase, title, items, color) in enumerate(phases):
        # 繪製階段方塊
        rect = plt.Rectangle((i*3, y_positions[i]-0.4), 2.8, 0.8, 
                             facecolor=color, edgecolor='white', linewidth=2, alpha=0.8)
        ax.add_patch(rect)
        
        # 階段標題
        ax.text(i*3 + 1.4, y_positions[i], f'{phase}\n{title}', 
               ha='center', va='center', fontsize=11, fontweight='bold', color='white')
        
        # 功能列表
        for j, item in enumerate(items):
            ax.text(i*3 + 1.4, y_positions[i] - 0.7 - j*0.25, f'• {item}', 
                   ha='center', va='top', fontsize=9, color='#333')
    
    # 繪製連接箭頭
    for i in range(3):
        ax.annotate('', xy=(i*3 + 3, y_positions[i+1]), xytext=(i*3 + 2.8, y_positions[i]),
                   arrowprops=dict(arrowstyle='->', color='#666', lw=2))
    
    ax.set_xlim(-0.5, 12.5)
    ax.set_ylim(-2.5, 4)
    ax.axis('off')
    ax.set_title('PetLife Development Roadmap', fontsize=16, fontweight='bold', pad=20)
    
    plt.tight_layout()
    plt.savefig('/home/ubuntu/pet-social-app/charts/output/roadmap.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Created: roadmap.png")

# 6. 競爭對手比較圖
def create_competitor_chart():
    categories = ['3D Pet', 'AI Chat', 'Health Mgmt', 'Social', 'O2O Services']
    
    petlife = [5, 5, 5, 4, 5]
    petzbe = [1, 1, 2, 4, 1]
    pawmates = [1, 1, 1, 4, 2]
    instagram = [1, 1, 1, 5, 1]
    
    angles = np.linspace(0, 2*np.pi, len(categories), endpoint=False).tolist()
    angles += angles[:1]
    
    petlife += petlife[:1]
    petzbe += petzbe[:1]
    pawmates += pawmates[:1]
    instagram += instagram[:1]
    
    fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(polar=True))
    
    ax.plot(angles, petlife, 'o-', linewidth=3, label='PetLife', color='#FF6B6B')
    ax.fill(angles, petlife, alpha=0.25, color='#FF6B6B')
    
    ax.plot(angles, petzbe, 'o-', linewidth=2, label='Petzbe', color='#4ECDC4')
    ax.plot(angles, pawmates, 'o-', linewidth=2, label='Pawmates', color='#45B7D1')
    ax.plot(angles, instagram, 'o-', linewidth=2, label='Instagram', color='#96CEB4')
    
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, fontsize=11)
    ax.set_ylim(0, 5)
    ax.set_yticks([1, 2, 3, 4, 5])
    ax.set_yticklabels(['1', '2', '3', '4', '5'], fontsize=9)
    
    ax.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1), fontsize=11)
    ax.set_title('Competitive Analysis Radar Chart', fontsize=14, fontweight='bold', pad=20)
    
    plt.tight_layout()
    plt.savefig('/home/ubuntu/pet-social-app/charts/output/competitor_radar.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Created: competitor_radar.png")

# 7. 市值達成路徑圖
def create_valuation_path_chart():
    years = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']
    revenue = [2.1, 6.7, 21, 52.5, 126]
    valuation = [16.8, 53.6, 168, 420, 1008]  # 8x revenue multiple
    
    fig, ax = plt.subplots(figsize=(12, 7))
    
    x = np.arange(len(years))
    width = 0.35
    
    bars1 = ax.bar(x - width/2, revenue, width, label='Annual Revenue', color='#4ECDC4', edgecolor='white', linewidth=2)
    bars2 = ax.bar(x + width/2, [v/10 for v in valuation], width, label='Valuation (÷10)', color='#FF6B6B', edgecolor='white', linewidth=2)
    
    # 添加數值標籤
    for bar, rev in zip(bars1, revenue):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1, 
                f'${rev}M', ha='center', va='bottom', fontsize=9, fontweight='bold', color='#4ECDC4')
    
    for bar, val in zip(bars2, valuation):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1, 
                f'${val}M', ha='center', va='bottom', fontsize=9, fontweight='bold', color='#FF6B6B')
    
    # 添加 $1B 目標線
    ax.axhline(y=100.8, color='#FFD700', linestyle='--', linewidth=3, label='$1B Target')
    ax.text(4.5, 103, '$1 Billion', fontsize=12, fontweight='bold', color='#FFD700')
    
    ax.set_xlabel('Year', fontsize=12)
    ax.set_ylabel('Million USD', fontsize=12)
    ax.set_title('Path to $1 Billion Valuation', fontsize=14, fontweight='bold')
    ax.set_xticks(x)
    ax.set_xticklabels(years)
    ax.legend(loc='upper left', fontsize=10)
    ax.set_ylim(0, 130)
    
    plt.tight_layout()
    plt.savefig('/home/ubuntu/pet-social-app/charts/output/valuation_path.png', dpi=150, bbox_inches='tight')
    plt.close()
    print("Created: valuation_path.png")

# 執行所有圖表生成
if __name__ == '__main__':
    print("Generating PetLife Business Plan Charts...")
    create_market_growth_chart()
    create_revenue_forecast_chart()
    create_subscription_chart()
    create_revenue_sources_chart()
    create_roadmap_chart()
    create_competitor_chart()
    create_valuation_path_chart()
    print("\nAll charts generated successfully!")
