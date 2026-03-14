import Stripe from 'stripe';

// 初始化 Stripe 客户端
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // Cloudflare Workers 环境配置
  apiVersion: '2026-02-25.clover',
});

// 充值套餐配置（一次性购买时长）
export const PACKAGES = {
  starter: {
    id: 'starter',
    name: '标准包',
    minutes: 60,
    price: 299, // 美分
    originalPrice: 599,
    description: '适合偶尔使用的用户',
  },
  standard: {
    id: 'standard',
    name: '超值包',
    minutes: 150,
    price: 599,
    originalPrice: 899,
    description: '最超值的选择',
    badge: '最受欢迎',
  },
  unlimited: {
    id: 'unlimited',
    name: '无限包',
    minutes: 300,
    price: 999,
    originalPrice: 1499,
    description: '适合频繁使用的用户',
  },
};

// 会员订阅配置（按月/年订阅）
export const SUBSCRIPTION_PLANS = {
  member: {
    id: 'member',
    name: '会员',
    price: 999, // 美分/月
    yearlyPrice: 9999, // 美分/年（省 2 个月）
    benefits: [
      '每月 200 分钟通话时长',
      '高清视频通话',
      '端到端加密',
      '会议录制功能',
      '优先客服支持',
    ],
    badge: null,
  },
  pro: {
    id: 'pro',
    name: '专业会员',
    price: 1999, // 美分/月
    yearlyPrice: 19999, // 美分/年（省 2 个月）
    benefits: [
      '每月 500 分钟通话时长',
      '4K 超清视频',
      '端到端加密',
      '会议录制 + 转录',
      '自定义房间背景',
      '优先客服支持',
      '数据分析报告',
    ],
    badge: '最受欢迎',
  },
  enterprise: {
    id: 'enterprise',
    name: '企业版',
    price: 4999, // 美分/月
    yearlyPrice: 49999, // 美分/年（省 2 个月）
    benefits: [
      '无限通话时长',
      '4K 超清视频',
      '端到端加密',
      '会议录制 + 转录',
      '自定义品牌标识',
      '专属客户经理',
      'SLA 保障',
      'API 访问权限',
    ],
    badge: '适合企业',
  },
};

// 获取套餐信息
export function getPackage(packageId: string) {
  return Object.values(PACKAGES).find(pkg => pkg.id === packageId);
}

// 获取订阅计划信息
export function getSubscriptionPlan(planId: string) {
  return Object.values(SUBSCRIPTION_PLANS).find(plan => plan.id === planId);
}

// 获取订阅计划对应的每月时长
export function getSubscriptionMinutes(planId: string): number {
  const plan = getSubscriptionPlan(planId);
  if (!plan) return 0;

  switch (planId) {
    case 'member':
      return 200;
    case 'pro':
      return 500;
    case 'enterprise':
      return 999999; // 无限时长
    default:
      return 0;
  }
}
