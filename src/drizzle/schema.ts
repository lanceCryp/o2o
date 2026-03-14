import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// 用户表 (Clerk 用户数据同步)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),        // Clerk user ID
  email: text('email').notNull(),
  username: text('username'),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 房间表
export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  hostId: text('host_id').notNull(),  // 房主 ID
  status: text('status').notNull(),   // waiting, active, ended
  dailyRoomName: text('daily_room_name'),  // Daily.co 房间名
  dailyRoomUrl: text('daily_room_url'),    // Daily.co 房间 URL
  startedAt: integer('started_at', { mode: 'timestamp' }),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 房间参与者表
export const participants = sqliteTable('participants', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id),
  userId: text('user_id'),            // 可为空 (匿名用户)
  role: text('role').notNull(),       // host, guest
  joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull(),
  leftAt: integer('left_at', { mode: 'timestamp' }),
});

// 订阅计划表（会员升级）
export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  plan: text('plan').notNull(),       // free, member
  status: text('status').notNull(),   // active, cancelled, expired
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }),
});

// 用户时长账户表
export const userCredits = sqliteTable('user_credits', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  totalMinutes: integer('total_minutes').notNull(),      // 总分钟数
  usedMinutes: integer('used_minutes').notNull().default(0),  // 已用分钟数
  isLifetime: integer('is_lifetime', { mode: 'boolean' }).notNull().default(true), // 是否永久有效
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 订单表
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
  package: text('package').notNull(),         // starter, standard, unlimited
  minutes: integer('minutes').notNull(),
  amount: integer('amount').notNull(),        // 支付金额（美分）
  currency: text('currency').notNull(),       // usd
  status: text('status').notNull(),           // pending, succeeded, failed, refunded
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 免费试用表
export const freeTrials = sqliteTable('free_trials', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  remainingMinutes: integer('remaining_minutes').notNull(),  // 剩余分钟数
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  usedMinutes: integer('used_minutes').notNull().default(0),
});

// 会议邀请令牌表 (一次性)
export const inviteTokens = sqliteTable('invite_tokens', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id),
  token: text('token').notNull().unique(),  // 一次性令牌
  used: integer('used', { mode: 'boolean' }).notNull().default(false),
  joinedBy: text('joined_by'),              // 加入者邮箱 (可选)
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

// 会议记录表
export const meetingRecords = sqliteTable('meeting_records', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id),
  hostId: text('host_id').notNull(),
  guestId: text('guest_id'),                // 可为空 (免登录用户)
  duration: integer('duration').notNull(),  // 时长 (秒)
  type: text('type').notNull(),             // audio, video
  status: text('status').notNull(),         // active, ended, abandoned
  endedBy: text('ended_by'),                // host, guest, system
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// 邮件日志表 (Resend)
export const emailLogs = sqliteTable('email_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(),             // welcome, trial_expiring, upgrade
  status: text('status').notNull(),         // sent, delivered, failed
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  metadata: text('metadata'),               // JSON 额外信息
});
