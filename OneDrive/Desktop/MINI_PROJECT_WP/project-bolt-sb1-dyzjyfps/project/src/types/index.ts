export type DietTag = 'Jain' | 'High-Protein' | 'Pure Veg' | 'Non-Veg' | 'Low-Cal';

export interface Cook {
  id: string;
  name: string;
  area: string;
  cuisine: string;
  diet_tags: string[];
  veg_only: boolean;
  price_weekly: number;
  price_monthly: number;
  rating: number;
  total_reviews: number;
  total_subscribers: number;
  bio: string;
  image_url: string;
  approved: boolean;
  created_at: string;
}

export interface Menu {
  id: string;
  cook_id: string;
  menu_date: string;
  items: string[];
  created_at: string;
}

export interface Subscription {
  id: string;
  cook_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  plan_type: 'weekly' | 'monthly';
  status: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
}

export interface Skip {
  id: string;
  subscription_id: string;
  cook_id: string;
  skip_date: string;
  reason: string;
  created_at: string;
}

export interface Review {
  id: string;
  cook_id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export interface Complaint {
  id: string;
  cook_id: string | null;
  customer_name: string;
  subject: string;
  description: string;
  status: 'open' | 'resolved' | 'in-progress';
  admin_response: string | null;
  created_at: string;
}
